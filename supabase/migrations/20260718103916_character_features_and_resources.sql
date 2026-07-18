ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
CREATE TABLE public.character_features (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, character_id bigint NOT NULL, kind text DEFAULT 'class_feature'::text NOT NULL, name text NOT NULL, source text DEFAULT ''::text NOT NULL, description text DEFAULT ''::text NOT NULL, level_acquired smallint, max_uses smallint, uses_remaining smallint, recovery text, is_active boolean DEFAULT true NOT NULL, sort_order smallint DEFAULT 0 NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.character_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_features ADD CONSTRAINT character_features_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters(id) ON DELETE CASCADE;
ALTER TABLE public.character_features ADD CONSTRAINT character_features_description_check CHECK (char_length(description) <= 10000);
ALTER TABLE public.character_features ADD CONSTRAINT character_features_kind_check CHECK (kind = ANY (ARRAY['class_feature'::text, 'subclass_feature'::text, 'ancestry_feature'::text, 'background_feature'::text, 'feat'::text, 'passive'::text, 'resource'::text, 'other'::text]));
ALTER TABLE public.character_features ADD CONSTRAINT character_features_level_acquired_check CHECK (level_acquired IS NULL OR level_acquired >= 1 AND level_acquired <= 20);
ALTER TABLE public.character_features ADD CONSTRAINT character_features_max_uses_check CHECK (max_uses IS NULL OR max_uses >= 1 AND max_uses <= 999);
ALTER TABLE public.character_features ADD CONSTRAINT character_features_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 120);
ALTER TABLE public.character_features ADD CONSTRAINT character_features_pkey PRIMARY KEY (id);
ALTER TABLE public.character_features ADD CONSTRAINT character_features_recovery_check CHECK (recovery IS NULL OR (recovery = ANY (ARRAY['short_rest'::text, 'long_rest'::text, 'dawn'::text, 'other'::text])));
ALTER TABLE public.character_features ADD CONSTRAINT character_features_sort_order_check CHECK (sort_order >= '-9999'::integer AND sort_order <= 9999);
ALTER TABLE public.character_features ADD CONSTRAINT character_features_source_check CHECK (char_length(source) <= 120);
ALTER TABLE public.character_features ADD CONSTRAINT character_features_uses_check CHECK (max_uses IS NULL AND uses_remaining IS NULL AND recovery IS NULL OR max_uses IS NOT NULL AND uses_remaining IS NOT NULL AND uses_remaining <= max_uses);
ALTER TABLE public.character_features ADD CONSTRAINT character_features_uses_remaining_check CHECK (uses_remaining IS NULL OR uses_remaining >= 0 AND uses_remaining <= 999);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.character_features TO service_role;
REVOKE ALL ON TABLE public.character_features FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.character_features TO authenticated;
REVOKE ALL ON SEQUENCE public.character_features_id_seq FROM anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.character_features_id_seq TO authenticated;
CREATE INDEX character_features_character_kind_idx ON public.character_features (character_id, kind, sort_order, name);
CREATE TRIGGER character_features_set_updated_at BEFORE UPDATE ON public.character_features FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY character_features_delete_character_owner ON public.character_features FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_features.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_features_insert_character_owner ON public.character_features FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_features.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_features_select_visible_character ON public.character_features FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE (characters.id = character_features.character_id))));
CREATE POLICY character_features_update_character_owner ON public.character_features FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_features.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_features.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
