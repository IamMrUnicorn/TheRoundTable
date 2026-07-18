SET check_function_bodies = false;
CREATE FUNCTION private.respond_campaign_invitation(invitation_token uuid, should_accept boolean)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  invitation public.campaign_invitations;
  current_user_id uuid := (select auth.uid());
  current_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
begin
  if current_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  select * into invitation from public.campaign_invitations
  where token = invitation_token and status = 'pending' and expires_at > now() and invited_email = current_email
  for update;
  if invitation.id is null then raise exception 'Invitation is invalid, expired, or belongs to another account.' using errcode = 'P0001'; end if;
  if should_accept then
    insert into public.campaign_members (campaign_id, user_id, role, status, joined_at)
    values (invitation.campaign_id, current_user_id, invitation.role, 'active', now())
    on conflict (campaign_id, user_id) do update set role = excluded.role, status = 'active', joined_at = coalesce(public.campaign_members.joined_at, excluded.joined_at), updated_at = now();
  end if;
  update public.campaign_invitations set status = case when should_accept then 'accepted' else 'declined' end where id = invitation.id;
  return invitation.campaign_id;
end;
$function$;
REVOKE ALL ON FUNCTION private.respond_campaign_invitation(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.respond_campaign_invitation(uuid, boolean) TO authenticated;
CREATE FUNCTION public.respond_campaign_invitation(invitation_token uuid, should_accept boolean)
 RETURNS bigint
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.respond_campaign_invitation(invitation_token, should_accept); $function$;
REVOKE ALL ON FUNCTION public.respond_campaign_invitation(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_campaign_invitation(uuid, boolean) TO authenticated;
CREATE TABLE public.campaign_invitations (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, campaign_id bigint NOT NULL, invited_by uuid NOT NULL, invited_email text NOT NULL, role text DEFAULT 'player'::text NOT NULL, token uuid DEFAULT gen_random_uuid() NOT NULL, status text DEFAULT 'pending'::text NOT NULL, expires_at timestamp with time zone DEFAULT (now() + '14 days'::interval) NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.campaign_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_invitations ADD CONSTRAINT campaign_invitations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.campaign_invitations ADD CONSTRAINT campaign_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.campaign_invitations ADD CONSTRAINT campaign_invitations_invited_email_check CHECK (char_length(invited_email) >= 3 AND char_length(invited_email) <= 320);
ALTER TABLE public.campaign_invitations ADD CONSTRAINT campaign_invitations_pkey PRIMARY KEY (id);
ALTER TABLE public.campaign_invitations ADD CONSTRAINT campaign_invitations_role_check CHECK (role = ANY (ARRAY['game_master'::text, 'player'::text, 'observer'::text]));
ALTER TABLE public.campaign_invitations ADD CONSTRAINT campaign_invitations_status_check CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'cancelled'::text, 'expired'::text]));
ALTER TABLE public.campaign_invitations ADD CONSTRAINT campaign_invitations_token_key UNIQUE (token);
REVOKE ALL ON TABLE public.campaign_invitations FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.campaign_invitations_id_seq FROM anon, authenticated;
GRANT DELETE, INSERT, SELECT, UPDATE ON public.campaign_invitations TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.campaign_invitations_id_seq TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.campaign_invitations TO service_role;
CREATE UNIQUE INDEX campaign_invitations_pending_email_idx ON public.campaign_invitations (campaign_id, invited_email) WHERE status = 'pending'::text;
CREATE INDEX campaign_invitations_invited_by_idx ON public.campaign_invitations (invited_by);
CREATE INDEX campaign_invitations_email_status_idx ON public.campaign_invitations (invited_email, status, expires_at);
CREATE TRIGGER campaign_invitations_set_updated_at BEFORE UPDATE ON public.campaign_invitations FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY invitations_delete_managers ON public.campaign_invitations FOR DELETE TO authenticated USING (( SELECT private.is_campaign_manager(campaign_invitations.campaign_id) AS is_campaign_manager));
CREATE POLICY invitations_insert_managers ON public.campaign_invitations FOR INSERT TO authenticated WITH CHECK (((invited_by = ( SELECT auth.uid() AS uid)) AND ( SELECT private.is_campaign_manager(campaign_invitations.campaign_id) AS is_campaign_manager)));
CREATE POLICY invitations_select_manager_or_recipient ON public.campaign_invitations FOR SELECT TO authenticated USING ((( SELECT private.is_campaign_manager(campaign_invitations.campaign_id) AS is_campaign_manager) OR (invited_email = lower(COALESCE((( SELECT auth.jwt()) ->> 'email'::text), ''::text)))));
CREATE POLICY invitations_update_managers ON public.campaign_invitations FOR UPDATE TO authenticated USING (( SELECT private.is_campaign_manager(campaign_invitations.campaign_id) AS is_campaign_manager)) WITH CHECK (( SELECT private.is_campaign_manager(campaign_invitations.campaign_id) AS is_campaign_manager));
