create extension if not exists pg_cron with schema pg_catalog;

alter table public.sessions
  add column overtime_prompted_at timestamptz,
  add column overtime_expires_at timestamptz,
  add constraint sessions_overtime_window_check check (
    (overtime_prompted_at is null and overtime_expires_at is null)
    or (
      overtime_prompted_at is not null
      and overtime_expires_at is not null
      and overtime_expires_at > overtime_prompted_at
    )
  );

create function private.process_session_overtime()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.sessions
  set status = 'completed', overtime_prompted_at = null, overtime_expires_at = null
  where status in ('active', 'paused')
    and overtime_expires_at <= statement_timestamp();

  update public.sessions
  set
    overtime_prompted_at = statement_timestamp(),
    overtime_expires_at = statement_timestamp() + interval '30 minutes'
  where status in ('active', 'paused')
    and ends_at <= statement_timestamp()
    and overtime_prompted_at is null;
end;
$$;

create function public.respond_session_overtime(
  requested_session_id bigint,
  continue_session boolean
)
returns public.sessions
language plpgsql
security invoker
set search_path = ''
as $$
declare target public.sessions;
begin
  select * into target from public.sessions where id = requested_session_id;
  if target.id is null then
    raise exception 'Session not found.' using errcode = 'P0002';
  end if;
  if not (select private.is_campaign_manager(target.campaign_id)) then
    raise exception 'Only a campaign manager can respond to this prompt.' using errcode = '42501';
  end if;
  select * into target from public.sessions where id = requested_session_id for update;
  if target.status not in ('active', 'paused') or target.overtime_expires_at is null then
    raise exception 'This session does not have an active overtime prompt.' using errcode = 'P0001';
  end if;

  if continue_session then
    update public.sessions
    set
      ends_at = greatest(ends_at, statement_timestamp()) + interval '1 hour',
      overtime_prompted_at = null,
      overtime_expires_at = null
    where id = target.id
    returning * into target;
  else
    update public.sessions
    set
      status = 'completed',
      overtime_prompted_at = null,
      overtime_expires_at = null
    where id = target.id
    returning * into target;
  end if;
  return target;
end;
$$;

revoke execute on function private.process_session_overtime() from public, anon, authenticated;
revoke execute on function public.respond_session_overtime(bigint, boolean) from public, anon;
grant execute on function public.respond_session_overtime(bigint, boolean) to authenticated;

select cron.schedule(
  'round-table-session-overtime',
  '* * * * *',
  'select private.process_session_overtime();'
);
