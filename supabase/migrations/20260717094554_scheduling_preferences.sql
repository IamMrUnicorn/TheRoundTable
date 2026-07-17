ALTER TABLE public.campaigns ADD COLUMN timezone text DEFAULT 'UTC'::text NOT NULL;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_timezone_check CHECK (char_length(timezone) >= 1 AND char_length(timezone) <= 100);
ALTER TABLE public.campaigns ADD COLUMN cadence text DEFAULT 'weekly'::text NOT NULL;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_cadence_check CHECK (cadence = ANY (ARRAY['weekly'::text, 'biweekly'::text, 'monthly'::text, 'irregular'::text]));
ALTER TABLE public.campaigns ADD COLUMN preferred_session_minutes smallint DEFAULT 180 NOT NULL;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_preferred_session_minutes_check CHECK (preferred_session_minutes >= 30 AND preferred_session_minutes <= 720);
ALTER TABLE public.profiles ADD COLUMN timezone text DEFAULT 'UTC'::text NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_timezone_check CHECK (char_length(timezone) >= 1 AND char_length(timezone) <= 100);
