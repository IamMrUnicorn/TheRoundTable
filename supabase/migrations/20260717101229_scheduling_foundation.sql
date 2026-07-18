SET check_function_bodies = false;
CREATE FUNCTION private.is_campaign_manager(requested_campaign_id bigint)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.campaigns where id = requested_campaign_id and owner_id = (select auth.uid())
  ) or exists (
    select 1 from public.campaign_members where campaign_id = requested_campaign_id
      and user_id = (select auth.uid()) and status = 'active' and role in ('owner', 'game_master')
  );
$function$;
REVOKE ALL ON FUNCTION private.is_campaign_manager(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_campaign_manager(bigint) TO authenticated;
CREATE TABLE public.availability_exceptions (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, campaign_id bigint NOT NULL, user_id uuid NOT NULL, starts_at timestamp with time zone NOT NULL, ends_at timestamp with time zone NOT NULL, availability text NOT NULL, note text DEFAULT ''::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_exceptions ADD CONSTRAINT availability_exceptions_availability_check CHECK (availability = ANY (ARRAY['available'::text, 'preferred'::text, 'unavailable'::text]));
ALTER TABLE public.availability_exceptions ADD CONSTRAINT availability_exceptions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.availability_exceptions ADD CONSTRAINT availability_exceptions_check CHECK (ends_at > starts_at);
ALTER TABLE public.availability_exceptions ADD CONSTRAINT availability_exceptions_note_check CHECK (char_length(note) <= 500);
ALTER TABLE public.availability_exceptions ADD CONSTRAINT availability_exceptions_pkey PRIMARY KEY (id);
ALTER TABLE public.availability_exceptions ADD CONSTRAINT availability_exceptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
REVOKE ALL ON TABLE public.availability_exceptions FROM anon, authenticated;
GRANT DELETE, INSERT, SELECT, UPDATE ON public.availability_exceptions TO authenticated;
REVOKE ALL ON SEQUENCE public.availability_exceptions_id_seq FROM anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.availability_exceptions_id_seq TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.availability_exceptions TO service_role;
CREATE INDEX availability_exceptions_user_id_idx ON public.availability_exceptions (user_id);
CREATE INDEX availability_exceptions_campaign_time_idx ON public.availability_exceptions (campaign_id, starts_at, ends_at);
CREATE TRIGGER availability_exceptions_set_updated_at BEFORE UPDATE ON public.availability_exceptions FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY availability_exceptions_delete_own ON public.availability_exceptions FOR DELETE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY availability_exceptions_insert_own ON public.availability_exceptions FOR INSERT TO authenticated WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT private.is_campaign_member(availability_exceptions.campaign_id) AS is_campaign_member)));
CREATE POLICY availability_exceptions_select_members ON public.availability_exceptions FOR SELECT TO authenticated USING (( SELECT private.is_campaign_member(availability_exceptions.campaign_id) AS is_campaign_member));
CREATE POLICY availability_exceptions_update_own ON public.availability_exceptions FOR UPDATE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT private.is_campaign_member(availability_exceptions.campaign_id) AS is_campaign_member)));
CREATE TABLE public.availability_rules (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, campaign_id bigint NOT NULL, user_id uuid NOT NULL, weekday smallint NOT NULL, start_minute smallint NOT NULL, end_minute smallint NOT NULL, preference text DEFAULT 'available'::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_campaign_id_user_id_weekday_start_minute_key UNIQUE (campaign_id, user_id, weekday, start_minute, end_minute);
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_check CHECK (end_minute > start_minute);
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_end_minute_check CHECK (end_minute >= 1 AND end_minute <= 1440);
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_pkey PRIMARY KEY (id);
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_preference_check CHECK (preference = ANY (ARRAY['available'::text, 'preferred'::text]));
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_start_minute_check CHECK (start_minute >= 0 AND start_minute <= 1439);
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.availability_rules ADD CONSTRAINT availability_rules_weekday_check CHECK (weekday >= 0 AND weekday <= 6);
REVOKE ALL ON TABLE public.availability_rules FROM anon, authenticated;
GRANT DELETE, INSERT, SELECT, UPDATE ON public.availability_rules TO authenticated;
REVOKE ALL ON SEQUENCE public.availability_rules_id_seq FROM anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.availability_rules_id_seq TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.availability_rules TO service_role;
CREATE INDEX availability_rules_user_campaign_idx ON public.availability_rules (user_id, campaign_id);
CREATE TRIGGER availability_rules_set_updated_at BEFORE UPDATE ON public.availability_rules FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY availability_rules_delete_own ON public.availability_rules FOR DELETE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY availability_rules_insert_own ON public.availability_rules FOR INSERT TO authenticated WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT private.is_campaign_member(availability_rules.campaign_id) AS is_campaign_member)));
CREATE POLICY availability_rules_select_members ON public.availability_rules FOR SELECT TO authenticated USING (( SELECT private.is_campaign_member(availability_rules.campaign_id) AS is_campaign_member));
CREATE POLICY availability_rules_update_own ON public.availability_rules FOR UPDATE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND ( SELECT private.is_campaign_member(availability_rules.campaign_id) AS is_campaign_member)));
CREATE TABLE public.session_attendance (session_id bigint NOT NULL, user_id uuid NOT NULL, response text DEFAULT 'unanswered'::text NOT NULL, note text DEFAULT ''::text NOT NULL, responded_at timestamp with time zone, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ADD CONSTRAINT session_attendance_note_check CHECK (char_length(note) <= 500);
ALTER TABLE public.session_attendance ADD CONSTRAINT session_attendance_pkey PRIMARY KEY (session_id, user_id);
ALTER TABLE public.session_attendance ADD CONSTRAINT session_attendance_response_check CHECK (response = ANY (ARRAY['unanswered'::text, 'attending'::text, 'tentative'::text, 'absent'::text]));
ALTER TABLE public.session_attendance ADD CONSTRAINT session_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
REVOKE ALL ON TABLE public.session_attendance FROM anon, authenticated;
GRANT DELETE, INSERT, SELECT, UPDATE ON public.session_attendance TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.session_attendance TO service_role;
CREATE INDEX session_attendance_user_id_idx ON public.session_attendance (user_id);
CREATE TRIGGER session_attendance_set_updated_at BEFORE UPDATE ON public.session_attendance FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY attendance_update_own ON public.session_attendance FOR UPDATE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
CREATE TABLE public.sessions (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, campaign_id bigint NOT NULL, created_by uuid NOT NULL, title text NOT NULL, agenda text DEFAULT ''::text NOT NULL, starts_at timestamp with time zone NOT NULL, ends_at timestamp with time zone NOT NULL, status text DEFAULT 'proposed'::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
CREATE POLICY attendance_delete_own_or_manager ON public.session_attendance FOR DELETE TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.sessions
  WHERE ((sessions.id = session_attendance.session_id) AND ( SELECT private.is_campaign_manager(sessions.campaign_id) AS is_campaign_manager))))));
