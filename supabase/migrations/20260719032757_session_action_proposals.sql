create table public.session_action_proposals (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.sessions (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  character_id bigint references public.characters (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  kind text not null check (kind in ('attack', 'magic', 'item', 'movement', 'speech', 'custom')),
  title text not null check (char_length(title) between 1 and 160),
  details text not null default '' check (char_length(details) <= 5000),
  approval_mode text not null default 'soft' check (approval_mode in ('soft', 'hard')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied', 'clarification')),
  reviewer_note text not null default '' check (char_length(reviewer_note) <= 2000),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index session_action_proposals_session_created_idx on public.session_action_proposals (session_id, created_at desc);
create index session_action_proposals_campaign_id_idx on public.session_action_proposals (campaign_id);
create index session_action_proposals_character_id_idx on public.session_action_proposals (character_id) where character_id is not null;
create index session_action_proposals_created_by_idx on public.session_action_proposals (created_by);
create index session_action_proposals_reviewed_by_idx on public.session_action_proposals (reviewed_by) where reviewed_by is not null;
create trigger session_action_proposals_set_updated_at before update on public.session_action_proposals for each row execute function private.set_updated_at();
alter table public.session_action_proposals enable row level security;
create policy action_proposals_select_members on public.session_action_proposals for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy action_proposals_insert_own on public.session_action_proposals for insert to authenticated with check (created_by = (select auth.uid()) and reviewed_by is null and reviewed_at is null and ((approval_mode = 'soft' and status = 'approved') or (approval_mode = 'hard' and status = 'pending')) and exists (select 1 from public.sessions where id = session_id and sessions.campaign_id = session_action_proposals.campaign_id and sessions.status in ('active', 'paused')) and (character_id is null or exists (select 1 from public.characters where id = character_id and characters.campaign_id = session_action_proposals.campaign_id and characters.owner_id = (select auth.uid()))));
create policy action_proposals_update_managers on public.session_action_proposals for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
grant select, insert, update on table public.session_action_proposals to authenticated;
grant usage, select on sequence public.session_action_proposals_id_seq to authenticated;
