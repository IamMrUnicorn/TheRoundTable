create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_path text,
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
    check (invite_code ~ '^[A-F0-9]{8}$'),
  description text not null default '' check (char_length(description) <= 2000),
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 100),
  cadence text not null default 'weekly'
    check (cadence in ('weekly', 'biweekly', 'monthly', 'irregular')),
  preferred_session_minutes smallint not null default 180
    check (preferred_session_minutes between 30 and 720),
  status text not null default 'forming'
    check (status in ('forming', 'active', 'paused', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_members (
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'player' check (role in ('owner', 'game_master', 'player', 'observer')),
  status text not null default 'active' check (status in ('invited', 'active', 'declined', 'removed')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

create table public.characters (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id bigint references public.campaigns (id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  ancestry text not null default '' check (char_length(ancestry) <= 80),
  class_name text not null default '' check (char_length(class_name) <= 80),
  subclass text not null default '' check (char_length(subclass) <= 80),
  background text not null default '' check (char_length(background) <= 120),
  level smallint not null default 1 check (level between 1 and 20),
  armor_class smallint not null default 10 check (armor_class between 0 and 99),
  current_hp integer not null default 1 check (current_hp between 0 and 9999),
  max_hp integer not null default 1 check (max_hp between 1 and 9999),
  speed smallint not null default 30 check (speed between 0 and 999),
  strength smallint not null default 10 check (strength between 1 and 30),
  dexterity smallint not null default 10 check (dexterity between 1 and 30),
  constitution smallint not null default 10 check (constitution between 1 and 30),
  intelligence smallint not null default 10 check (intelligence between 1 and 30),
  wisdom smallint not null default 10 check (wisdom between 1 and 30),
  charisma smallint not null default 10 check (charisma between 1 and 30),
  notes text not null default '' check (char_length(notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (current_hp <= max_hp)
);

create table public.availability_rules (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_minute smallint not null check (start_minute between 0 and 1439),
  end_minute smallint not null check (end_minute between 1 and 1440),
  preference text not null default 'available'
    check (preference in ('available', 'preferred')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_minute > start_minute),
  unique (campaign_id, user_id, weekday, start_minute, end_minute)
);

create table public.availability_exceptions (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  availability text not null check (availability in ('available', 'preferred', 'unavailable')),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.sessions (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 120),
  agenda text not null default '' check (char_length(agenda) <= 5000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'proposed'
    check (status in ('proposed', 'scheduled', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.session_attendance (
  session_id bigint not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  response text not null default 'unanswered'
    check (response in ('unanswered', 'attending', 'tentative', 'absent')),
  note text not null default '' check (char_length(note) <= 500),
  responded_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table public.campaign_announcements (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 5000),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id bigint references public.campaigns (id) on delete cascade,
  session_id bigint references public.sessions (id) on delete cascade,
  kind text not null check (kind in ('announcement', 'session_proposed', 'session_updated', 'invitation', 'system')),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index campaigns_owner_id_idx on public.campaigns (owner_id);
create index campaign_members_user_id_status_idx
  on public.campaign_members (user_id, status);
create index characters_owner_id_idx on public.characters (owner_id);
create index characters_campaign_id_idx on public.characters (campaign_id)
  where campaign_id is not null;
create index availability_rules_user_campaign_idx on public.availability_rules (user_id, campaign_id);
create index availability_exceptions_campaign_time_idx on public.availability_exceptions (campaign_id, starts_at, ends_at);
create index availability_exceptions_user_id_idx on public.availability_exceptions (user_id);
create index sessions_campaign_starts_at_idx on public.sessions (campaign_id, starts_at);
create index sessions_created_by_idx on public.sessions (created_by);
create index session_attendance_user_id_idx on public.session_attendance (user_id);
create index campaign_announcements_campaign_pinned_idx on public.campaign_announcements (campaign_id, is_pinned desc, created_at desc);
create index campaign_announcements_author_id_idx on public.campaign_announcements (author_id);
create index notifications_recipient_unread_idx on public.notifications (recipient_id, created_at desc) where read_at is null;
create index notifications_campaign_id_idx on public.notifications (campaign_id) where campaign_id is not null;
create index notifications_session_id_idx on public.notifications (session_id) where session_id is not null;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger campaigns_set_updated_at
before update on public.campaigns
for each row execute function private.set_updated_at();

create trigger campaign_members_set_updated_at
before update on public.campaign_members
for each row execute function private.set_updated_at();

create trigger characters_set_updated_at
before update on public.characters
for each row execute function private.set_updated_at();

create trigger availability_rules_set_updated_at before update on public.availability_rules for each row execute function private.set_updated_at();
create trigger availability_exceptions_set_updated_at before update on public.availability_exceptions for each row execute function private.set_updated_at();
create trigger sessions_set_updated_at before update on public.sessions for each row execute function private.set_updated_at();
create trigger session_attendance_set_updated_at before update on public.session_attendance for each row execute function private.set_updated_at();
create trigger campaign_announcements_set_updated_at before update on public.campaign_announcements for each row execute function private.set_updated_at();

create function private.notify_campaign_announcement()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (recipient_id, campaign_id, kind, title, body)
  select user_id, new.campaign_id, 'announcement', new.title, left(new.body, 1000)
  from public.campaign_members
  where campaign_id = new.campaign_id and status = 'active' and user_id <> new.author_id;
  return new;
end;
$$;

create function private.notify_session_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (recipient_id, campaign_id, session_id, kind, title, body)
  select user_id, new.campaign_id, new.id,
    case when tg_op = 'INSERT' then 'session_proposed' else 'session_updated' end,
    case when tg_op = 'INSERT' then 'New session proposed' else 'Session updated' end,
    new.title
  from public.campaign_members
  where campaign_id = new.campaign_id and status = 'active' and user_id <> (select auth.uid());
  return new;
end;
$$;

revoke execute on function private.notify_campaign_announcement() from public, anon, authenticated;
revoke execute on function private.notify_session_change() from public, anon, authenticated;

create trigger notify_after_campaign_announcement after insert on public.campaign_announcements for each row execute function private.notify_campaign_announcement();
create trigger notify_after_session_insert after insert on public.sessions for each row execute function private.notify_session_change();
create trigger notify_after_session_schedule_change after update of starts_at, ends_at, status on public.sessions for each row when (old.* is distinct from new.*) execute function private.notify_session_change();

create function private.add_campaign_owner_as_member()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.campaign_members (
    campaign_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (new.id, new.owner_id, 'owner', 'active', now());
  return new;
end;
$$;

create trigger add_campaign_owner_after_insert
after insert on public.campaigns
for each row execute function private.add_campaign_owner_as_member();

create function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, 'adventurer'), '@', 1)
    )
  );
  return new;
end;
$$;

create trigger create_profile_after_signup
after insert on auth.users
for each row execute function private.create_profile_for_new_user();

create function private.is_campaign_member(requested_campaign_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaign_members
    where campaign_id = requested_campaign_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$$;

create function private.is_campaign_owner(requested_campaign_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaigns
    where id = requested_campaign_id
      and owner_id = (select auth.uid())
  );
$$;

create function private.is_campaign_manager(requested_campaign_id bigint)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.campaigns where id = requested_campaign_id and owner_id = (select auth.uid())
  ) or exists (
    select 1 from public.campaign_members where campaign_id = requested_campaign_id
      and user_id = (select auth.uid()) and status = 'active' and role in ('owner', 'game_master')
  );
$$;

create function private.shares_active_campaign(requested_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaign_members viewer_membership
    join public.campaign_members requested_membership
      on requested_membership.campaign_id = viewer_membership.campaign_id
    where viewer_membership.user_id = (select auth.uid())
      and viewer_membership.status = 'active'
      and requested_membership.user_id = requested_user_id
      and requested_membership.status = 'active'
  );
$$;

create function private.join_campaign_by_code(campaign_code text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  requested_campaign_id bigint;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select id
  into requested_campaign_id
  from public.campaigns
  where invite_code = upper(trim(campaign_code))
    and status in ('forming', 'active', 'paused');

  if requested_campaign_id is null then
    raise exception 'Campaign code is invalid or the campaign is unavailable.'
      using errcode = 'P0001';
  end if;

  insert into public.campaign_members (
    campaign_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (requested_campaign_id, current_user_id, 'player', 'active', now())
  on conflict (campaign_id, user_id) do update
  set status = 'active',
      joined_at = coalesce(public.campaign_members.joined_at, excluded.joined_at),
      updated_at = now()
  where public.campaign_members.status in ('declined', 'removed');

  return requested_campaign_id;
end;
$$;

create function public.join_campaign(campaign_code text)
returns bigint
language sql
security invoker
set search_path = ''
as $$
  select private.join_campaign_by_code(campaign_code);
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;
revoke execute on function private.create_profile_for_new_user() from public, anon, authenticated;
revoke execute on function private.add_campaign_owner_as_member() from public, anon, authenticated;
revoke execute on function private.is_campaign_member(bigint) from public, anon;
revoke execute on function private.is_campaign_owner(bigint) from public, anon;
revoke execute on function private.is_campaign_manager(bigint) from public, anon;
revoke execute on function private.shares_active_campaign(uuid) from public, anon;
revoke execute on function private.join_campaign_by_code(text) from public, anon;
revoke execute on function public.join_campaign(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_campaign_member(bigint) to authenticated;
grant execute on function private.is_campaign_owner(bigint) to authenticated;
grant execute on function private.is_campaign_manager(bigint) to authenticated;
grant execute on function private.shares_active_campaign(uuid) to authenticated;
grant execute on function private.join_campaign_by_code(text) to authenticated;
grant execute on function public.join_campaign(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.characters enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.sessions enable row level security;
alter table public.session_attendance enable row level security;
alter table public.campaign_announcements enable row level security;
alter table public.notifications enable row level security;

create policy profiles_select_own
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.shares_active_campaign(id))
);

create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy campaigns_select_member
on public.campaigns for select
to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.is_campaign_member(id))
);

create policy campaigns_insert_owner
on public.campaigns for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy campaigns_update_owner
on public.campaigns for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy campaigns_delete_owner
on public.campaigns for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy campaign_members_select_campaign
on public.campaign_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_campaign_member(campaign_id))
  or (select private.is_campaign_owner(campaign_id))
);

create policy campaign_members_insert_owner
on public.campaign_members for insert
to authenticated
with check ((select private.is_campaign_owner(campaign_id)));

create policy campaign_members_update_owner
on public.campaign_members for update
to authenticated
using ((select private.is_campaign_owner(campaign_id)))
with check ((select private.is_campaign_owner(campaign_id)));

create policy campaign_members_delete_owner_or_self
on public.campaign_members for delete
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_campaign_owner(campaign_id))
);

create policy characters_select_owner_or_campaign_member
on public.characters for select
to authenticated
using (
  owner_id = (select auth.uid())
  or (
    campaign_id is not null
    and (select private.is_campaign_member(campaign_id))
  )
);

create policy characters_insert_owner
on public.characters for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (
    campaign_id is null
    or (select private.is_campaign_member(campaign_id))
  )
);

create policy characters_update_owner
on public.characters for update
to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and (
    campaign_id is null
    or (select private.is_campaign_member(campaign_id))
  )
);

create policy characters_delete_owner
on public.characters for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy availability_rules_select_members on public.availability_rules for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy availability_rules_insert_own on public.availability_rules for insert to authenticated with check (user_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy availability_rules_update_own on public.availability_rules for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy availability_rules_delete_own on public.availability_rules for delete to authenticated using (user_id = (select auth.uid()));

create policy availability_exceptions_select_members on public.availability_exceptions for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy availability_exceptions_insert_own on public.availability_exceptions for insert to authenticated with check (user_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy availability_exceptions_update_own on public.availability_exceptions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy availability_exceptions_delete_own on public.availability_exceptions for delete to authenticated using (user_id = (select auth.uid()));

create policy sessions_select_members on public.sessions for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy sessions_insert_managers on public.sessions for insert to authenticated with check (created_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy sessions_update_managers on public.sessions for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy sessions_delete_managers on public.sessions for delete to authenticated using ((select private.is_campaign_manager(campaign_id)));

create policy attendance_select_session_members on public.session_attendance for select to authenticated using (exists (select 1 from public.sessions where id = session_id and (select private.is_campaign_member(campaign_id))));
create policy attendance_insert_own on public.session_attendance for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.sessions where id = session_id and (select private.is_campaign_member(campaign_id))));
create policy attendance_update_own on public.session_attendance for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy attendance_delete_own_or_manager on public.session_attendance for delete to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.sessions where id = session_id and (select private.is_campaign_manager(campaign_id))));

create policy announcements_select_members on public.campaign_announcements for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy announcements_insert_managers on public.campaign_announcements for insert to authenticated with check (author_id = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy announcements_update_managers on public.campaign_announcements for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy announcements_delete_managers on public.campaign_announcements for delete to authenticated using ((select private.is_campaign_manager(campaign_id)));

create policy notifications_select_own on public.notifications for select to authenticated using (recipient_id = (select auth.uid()));
create policy notifications_update_own on public.notifications for update to authenticated using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy notifications_delete_own on public.notifications for delete to authenticated using (recipient_id = (select auth.uid()));

grant usage on schema public to authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.campaigns from anon, authenticated;
revoke all on table public.campaign_members from anon, authenticated;
revoke all on table public.characters from anon, authenticated;
revoke all on table public.availability_rules, public.availability_exceptions, public.sessions, public.session_attendance from anon, authenticated;
revoke all on table public.campaign_announcements from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;
revoke all on sequence public.campaigns_id_seq from anon, authenticated;
revoke all on sequence public.characters_id_seq from anon, authenticated;
revoke all on sequence public.availability_rules_id_seq, public.availability_exceptions_id_seq, public.sessions_id_seq from anon, authenticated;
revoke all on sequence public.campaign_announcements_id_seq from anon, authenticated;
revoke all on sequence public.notifications_id_seq from anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.campaigns to authenticated;
grant select, insert, update, delete on table public.campaign_members to authenticated;
grant select, insert, update, delete on table public.characters to authenticated;
grant select, insert, update, delete on table public.availability_rules, public.availability_exceptions, public.sessions, public.session_attendance to authenticated;
grant select, insert, update, delete on table public.campaign_announcements to authenticated;
grant select, update, delete on table public.notifications to authenticated;
grant usage, select on sequence public.campaigns_id_seq to authenticated;
grant usage, select on sequence public.characters_id_seq to authenticated;
grant usage, select on sequence public.availability_rules_id_seq, public.availability_exceptions_id_seq, public.sessions_id_seq to authenticated;
grant usage, select on sequence public.campaign_announcements_id_seq to authenticated;
