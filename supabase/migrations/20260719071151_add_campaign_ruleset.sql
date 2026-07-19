ALTER TABLE public.campaigns ADD COLUMN ruleset text DEFAULT 'D&D 5e'::text NOT NULL;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_ruleset_check CHECK (char_length(ruleset) >= 1 AND char_length(ruleset) <= 80);
