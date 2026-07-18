SET check_function_bodies = false;
CREATE FUNCTION private.record_session_event_memory()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.character_id is null or new.visibility <> 'party' then
    return new;
  end if;

  insert into public.character_memories (
    character_id, created_by, campaign_id, session_id, kind, visibility,
    title, summary, occurred_at, in_world_time, location, source_name,
    source_reference, tags, metadata
  ) values (
    new.character_id, new.actor_id, new.campaign_id, new.session_id,
    case when new.kind in ('damage', 'healing', 'condition', 'item', 'discovery', 'location', 'objective', 'rest', 'roll', 'action') then new.kind else 'other' end,
    'shared', new.title, new.body, new.occurred_at, new.in_world_time,
    new.location, 'Session event', 'session_events:' || new.id,
    array['session', new.kind],
    new.metadata || jsonb_build_object('session_event_id', new.id, 'event_kind', new.kind)
  );
  return new;
end;
$function$;
REVOKE ALL ON FUNCTION private.record_session_event_memory() FROM PUBLIC, anon, authenticated;
CREATE TABLE public.session_events (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, session_id bigint NOT NULL, campaign_id bigint NOT NULL, actor_id uuid NOT NULL, character_id bigint, kind text DEFAULT 'note'::text NOT NULL, visibility text DEFAULT 'party'::text NOT NULL, title text NOT NULL, body text DEFAULT ''::text NOT NULL, in_world_time text DEFAULT ''::text NOT NULL, location text DEFAULT ''::text NOT NULL, round_number integer, sequence_number integer DEFAULT 0 NOT NULL, metadata jsonb DEFAULT '{}'::jsonb NOT NULL, occurred_at timestamp with time zone DEFAULT now() NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_events ADD CONSTRAINT session_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.session_events ADD CONSTRAINT session_events_body_check CHECK (char_length(body) <= 10000);
ALTER TABLE public.session_events ADD CONSTRAINT session_events_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.session_events ADD CONSTRAINT session_events_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters(id) ON DELETE SET NULL;
ALTER TABLE public.session_events ADD CONSTRAINT session_events_in_world_time_check CHECK (char_length(in_world_time) <= 160);
ALTER TABLE public.session_events ADD CONSTRAINT session_events_kind_check CHECK (kind = ANY (ARRAY['narration'::text, 'dialogue'::text, 'action'::text, 'roll'::text, 'damage'::text, 'healing'::text, 'condition'::text, 'item'::text, 'discovery'::text, 'location'::text, 'objective'::text, 'rest'::text, 'system'::text, 'note'::text]));
ALTER TABLE public.session_events ADD CONSTRAINT session_events_location_check CHECK (char_length(location) <= 160);
ALTER TABLE public.session_events ADD CONSTRAINT session_events_metadata_check CHECK (jsonb_typeof(metadata) = 'object'::text);
ALTER TABLE public.session_events ADD CONSTRAINT session_events_pkey PRIMARY KEY (id);
ALTER TABLE public.session_events ADD CONSTRAINT session_events_round_number_check CHECK (round_number IS NULL OR round_number >= 1 AND round_number <= 999999);
ALTER TABLE public.session_events ADD CONSTRAINT session_events_sequence_number_check CHECK (sequence_number >= 0 AND sequence_number <= 999999999);
ALTER TABLE public.session_events ADD CONSTRAINT session_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;
ALTER TABLE public.session_events ADD CONSTRAINT session_events_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 160);
ALTER TABLE public.session_events ADD CONSTRAINT session_events_visibility_check CHECK (visibility = ANY (ARRAY['party'::text, 'gm_only'::text]));
GRANT INSERT, SELECT ON public.session_events TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.session_events TO service_role;
CREATE INDEX session_events_actor_idx ON public.session_events (actor_id);
CREATE INDEX session_events_session_timeline_idx ON public.session_events (session_id, occurred_at DESC, sequence_number DESC);
CREATE INDEX session_events_character_idx ON public.session_events (character_id, occurred_at DESC) WHERE character_id IS NOT NULL;
CREATE TRIGGER session_events_record_memory AFTER INSERT ON public.session_events FOR EACH ROW EXECUTE FUNCTION private.record_session_event_memory();
CREATE POLICY session_events_insert_allowed ON public.session_events FOR INSERT TO authenticated WITH CHECK (((actor_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.sessions
  WHERE ((sessions.id = session_events.session_id) AND (sessions.campaign_id = session_events.campaign_id)))) AND ( SELECT private.is_campaign_member(session_events.campaign_id) AS is_campaign_member) AND ((visibility = 'party'::text) OR ( SELECT private.is_campaign_manager(session_events.campaign_id) AS is_campaign_manager)) AND ((character_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = session_events.character_id) AND (characters.campaign_id = session_events.campaign_id) AND ((characters.owner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_campaign_manager(session_events.campaign_id) AS is_campaign_manager))))))));
CREATE POLICY session_events_select_allowed ON public.session_events FOR SELECT TO authenticated USING ((( SELECT private.is_campaign_member(session_events.campaign_id) AS is_campaign_member) AND ((visibility = 'party'::text) OR ( SELECT private.is_campaign_manager(session_events.campaign_id) AS is_campaign_manager))));
