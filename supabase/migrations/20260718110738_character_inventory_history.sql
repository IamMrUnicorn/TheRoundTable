SET check_function_bodies = false;
CREATE FUNCTION private.record_character_inventory_memory()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  target public.characters;
  item_id bigint;
  event_title text;
  event_summary text;
  event_action text;
begin
  if tg_op = 'UPDATE' and
    (new.name, new.quantity, new.location, new.is_equipped, new.is_attuned)
      is not distinct from
    (old.name, old.quantity, old.location, old.is_equipped, old.is_attuned) then
    return new;
  end if;

  item_id := case when tg_op = 'DELETE' then old.id else new.id end;
  select * into target
  from public.characters
  where id = case when tg_op = 'DELETE' then old.character_id else new.character_id end;

  if tg_op = 'INSERT' then
    event_action := 'gained';
    event_title := 'Gained ' || new.name;
    event_summary := 'Added ' || new.quantity || ' × ' || new.name || ' to ' || new.location || '.';
  elsif tg_op = 'DELETE' then
    event_action := 'lost';
    event_title := 'Removed ' || old.name;
    event_summary := 'Removed ' || old.quantity || ' × ' || old.name || ' from ' || old.location || '.';
  else
    event_action := 'updated';
    event_title := 'Updated ' || new.name;
    event_summary := 'Inventory changed from ' || old.quantity || ' to ' || new.quantity ||
      ' at ' || new.location || case when new.is_equipped then ' (equipped).' else '.' end;
  end if;

  insert into public.character_memories (
    character_id, created_by, campaign_id, kind, visibility, title, summary,
    source_name, source_reference, tags, metadata
  ) values (
    target.id, (select auth.uid()), target.campaign_id, 'item',
    case when target.campaign_id is null then 'private' else 'shared' end,
    event_title, event_summary, 'Character inventory',
    'character_inventory_items:' || item_id, array['inventory', event_action],
    jsonb_build_object('inventory_item_id', item_id, 'action', event_action)
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$function$;
REVOKE ALL ON FUNCTION private.record_character_inventory_memory() FROM PUBLIC, anon, authenticated;
CREATE TABLE public.character_inventory_items (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, character_id bigint NOT NULL, name text NOT NULL, description text DEFAULT ''::text NOT NULL, quantity integer DEFAULT 1 NOT NULL, category text DEFAULT 'other'::text NOT NULL, weight numeric(10,3), value text DEFAULT ''::text NOT NULL, location text DEFAULT 'Carried'::text NOT NULL, is_equipped boolean DEFAULT false NOT NULL, is_attuned boolean DEFAULT false NOT NULL, notes text DEFAULT ''::text NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.character_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_category_check CHECK (category = ANY (ARRAY['currency'::text, 'consumable'::text, 'equipment'::text, 'quest'::text, 'treasure'::text, 'tool'::text, 'container'::text, 'other'::text]));
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters(id) ON DELETE CASCADE;
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_description_check CHECK (char_length(description) <= 5000);
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_location_check CHECK (char_length(location) >= 1 AND char_length(location) <= 120);
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 160);
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_notes_check CHECK (char_length(notes) <= 5000);
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_pkey PRIMARY KEY (id);
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_quantity_check CHECK (quantity >= 0 AND quantity <= 999999);
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_value_check CHECK (char_length(value) <= 120);
ALTER TABLE public.character_inventory_items ADD CONSTRAINT character_inventory_items_weight_check CHECK (weight IS NULL OR weight >= 0::numeric AND weight <= 999999.999);
GRANT DELETE, INSERT, SELECT, UPDATE ON public.character_inventory_items TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.character_inventory_items TO service_role;
CREATE INDEX character_inventory_items_character_category_idx ON public.character_inventory_items (character_id, category, name);
CREATE TRIGGER character_inventory_items_record_memory AFTER INSERT OR DELETE OR UPDATE ON public.character_inventory_items FOR EACH ROW EXECUTE FUNCTION private.record_character_inventory_memory();
CREATE TRIGGER character_inventory_items_set_updated_at BEFORE UPDATE ON public.character_inventory_items FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY character_inventory_items_delete_owner ON public.character_inventory_items FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_inventory_items.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_inventory_items_insert_owner ON public.character_inventory_items FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_inventory_items.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY character_inventory_items_select_visible_character ON public.character_inventory_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE (characters.id = character_inventory_items.character_id))));
CREATE POLICY character_inventory_items_update_owner ON public.character_inventory_items FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_inventory_items.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.characters
  WHERE ((characters.id = character_inventory_items.character_id) AND (characters.owner_id = ( SELECT auth.uid() AS uid))))));
