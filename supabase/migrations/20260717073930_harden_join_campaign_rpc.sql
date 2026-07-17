SET check_function_bodies = false;
CREATE FUNCTION private.join_campaign_by_code(campaign_code text)
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
REVOKE ALL ON FUNCTION private.join_campaign_by_code(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.join_campaign_by_code(text) TO authenticated;
CREATE OR REPLACE FUNCTION public.join_campaign(campaign_code text)
 RETURNS bigint
 LANGUAGE sql
 SECURITY INVOKER
 SET search_path TO ''
AS $function$
  select private.join_campaign_by_code(campaign_code);
$function$;
