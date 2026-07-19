create table public.session_encounters (
  session_id bigint primary key references public.sessions (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  round_number integer not null default 1 check (round_number between 1 and 999999),
  active_character_id bigint references public.characters (id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.session_initiative_entries (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.sessions (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  character_id bigint not null references public.characters (id) on delete cascade,
  initiative integer not null check (initiative between -100 and 200),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (session_id, character_id)
);
create index session_encounters_campaign_id_idx on public.session_encounters (campaign_id);
create index session_encounters_active_character_id_idx on public.session_encounters (active_character_id);
create index session_initiative_entries_campaign_id_idx on public.session_initiative_entries (campaign_id);
create index session_initiative_entries_character_id_idx on public.session_initiative_entries (character_id);
create trigger session_encounters_set_updated_at before update on public.session_encounters for each row execute function private.set_updated_at();
create trigger session_initiative_entries_set_updated_at before update on public.session_initiative_entries for each row execute function private.set_updated_at();
alter table public.session_encounters enable row level security;
alter table public.session_initiative_entries enable row level security;
create policy session_encounters_select_members on public.session_encounters for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy session_encounters_insert_managers on public.session_encounters for insert to authenticated with check ((select private.is_campaign_manager(campaign_id)) and exists (select 1 from public.sessions where id = session_id and sessions.campaign_id = session_encounters.campaign_id));
create policy session_encounters_update_managers on public.session_encounters for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy session_encounters_delete_managers on public.session_encounters for delete to authenticated using ((select private.is_campaign_manager(campaign_id)));
create policy initiative_entries_select_members on public.session_initiative_entries for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy initiative_entries_insert_allowed on public.session_initiative_entries for insert to authenticated with check (created_by = (select auth.uid()) and exists (select 1 from public.sessions where id = session_id and sessions.campaign_id = session_initiative_entries.campaign_id) and exists (select 1 from public.characters where id = character_id and characters.campaign_id = session_initiative_entries.campaign_id and (characters.owner_id = (select auth.uid()) or (select private.is_campaign_manager(session_initiative_entries.campaign_id)))));
create policy initiative_entries_update_allowed on public.session_initiative_entries for update to authenticated using ((select private.is_campaign_manager(campaign_id)) or exists (select 1 from public.characters where id = character_id and owner_id = (select auth.uid()))) with check ((select private.is_campaign_manager(campaign_id)) or exists (select 1 from public.characters where id = character_id and owner_id = (select auth.uid())));
create policy initiative_entries_delete_allowed on public.session_initiative_entries for delete to authenticated using ((select private.is_campaign_manager(campaign_id)) or exists (select 1 from public.characters where id = character_id and owner_id = (select auth.uid())));
grant select, insert, update, delete on table public.session_encounters, public.session_initiative_entries to authenticated;
grant usage, select on sequence public.session_initiative_entries_id_seq to authenticated;
