CREATE TABLE public.character_spell_slots (profile_id bigint NOT NULL, spell_level smallint NOT NULL, maximum smallint NOT NULL, remaining smallint NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.character_spell_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_spell_slots ADD CONSTRAINT character_spell_slots_check CHECK (remaining <= maximum);
ALTER TABLE public.character_spell_slots ADD CONSTRAINT character_spell_slots_maximum_check CHECK (maximum >= 0 AND maximum <= 99);
ALTER TABLE public.character_spell_slots ADD CONSTRAINT character_spell_slots_pkey PRIMARY KEY (profile_id, spell_level);
ALTER TABLE public.character_spell_slots ADD CONSTRAINT character_spell_slots_remaining_check CHECK (remaining >= 0 AND remaining <= 99);
ALTER TABLE public.character_spell_slots ADD CONSTRAINT character_spell_slots_spell_level_check CHECK (spell_level >= 1 AND spell_level <= 9);
GRANT DELETE, INSERT, SELECT, UPDATE ON public.character_spell_slots TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.character_spell_slots TO service_role;
CREATE TRIGGER character_spell_slots_set_updated_at BEFORE UPDATE ON public.character_spell_slots FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TABLE public.character_spellcasting_profiles (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, character_id bigint NOT NULL, name text NOT NULL, spellcasting_ability text NOT NULL, preparation_mode text DEFAULT 'known'::text NOT NULL, spell_save_dc smallint, spell_attack_bonus smallint, max_prepared smallint, is_pact_magic boolean DEFAULT false NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
CREATE POLICY character_spell_slots_delete_owner ON public.character_spell_slots FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE ((character_spellcasting_profiles.id = character_spell_slots.profile_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_spell_slots_insert_owner ON public.character_spell_slots FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE ((character_spellcasting_profiles.id = character_spell_slots.profile_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_spell_slots_select_visible_character ON public.character_spell_slots FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE (character_spellcasting_profiles.id = character_spell_slots.profile_id))));
CREATE POLICY character_spell_slots_update_owner ON public.character_spell_slots FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE ((character_spellcasting_profiles.id = character_spell_slots.profile_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE ((character_spellcasting_profiles.id = character_spell_slots.profile_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
ALTER TABLE public.character_spellcasting_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters(id) ON DELETE CASCADE;
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_character_id_name_key UNIQUE (character_id, name);
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_max_prepared_check CHECK (max_prepared IS NULL OR max_prepared >= 0 AND max_prepared <= 999);
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 120);
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.character_spell_slots ADD CONSTRAINT character_spell_slots_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.character_spellcasting_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_preparation_mode_check CHECK (preparation_mode = ANY (ARRAY['known'::text, 'prepared'::text, 'spellbook'::text]));
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_spell_attack_bonus_check CHECK (spell_attack_bonus IS NULL OR spell_attack_bonus >= '-20'::integer AND spell_attack_bonus <= 30);
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_spell_save_dc_check CHECK (spell_save_dc IS NULL OR spell_save_dc >= 0 AND spell_save_dc <= 99);
ALTER TABLE public.character_spellcasting_profiles ADD CONSTRAINT character_spellcasting_profiles_spellcasting_ability_check CHECK (spellcasting_ability = ANY (ARRAY['intelligence'::text, 'wisdom'::text, 'charisma'::text]));
GRANT DELETE, INSERT, SELECT, UPDATE ON public.character_spellcasting_profiles TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.character_spellcasting_profiles TO service_role;
CREATE INDEX character_spellcasting_profiles_character_idx ON public.character_spellcasting_profiles (character_id, name);
CREATE TRIGGER character_spellcasting_profiles_set_updated_at BEFORE UPDATE ON public.character_spellcasting_profiles FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY spellcasting_profiles_delete_owner ON public.character_spellcasting_profiles FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_spellcasting_profiles.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY spellcasting_profiles_insert_owner ON public.character_spellcasting_profiles FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_spellcasting_profiles.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY spellcasting_profiles_select_visible_character ON public.character_spellcasting_profiles FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE (characters.id = character_spellcasting_profiles.character_id))));
CREATE POLICY spellcasting_profiles_update_owner ON public.character_spellcasting_profiles FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_spellcasting_profiles.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_spellcasting_profiles.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE TABLE public.character_spells (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, profile_id bigint NOT NULL, name text NOT NULL, spell_level smallint NOT NULL, school text DEFAULT ''::text NOT NULL, is_prepared boolean DEFAULT false NOT NULL, is_ritual boolean DEFAULT false NOT NULL, requires_concentration boolean DEFAULT false NOT NULL, is_favorite boolean DEFAULT false NOT NULL, casting_time text DEFAULT ''::text NOT NULL, range text DEFAULT ''::text NOT NULL, duration text DEFAULT ''::text NOT NULL, components text DEFAULT ''::text NOT NULL, description text DEFAULT ''::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.character_spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_casting_time_check CHECK (char_length(casting_time) <= 120);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_components_check CHECK (char_length(components) <= 500);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_description_check CHECK (char_length(description) <= 10000);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_duration_check CHECK (char_length(duration) <= 120);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 160);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_pkey PRIMARY KEY (id);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.character_spellcasting_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_profile_id_name_key UNIQUE (profile_id, name);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_range_check CHECK (char_length(range) <= 120);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_school_check CHECK (char_length(school) <= 80);
ALTER TABLE public.character_spells ADD CONSTRAINT character_spells_spell_level_check CHECK (spell_level >= 0 AND spell_level <= 9);
GRANT DELETE, INSERT, SELECT, UPDATE ON public.character_spells TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.character_spells TO service_role;
CREATE INDEX character_spells_profile_level_idx ON public.character_spells (profile_id, spell_level, name);
CREATE TRIGGER character_spells_set_updated_at BEFORE UPDATE ON public.character_spells FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY character_spells_delete_owner ON public.character_spells FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE ((character_spellcasting_profiles.id = character_spells.profile_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_spells_insert_owner ON public.character_spells FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE ((character_spellcasting_profiles.id = character_spells.profile_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_spells_select_visible_character ON public.character_spells FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE (character_spellcasting_profiles.id = character_spells.profile_id))));
CREATE POLICY character_spells_update_owner ON public.character_spells FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE ((character_spellcasting_profiles.id = character_spells.profile_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.character_spellcasting_profiles
     JOIN public.characters ON ((characters.id = character_spellcasting_profiles.character_id)))
  WHERE ((character_spellcasting_profiles.id = character_spells.profile_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
