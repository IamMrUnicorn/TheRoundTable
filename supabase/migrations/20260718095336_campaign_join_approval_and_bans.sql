SET check_function_bodies = false;
ALTER TABLE public.campaign_members DROP CONSTRAINT campaign_members_status_check;
DROP POLICY campaign_members_select_campaign ON public.campaign_members;
CREATE OR REPLACE FUNCTION private.join_campaign_by_code(campaign_code text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_user_id uuid := (select auth.uid());
  requested_campaign_id bigint;
  approval_required boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select id, requires_join_approval
  into requested_campaign_id, approval_required
  from public.campaigns
  where invite_code = upper(trim(campaign_code))
    and status in ('forming', 'active', 'paused');

  if requested_campaign_id is null then
    raise exception 'Campaign code is invalid or the campaign is unavailable.'
      using errcode = 'P0001';
  end if;

  if exists (select 1 from public.campaign_members where campaign_id = requested_campaign_id and user_id = current_user_id and status = 'banned') then
    raise exception 'You have been banned from this campaign.' using errcode = '42501';
  end if;

  insert into public.campaign_members (
    campaign_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (requested_campaign_id, current_user_id, 'player', case when approval_required then 'pending' else 'active' end, case when approval_required then null else now() end)
  on conflict (campaign_id, user_id) do update
  set status = excluded.status,
      joined_at = case when excluded.status = 'active' then coalesce(public.campaign_members.joined_at, excluded.joined_at) else null end,
      updated_at = now()
  where public.campaign_members.status in ('declined', 'removed', 'pending');

  return requested_campaign_id;
end;
$function$;
ALTER TABLE public.campaign_members ADD CONSTRAINT campaign_members_status_check CHECK (status = ANY (ARRAY['invited'::text, 'pending'::text, 'active'::text, 'declined'::text, 'removed'::text, 'banned'::text]));
CREATE POLICY campaign_members_select_campaign ON public.campaign_members FOR SELECT TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) OR ((status = 'active'::text) AND ( SELECT private.is_campaign_member(campaign_members.campaign_id) AS is_campaign_member)) OR ( SELECT private.is_campaign_manager(campaign_members.campaign_id) AS is_campaign_manager)));
ALTER TABLE public.campaigns ADD COLUMN requires_join_approval boolean DEFAULT false NOT NULL;
