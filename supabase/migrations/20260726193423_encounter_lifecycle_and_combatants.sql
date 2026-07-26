DROP POLICY initiative_entries_select_members ON public.session_initiative_entries;
ALTER TABLE public.session_initiative_entries ALTER COLUMN character_id DROP NOT NULL;
ALTER TABLE public.session_encounters ADD COLUMN name text DEFAULT 'Encounter'::text NOT NULL;
ALTER TABLE public.session_encounters ADD CONSTRAINT session_encounters_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 120);
ALTER TABLE public.session_encounters ADD COLUMN status text DEFAULT 'active'::text NOT NULL;
ALTER TABLE public.session_encounters ADD CONSTRAINT session_encounters_status_check CHECK (status = ANY (ARRAY['active'::text, 'ended'::text]));
ALTER TABLE public.session_encounters ADD COLUMN active_entry_id bigint;
ALTER TABLE public.session_encounters ADD COLUMN started_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.session_encounters ADD COLUMN ended_at timestamp with time zone;
ALTER TABLE public.session_encounters ADD CONSTRAINT session_encounters_check CHECK (status = 'active'::text AND ended_at IS NULL OR status = 'ended'::text AND ended_at IS NOT NULL);
CREATE INDEX session_encounters_active_entry_id_idx ON public.session_encounters (active_entry_id) WHERE active_entry_id IS NOT NULL;
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_session_id_id_key UNIQUE (session_id, id);
ALTER TABLE public.session_encounters ADD CONSTRAINT session_encounters_active_entry_fkey FOREIGN KEY (session_id, active_entry_id) REFERENCES public.session_initiative_entries(session_id, id) ON DELETE SET NULL (active_entry_id);
ALTER TABLE public.session_initiative_entries ADD COLUMN combatant_name text DEFAULT ''::text NOT NULL;
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_combatant_name_check CHECK (char_length(combatant_name) <= 120);
ALTER TABLE public.session_initiative_entries ADD COLUMN combatant_kind text DEFAULT 'character'::text NOT NULL;
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_check CHECK (character_id IS NOT NULL AND combatant_kind = 'character'::text AND combatant_name = ''::text OR character_id IS NULL AND combatant_kind <> 'character'::text AND char_length(combatant_name) >= 1 AND char_length(combatant_name) <= 120);
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_combatant_kind_check CHECK (combatant_kind = ANY (ARRAY['character'::text, 'monster'::text, 'npc'::text, 'custom'::text]));
ALTER TABLE public.session_initiative_entries ADD COLUMN armor_class integer;
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_armor_class_check CHECK (armor_class >= 0 AND armor_class <= 99);
ALTER TABLE public.session_initiative_entries ADD COLUMN current_hp integer;
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_current_hp_check CHECK (current_hp >= 0 AND current_hp <= 999999);
ALTER TABLE public.session_initiative_entries ADD COLUMN max_hp integer;
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_max_hp_check CHECK (max_hp >= 1 AND max_hp <= 999999);
ALTER TABLE public.session_initiative_entries ADD COLUMN temporary_hp integer;
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_check1 CHECK (max_hp IS NULL AND current_hp IS NULL AND temporary_hp IS NULL OR max_hp IS NOT NULL AND current_hp IS NOT NULL AND temporary_hp IS NOT NULL AND current_hp <= max_hp);
ALTER TABLE public.session_initiative_entries ADD CONSTRAINT session_initiative_entries_temporary_hp_check CHECK (temporary_hp >= 0 AND temporary_hp <= 999999);
ALTER TABLE public.session_initiative_entries ADD COLUMN is_hidden boolean DEFAULT false NOT NULL;
CREATE POLICY initiative_entries_select_members ON public.session_initiative_entries FOR SELECT TO authenticated USING ((( SELECT private.is_campaign_member(session_initiative_entries.campaign_id) AS is_campaign_member) AND ((NOT is_hidden) OR ( SELECT private.is_campaign_manager(session_initiative_entries.campaign_id) AS is_campaign_manager))));
ALTER POLICY initiative_entries_insert_allowed ON public.session_initiative_entries WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.sessions
  WHERE ((sessions.id = session_initiative_entries.session_id) AND (sessions.campaign_id = session_initiative_entries.campaign_id)))) AND (((character_id IS NOT NULL) AND (combatant_kind = 'character'::text) AND (combatant_name = ''::text) AND (NOT is_hidden) AND (armor_class IS NULL) AND (max_hp IS NULL) AND (current_hp IS NULL) AND (temporary_hp IS NULL) AND (EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = session_initiative_entries.character_id) AND (characters.campaign_id = session_initiative_entries.campaign_id) AND ((characters.owner_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_campaign_manager(session_initiative_entries.campaign_id) AS is_campaign_manager)))))) OR ((character_id IS NULL) AND (combatant_kind <> 'character'::text) AND ( SELECT private.is_campaign_manager(session_initiative_entries.campaign_id) AS is_campaign_manager)))));
ALTER POLICY initiative_entries_update_allowed ON public.session_initiative_entries WITH CHECK ((( SELECT private.is_campaign_manager(session_initiative_entries.campaign_id) AS is_campaign_manager) OR ((character_id IS NOT NULL) AND (combatant_kind = 'character'::text) AND (combatant_name = ''::text) AND (NOT is_hidden) AND (armor_class IS NULL) AND (max_hp IS NULL) AND (current_hp IS NULL) AND (temporary_hp IS NULL) AND (EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = session_initiative_entries.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))))));