CREATE POLICY attendance_insert_own ON public.session_attendance FOR INSERT TO authenticated WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.sessions
  WHERE ((sessions.id = session_attendance.session_id) AND ( SELECT private.is_campaign_member(sessions.campaign_id) AS is_campaign_member))))));
CREATE POLICY attendance_select_session_members ON public.session_attendance FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.sessions
  WHERE ((sessions.id = session_attendance.session_id) AND ( SELECT private.is_campaign_member(sessions.campaign_id) AS is_campaign_member)))));
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_agenda_check CHECK (char_length(agenda) <= 5000);
ALTER TABLE public.sessions ADD CONSTRAINT sessions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_check CHECK (ends_at > starts_at);
ALTER TABLE public.sessions ADD CONSTRAINT sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.session_attendance ADD CONSTRAINT session_attendance_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_status_check CHECK (status = ANY (ARRAY['proposed'::text, 'scheduled'::text, 'active'::text, 'completed'::text, 'cancelled'::text]));
ALTER TABLE public.sessions ADD CONSTRAINT sessions_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 120);
REVOKE ALL ON TABLE public.sessions FROM anon, authenticated;
GRANT DELETE, INSERT, SELECT, UPDATE ON public.sessions TO authenticated;
REVOKE ALL ON SEQUENCE public.sessions_id_seq FROM anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.sessions_id_seq TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.sessions TO service_role;
CREATE INDEX sessions_created_by_idx ON public.sessions (created_by);
CREATE INDEX sessions_campaign_starts_at_idx ON public.sessions (campaign_id, starts_at);
CREATE TRIGGER sessions_set_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY sessions_delete_managers ON public.sessions FOR DELETE TO authenticated USING (( SELECT private.is_campaign_manager(sessions.campaign_id) AS is_campaign_manager));
CREATE POLICY sessions_insert_managers ON public.sessions FOR INSERT TO authenticated WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) AND ( SELECT private.is_campaign_manager(sessions.campaign_id) AS is_campaign_manager)));
CREATE POLICY sessions_select_members ON public.sessions FOR SELECT TO authenticated USING (( SELECT private.is_campaign_member(sessions.campaign_id) AS is_campaign_member));
CREATE POLICY sessions_update_managers ON public.sessions FOR UPDATE TO authenticated USING (( SELECT private.is_campaign_manager(sessions.campaign_id) AS is_campaign_manager)) WITH CHECK (( SELECT private.is_campaign_manager(sessions.campaign_id) AS is_campaign_manager));
