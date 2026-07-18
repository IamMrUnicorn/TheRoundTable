CREATE UNIQUE INDEX sessions_one_active_per_campaign_idx ON public.sessions (campaign_id) WHERE status = 'active'::text;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'session_events'
    ) then
    execute 'alter publication supabase_realtime add table public.session_events';
  end if;
end;
$$;
