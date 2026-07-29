create function public.start_session(
  requested_session_id bigint,
  replace_existing boolean default false
)
returns public.sessions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target public.sessions;
  conflicting public.sessions;
begin
  select * into target from public.sessions where id = requested_session_id;
  if target.id is null then
    raise exception 'Session not found.' using errcode = 'P0002';
  end if;
  if not (select private.is_campaign_manager(target.campaign_id)) then
    raise exception 'Only a campaign manager can start a session.' using errcode = '42501';
  end if;
  if target.status in ('completed', 'cancelled') then
    raise exception 'A completed or cancelled session cannot be started.' using errcode = '22023';
  end if;
  if target.status in ('active', 'paused') then
    return target;
  end if;

  perform 1 from public.campaigns where id = target.campaign_id for update;
  select * into conflicting
  from public.sessions
  where campaign_id = target.campaign_id
    and id <> target.id
    and status in ('active', 'paused')
  for update;

  if conflicting.id is not null and not replace_existing then
    raise exception 'Another session is already active: %', conflicting.title
      using errcode = 'P0001',
      detail = conflicting.id::text,
      hint = 'Complete the existing session before starting this one, or explicitly replace it.';
  end if;
  if conflicting.id is not null then
    update public.sessions set status = 'completed' where id = conflicting.id;
  end if;
  update public.sessions set status = 'active' where id = target.id returning * into target;
  return target;
end;
$$;

revoke execute on function public.start_session(bigint, boolean) from public, anon;
grant execute on function public.start_session(bigint, boolean) to authenticated;

do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array['sessions', 'session_attendance']
    loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      ) then
        execute format(
          'alter publication supabase_realtime add table public.%I',
          table_name
        );
      end if;
    end loop;
  end if;
end;
$$;
