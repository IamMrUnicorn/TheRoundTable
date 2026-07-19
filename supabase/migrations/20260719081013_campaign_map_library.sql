CREATE TABLE public.campaign_maps (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign_id bigint NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  location_reference_id bigint REFERENCES public.campaign_references(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 3000),
  storage_path text NOT NULL UNIQUE CHECK (storage_path ~ '^[0-9]+/[0-9a-f-]+\.(png|jpg|jpeg|webp)$'),
  mime_type text NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  file_size bigint NOT NULL CHECK (file_size BETWEEN 1 AND 20971520),
  width integer CHECK (width IS NULL OR width BETWEEN 1 AND 50000),
  height integer CHECK (height IS NULL OR height BETWEEN 1 AND 50000),
  visibility text NOT NULL DEFAULT 'shared' CHECK (visibility IN ('shared', 'game_master')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campaign_maps_campaign_created_idx ON public.campaign_maps (campaign_id, created_at DESC);
CREATE INDEX campaign_maps_uploaded_by_idx ON public.campaign_maps (uploaded_by);
CREATE INDEX campaign_maps_location_reference_idx ON public.campaign_maps (location_reference_id) WHERE location_reference_id IS NOT NULL;
CREATE TRIGGER campaign_maps_set_updated_at BEFORE UPDATE ON public.campaign_maps FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

ALTER TABLE public.campaign_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaign_maps_select_allowed ON public.campaign_maps FOR SELECT TO authenticated
USING ((SELECT private.is_campaign_member(campaign_id)) AND (visibility = 'shared' OR (SELECT private.is_campaign_manager(campaign_id))));
CREATE POLICY campaign_maps_insert_managers ON public.campaign_maps FOR INSERT TO authenticated
WITH CHECK (uploaded_by = (SELECT auth.uid()) AND (SELECT private.is_campaign_manager(campaign_id)));
CREATE POLICY campaign_maps_update_managers ON public.campaign_maps FOR UPDATE TO authenticated
USING ((SELECT private.is_campaign_manager(campaign_id)))
WITH CHECK ((SELECT private.is_campaign_manager(campaign_id)));
CREATE POLICY campaign_maps_delete_managers ON public.campaign_maps FOR DELETE TO authenticated
USING ((SELECT private.is_campaign_manager(campaign_id)));

REVOKE ALL ON TABLE public.campaign_maps FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.campaign_maps_id_seq FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaign_maps TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.campaign_maps_id_seq TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('campaign-maps', 'campaign-maps', false, 20971520, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

CREATE POLICY campaign_map_objects_insert_managers ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'campaign-maps'
  AND CASE
    WHEN (storage.foldername(name))[1] ~ '^[0-9]+$'
      THEN (SELECT private.is_campaign_manager(((storage.foldername(name))[1])::bigint))
    ELSE false
  END
);
CREATE POLICY campaign_map_objects_select_allowed ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'campaign-maps'
  AND EXISTS (
    SELECT 1 FROM public.campaign_maps
    WHERE campaign_maps.storage_path = storage.objects.name
      AND (SELECT private.is_campaign_member(campaign_maps.campaign_id))
      AND (campaign_maps.visibility = 'shared' OR (SELECT private.is_campaign_manager(campaign_maps.campaign_id)))
  )
);
CREATE POLICY campaign_map_objects_delete_managers ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'campaign-maps'
  AND CASE
    WHEN (storage.foldername(name))[1] ~ '^[0-9]+$'
      THEN (SELECT private.is_campaign_manager(((storage.foldername(name))[1])::bigint))
    ELSE false
  END
);
