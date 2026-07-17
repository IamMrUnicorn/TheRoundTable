SET check_function_bodies = false;
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
      FROM public, anon, authenticated;
  END IF;
END;
$$;
CREATE SCHEMA private AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;
CREATE FUNCTION private.create_profile_for_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;
CREATE TRIGGER create_profile_after_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION private.create_profile_for_new_user();
CREATE FUNCTION private.is_campaign_member(requested_campaign_id bigint)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.campaign_members
    where campaign_id = requested_campaign_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$function$;
CREATE FUNCTION private.is_campaign_owner(requested_campaign_id bigint)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.campaigns
    where id = requested_campaign_id
      and owner_id = (select auth.uid())
  );
$function$;
CREATE FUNCTION private.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
CREATE TABLE public.campaign_members (campaign_id bigint NOT NULL, user_id uuid NOT NULL, role text DEFAULT 'player'::text NOT NULL, status text DEFAULT 'active'::text NOT NULL, joined_at timestamp with time zone, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ADD CONSTRAINT campaign_members_pkey PRIMARY KEY (campaign_id, user_id);
ALTER TABLE public.campaign_members ADD CONSTRAINT campaign_members_role_check CHECK (role = ANY (ARRAY['owner'::text, 'game_master'::text, 'player'::text, 'observer'::text]));
ALTER TABLE public.campaign_members ADD CONSTRAINT campaign_members_status_check CHECK (status = ANY (ARRAY['invited'::text, 'active'::text, 'declined'::text, 'removed'::text]));
CREATE INDEX campaign_members_user_id_status_idx ON public.campaign_members (user_id, status);
CREATE TRIGGER campaign_members_set_updated_at BEFORE UPDATE ON public.campaign_members FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY campaign_members_delete_owner_or_self ON public.campaign_members FOR DELETE TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_campaign_owner(campaign_members.campaign_id) AS is_campaign_owner)));
CREATE POLICY campaign_members_insert_owner ON public.campaign_members FOR INSERT TO authenticated WITH CHECK (( SELECT private.is_campaign_owner(campaign_members.campaign_id) AS is_campaign_owner));
CREATE POLICY campaign_members_select_campaign ON public.campaign_members FOR SELECT TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_campaign_member(campaign_members.campaign_id) AS is_campaign_member) OR ( SELECT private.is_campaign_owner(campaign_members.campaign_id) AS is_campaign_owner)));
CREATE POLICY campaign_members_update_owner ON public.campaign_members FOR UPDATE TO authenticated USING (( SELECT private.is_campaign_owner(campaign_members.campaign_id) AS is_campaign_owner)) WITH CHECK (( SELECT private.is_campaign_owner(campaign_members.campaign_id) AS is_campaign_owner));
CREATE TABLE public.campaigns (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, owner_id uuid NOT NULL, name text NOT NULL, slug text NOT NULL, description text DEFAULT ''::text NOT NULL, status text DEFAULT 'forming'::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_description_check CHECK (char_length(description) <= 2000);
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 100);
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);
ALTER TABLE public.campaign_members ADD CONSTRAINT campaign_members_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_slug_check CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text);
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_slug_key UNIQUE (slug);
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check CHECK (status = ANY (ARRAY['forming'::text, 'active'::text, 'paused'::text, 'completed'::text, 'archived'::text]));
CREATE INDEX campaigns_owner_id_idx ON public.campaigns (owner_id);
CREATE TRIGGER campaigns_set_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY campaigns_delete_owner ON public.campaigns FOR DELETE TO authenticated USING ((owner_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY campaigns_insert_owner ON public.campaigns FOR INSERT TO authenticated WITH CHECK ((owner_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY campaigns_select_member ON public.campaigns FOR SELECT TO authenticated USING (((owner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_campaign_member(campaigns.id) AS is_campaign_member)));
CREATE POLICY campaigns_update_owner ON public.campaigns FOR UPDATE TO authenticated USING ((owner_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((owner_id = ( SELECT auth.uid() AS uid)));
CREATE TABLE public.profiles (id uuid NOT NULL, display_name text NOT NULL, avatar_path text, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_display_name_check CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 80);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.campaign_members ADD CONSTRAINT campaign_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING ((id = ( SELECT auth.uid() AS uid)));
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING ((id = ( SELECT auth.uid() AS uid))) WITH CHECK ((id = ( SELECT auth.uid() AS uid)));
REVOKE EXECUTE ON FUNCTION private.set_updated_at() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.create_profile_for_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.is_campaign_member(bigint) FROM public, anon;
REVOKE EXECUTE ON FUNCTION private.is_campaign_owner(bigint) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.is_campaign_member(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_campaign_owner(bigint) TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.campaigns FROM anon, authenticated;
REVOKE ALL ON TABLE public.campaign_members FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.campaigns_id_seq FROM anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaign_members TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.campaigns_id_seq TO authenticated;
