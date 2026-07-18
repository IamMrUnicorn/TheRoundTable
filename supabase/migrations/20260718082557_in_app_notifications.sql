SET check_function_bodies = false;
CREATE FUNCTION private.notify_campaign_announcement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.notifications (recipient_id, campaign_id, kind, title, body)
  select user_id, new.campaign_id, 'announcement', new.title, left(new.body, 1000)
  from public.campaign_members
  where campaign_id = new.campaign_id and status = 'active' and user_id <> new.author_id;
  return new;
end;
$function$;
REVOKE ALL ON FUNCTION private.notify_campaign_announcement() FROM PUBLIC, anon, authenticated;
CREATE FUNCTION private.notify_session_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;
REVOKE ALL ON FUNCTION private.notify_session_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_after_campaign_announcement AFTER INSERT ON public.campaign_announcements FOR EACH ROW EXECUTE FUNCTION private.notify_campaign_announcement();
CREATE TABLE public.notifications (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, recipient_id uuid NOT NULL, campaign_id bigint, session_id bigint, kind text NOT NULL, title text NOT NULL, body text DEFAULT ''::text NOT NULL, read_at timestamp with time zone, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_body_check CHECK (char_length(body) <= 1000);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY['announcement'::text, 'session_proposed'::text, 'session_updated'::text, 'invitation'::text, 'system'::text]));
ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 200);
REVOKE ALL ON TABLE public.notifications FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.notifications_id_seq FROM anon, authenticated;
GRANT DELETE, SELECT, UPDATE ON public.notifications TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.notifications TO service_role;
CREATE INDEX notifications_session_id_idx ON public.notifications (session_id) WHERE session_id IS NOT NULL;
CREATE INDEX notifications_campaign_id_idx ON public.notifications (campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX notifications_recipient_unread_idx ON public.notifications (recipient_id, created_at DESC) WHERE read_at IS NULL;
CREATE POLICY notifications_delete_own ON public.notifications FOR DELETE TO authenticated USING ((recipient_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY notifications_select_own ON public.notifications FOR SELECT TO authenticated USING ((recipient_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE TO authenticated USING ((recipient_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((recipient_id = ( SELECT auth.uid() AS uid)));
CREATE TRIGGER notify_after_session_insert AFTER INSERT ON public.sessions FOR EACH ROW EXECUTE FUNCTION private.notify_session_change();
CREATE TRIGGER notify_after_session_schedule_change AFTER UPDATE OF starts_at, ends_at, status ON public.sessions FOR EACH ROW WHEN (old.* IS DISTINCT FROM new.*) EXECUTE FUNCTION private.notify_session_change();
