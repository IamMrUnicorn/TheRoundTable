CREATE TABLE public.character_memories (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, character_id bigint NOT NULL, created_by uuid NOT NULL, campaign_id bigint, session_id bigint, kind text DEFAULT 'note'::text NOT NULL, visibility text DEFAULT 'private'::text NOT NULL, title text NOT NULL, summary text DEFAULT ''::text NOT NULL, occurred_at timestamp with time zone DEFAULT now() NOT NULL, in_world_time text DEFAULT ''::text NOT NULL, location text DEFAULT ''::text NOT NULL, source_name text DEFAULT ''::text NOT NULL, source_reference text DEFAULT ''::text NOT NULL, player_annotation text DEFAULT ''::text NOT NULL, tags text[] DEFAULT '{}'::text[] NOT NULL, is_pinned boolean DEFAULT false NOT NULL, metadata jsonb DEFAULT '{}'::jsonb NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.character_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters(id) ON DELETE CASCADE;
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_in_world_time_check CHECK (char_length(in_world_time) <= 160);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_kind_check CHECK (kind = ANY (ARRAY['note'::text, 'item'::text, 'relationship'::text, 'location'::text, 'discovery'::text, 'objective'::text, 'damage'::text, 'healing'::text, 'rest'::text, 'condition'::text, 'roll'::text, 'action'::text, 'other'::text]));
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_location_check CHECK (char_length(location) <= 160);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_metadata_check CHECK (jsonb_typeof(metadata) = 'object'::text);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_pkey PRIMARY KEY (id);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_player_annotation_check CHECK (char_length(player_annotation) <= 5000);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL;
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_source_name_check CHECK (char_length(source_name) <= 160);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_source_reference_check CHECK (char_length(source_reference) <= 500);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_summary_check CHECK (char_length(summary) <= 5000);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_tags_check CHECK (cardinality(tags) <= 30 AND char_length(array_to_string(tags, ','::text)) <= 2000);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_title_check CHECK (char_length(title) >= 1 AND char_length(title) <= 160);
ALTER TABLE public.character_memories ADD CONSTRAINT character_memories_visibility_check CHECK (visibility = ANY (ARRAY['private'::text, 'shared'::text]));
GRANT DELETE, INSERT, SELECT, UPDATE ON public.character_memories TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.character_memories TO service_role;
CREATE INDEX character_memories_campaign_session_idx ON public.character_memories (campaign_id, session_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX character_memories_character_time_idx ON public.character_memories (character_id, is_pinned DESC, occurred_at DESC);
CREATE TRIGGER character_memories_set_updated_at BEFORE UPDATE ON public.character_memories FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY character_memories_delete_owner ON public.character_memories FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_memories.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_memories_insert_owner ON public.character_memories FOR INSERT TO authenticated WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_memories.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY character_memories_select_allowed ON public.character_memories FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_memories.character_id) AND ((characters.owner_id = ( SELECT auth.uid() AS uid)) OR ((character_memories.visibility = 'shared'::text) AND (characters.campaign_id IS NOT NULL) AND ( SELECT private.is_campaign_member(characters.campaign_id) AS is_campaign_member)))))));
CREATE POLICY character_memories_update_owner ON public.character_memories FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_memories.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_memories.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid)))))));
