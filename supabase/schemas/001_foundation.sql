create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_path text,
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

create index campaigns_owner_id_idx on public.campaigns (owner_id);
create index campaign_members_user_id_status_idx
  on public.campaign_members (user_id, status);

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
revoke execute on function private.shares_active_campaign(uuid) from public, anon;
revoke execute on function private.join_campaign_by_code(text) from public, anon;
revoke execute on function public.join_campaign(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_campaign_member(bigint) to authenticated;
grant execute on function private.is_campaign_owner(bigint) to authenticated;
grant execute on function private.shares_active_campaign(uuid) to authenticated;
grant execute on function private.join_campaign_by_code(text) to authenticated;
grant execute on function public.join_campaign(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;

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

grant usage on schema public to authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.campaigns from anon, authenticated;
revoke all on table public.campaign_members from anon, authenticated;
revoke all on sequence public.campaigns_id_seq from anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.campaigns to authenticated;
grant select, insert, update, delete on table public.campaign_members to authenticated;
grant usage, select on sequence public.campaigns_id_seq to authenticated;
