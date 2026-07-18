ALTER TABLE public.characters ADD COLUMN saving_throw_proficiencies text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.characters ADD CONSTRAINT characters_saving_throw_proficiencies_check CHECK (saving_throw_proficiencies <@ ARRAY['strength'::text, 'dexterity'::text, 'constitution'::text, 'intelligence'::text, 'wisdom'::text, 'charisma'::text]);
ALTER TABLE public.characters ADD COLUMN skill_proficiencies text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.characters ADD CONSTRAINT characters_skill_proficiencies_check CHECK (skill_proficiencies <@ ARRAY['acrobatics'::text, 'animal_handling'::text, 'arcana'::text, 'athletics'::text, 'deception'::text, 'history'::text, 'insight'::text, 'intimidation'::text, 'investigation'::text, 'medicine'::text, 'nature'::text, 'perception'::text, 'performance'::text, 'persuasion'::text, 'religion'::text, 'sleight_of_hand'::text, 'stealth'::text, 'survival'::text]);
ALTER TABLE public.characters ADD COLUMN skill_expertise text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.characters ADD CONSTRAINT characters_skill_expertise_check CHECK (skill_expertise <@ skill_proficiencies);
