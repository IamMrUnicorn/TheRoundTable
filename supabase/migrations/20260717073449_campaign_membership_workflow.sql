SET check_function_bodies = false;
DROP POLICY profiles_select_own ON public.profiles;
CREATE FUNCTION private.add_campaign_owner_as_member()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$;
REVOKE ALL ON FUNCTION private.add_campaign_owner_as_member() FROM PUBLIC, anon, authenticated;
CREATE FUNCTION private.shares_active_campaign(requested_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;
REVOKE ALL ON FUNCTION private.shares_active_campaign(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.shares_active_campaign(uuid) TO authenticated;
CREATE FUNCTION public.join_campaign(campaign_code text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;
REVOKE ALL ON FUNCTION public.join_campaign(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_campaign(text) TO authenticated;
ALTER TABLE public.campaigns ADD COLUMN invite_code text DEFAULT upper(substr(replace((gen_random_uuid())::text, '-'::text, ''::text), 1, 8)) NOT NULL;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_invite_code_check CHECK (invite_code ~ '^[A-F0-9]{8}$'::text);
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_invite_code_key UNIQUE (invite_code);
CREATE TRIGGER add_campaign_owner_after_insert AFTER INSERT ON public.campaigns FOR EACH ROW EXECUTE FUNCTION private.add_campaign_owner_as_member();
INSERT INTO public.campaign_members (campaign_id, user_id, role, status, joined_at)
SELECT id, owner_id, 'owner', 'active', created_at
FROM public.campaigns
ON CONFLICT (campaign_id, user_id) DO NOTHING;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (((id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.shares_active_campaign(profiles.id) AS shares_active_campaign)));
