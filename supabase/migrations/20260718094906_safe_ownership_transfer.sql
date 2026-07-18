SET check_function_bodies = false;
CREATE FUNCTION private.transfer_campaign_ownership(requested_campaign_id bigint, new_owner_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  perform 1 from public.campaigns
  where id = requested_campaign_id and owner_id = current_user_id
  for update;
  if not found then
    raise exception 'Only the campaign owner can transfer ownership.' using errcode = '42501';
  end if;
  if new_owner_id = current_user_id then
    raise exception 'The selected member already owns this campaign.' using errcode = 'P0001';
  end if;
  perform 1 from public.campaign_members
  where campaign_id = requested_campaign_id and user_id = new_owner_id and status = 'active'
  for update;
  if not found then
    raise exception 'Ownership can only be transferred to an active member.' using errcode = 'P0001';
  end if;

  update public.campaign_members set role = 'game_master'
  where campaign_id = requested_campaign_id and user_id = current_user_id;
  update public.campaign_members set role = 'owner'
  where campaign_id = requested_campaign_id and user_id = new_owner_id;
  update public.campaigns set owner_id = new_owner_id
  where id = requested_campaign_id;
end;
$function$;
REVOKE EXECUTE ON FUNCTION private.transfer_campaign_ownership(bigint, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.transfer_campaign_ownership(bigint, uuid) TO authenticated;
CREATE FUNCTION public.transfer_campaign_ownership(campaign_id bigint, new_owner_id uuid)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.transfer_campaign_ownership(campaign_id, new_owner_id);
$function$;
REVOKE EXECUTE ON FUNCTION public.transfer_campaign_ownership(bigint, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_campaign_ownership(bigint, uuid) TO authenticated;
