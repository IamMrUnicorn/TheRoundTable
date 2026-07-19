alter table public.session_attendance
  add column ready_at timestamptz;

alter table public.sessions
  drop constraint sessions_status_check;

alter table public.sessions
  add constraint sessions_status_check
  check (status in ('proposed', 'scheduled', 'active', 'paused', 'completed', 'cancelled'));

drop index public.sessions_one_active_per_campaign_idx;

create unique index sessions_one_active_per_campaign_idx
  on public.sessions (campaign_id)
  where status in ('active', 'paused');
