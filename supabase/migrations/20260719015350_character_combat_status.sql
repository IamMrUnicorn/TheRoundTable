SET check_function_bodies = false;
CREATE FUNCTION private.apply_character_status_change(requested_session_id bigint, requested_character_id bigint, requested_operation text, requested_value text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_user_id uuid := (select auth.uid());
  target public.characters;
  target_campaign_id bigint;
  previous_conditions text[];
  previous_concentration text;
  previous_successes smallint;
  previous_failures smallint;
  event_title text;
  event_body text;
  allowed_conditions constant text[] := array['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'];
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if requested_operation not in ('condition_add', 'condition_remove', 'concentration_start', 'concentration_end', 'death_success', 'death_failure', 'death_reset') then
    raise exception 'Unsupported status change.' using errcode = '22023';
  end if;

  select campaign_id into target_campaign_id
  from public.sessions
  where id = requested_session_id and status = 'active';
  if target_campaign_id is null then
    raise exception 'Status changes require an active campaign session.' using errcode = 'P0001';
  end if;

  select * into target from public.characters
  where id = requested_character_id and campaign_id = target_campaign_id
  for update;
  if not found then
    raise exception 'Character is not part of this session campaign.' using errcode = 'P0001';
  end if;
  if target.owner_id <> current_user_id and not private.is_campaign_manager(target_campaign_id) then
    raise exception 'You cannot change this character''s status.' using errcode = '42501';
  end if;

  previous_conditions := target.conditions;
  previous_concentration := target.concentration;
  previous_successes := target.death_save_successes;
  previous_failures := target.death_save_failures;

  if requested_operation in ('condition_add', 'condition_remove') then
    requested_value := lower(trim(requested_value));
    if not (requested_value = any(allowed_conditions)) then
      raise exception 'Unknown condition.' using errcode = '22023';
    end if;
    if requested_operation = 'condition_add' then
      if not (requested_value = any(target.conditions)) then
        target.conditions := array_append(target.conditions, requested_value);
      end if;
      event_title := target.name || ' gained ' || requested_value;
    else
      target.conditions := array_remove(target.conditions, requested_value);
      event_title := target.name || ' lost ' || requested_value;
    end if;
    event_body := 'Conditions: ' || coalesce(array_to_string(previous_conditions, ', '), 'none') || ' → ' || coalesce(nullif(array_to_string(target.conditions, ', '), ''), 'none') || '.';
  elsif requested_operation = 'concentration_start' then
    requested_value := trim(requested_value);
    if char_length(requested_value) not between 1 and 160 then
      raise exception 'Concentration source must be 1–160 characters.' using errcode = '22023';
    end if;
    target.concentration := requested_value;
    event_title := target.name || ' began concentrating';
    event_body := case when previous_concentration = '' then requested_value else previous_concentration || ' → ' || requested_value end || '.';
  elsif requested_operation = 'concentration_end' then
    target.concentration := '';
    event_title := target.name || ' ended concentration';
    event_body := case when previous_concentration = '' then 'No concentration was active.' else previous_concentration || ' ended.' end;
  elsif requested_operation = 'death_success' then
    target.death_save_successes := least(3, target.death_save_successes + 1);
    event_title := target.name || ' marked a death-save success';
    event_body := 'Death saves: ' || target.death_save_successes || ' successes, ' || target.death_save_failures || ' failures.';
  elsif requested_operation = 'death_failure' then
    target.death_save_failures := least(3, target.death_save_failures + 1);
    event_title := target.name || ' marked a death-save failure';
    event_body := 'Death saves: ' || target.death_save_successes || ' successes, ' || target.death_save_failures || ' failures.';
  else
    target.death_save_successes := 0;
    target.death_save_failures := 0;
    event_title := target.name || ' reset death saves';
    event_body := 'Death-save counters reset to zero.';
  end if;

  update public.characters set
    conditions = target.conditions,
    concentration = target.concentration,
    death_save_successes = target.death_save_successes,
    death_save_failures = target.death_save_failures
  where id = target.id;

  insert into public.session_events (
    session_id, campaign_id, actor_id, character_id, kind, visibility, title, body, metadata
  ) values (
    requested_session_id, target_campaign_id, current_user_id, target.id, 'condition', 'party', event_title, event_body,
    jsonb_build_object(
      'operation', requested_operation, 'value', requested_value,
      'previous_conditions', previous_conditions, 'conditions', target.conditions,
      'previous_concentration', previous_concentration, 'concentration', target.concentration,
      'previous_death_successes', previous_successes, 'death_successes', target.death_save_successes,
      'previous_death_failures', previous_failures, 'death_failures', target.death_save_failures
    )
  );

  return jsonb_build_object(
    'character_id', target.id, 'conditions', target.conditions,
    'concentration', target.concentration,
    'death_save_successes', target.death_save_successes,
    'death_save_failures', target.death_save_failures
  );
end;
$function$;
REVOKE ALL ON FUNCTION private.apply_character_status_change(bigint, bigint, text, text) FROM PUBLIC, anon;
GRANT ALL ON FUNCTION private.apply_character_status_change(bigint, bigint, text, text) TO authenticated;
CREATE FUNCTION public.apply_character_status_change(session_id bigint, character_id bigint, operation text, value text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.apply_character_status_change(session_id, character_id, operation, value);
$function$;
REVOKE ALL ON FUNCTION public.apply_character_status_change(bigint, bigint, text, text) FROM PUBLIC, anon;
GRANT ALL ON FUNCTION public.apply_character_status_change(bigint, bigint, text, text) TO authenticated;
ALTER TABLE public.characters ADD COLUMN concentration text DEFAULT ''::text NOT NULL;
ALTER TABLE public.characters ADD CONSTRAINT characters_concentration_check CHECK (char_length(concentration) <= 160);
