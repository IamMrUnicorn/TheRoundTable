SET check_function_bodies = false;
CREATE FUNCTION private.apply_character_condition(requested_session_id bigint, requested_character_id bigint, requested_operation text, requested_condition text, requested_source text DEFAULT ''::text, requested_rounds integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_user_id uuid := (select auth.uid());
  target public.characters;
  target_campaign_id bigint;
  allowed_conditions constant text[] := array['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'];
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  requested_operation := lower(trim(requested_operation));
  requested_condition := lower(trim(requested_condition));
  requested_source := trim(requested_source);
  if requested_operation not in ('add', 'remove') then
    raise exception 'Unsupported condition operation.' using errcode = '22023';
  end if;
  if not (requested_condition = any(allowed_conditions)) then
    raise exception 'Unknown condition.' using errcode = '22023';
  end if;
  if char_length(requested_source) > 160 then
    raise exception 'Condition source must be at most 160 characters.' using errcode = '22023';
  end if;
  if requested_rounds is not null and requested_rounds not between 1 and 999 then
    raise exception 'Condition duration must be between 1 and 999 rounds.' using errcode = '22023';
  end if;

  select campaign_id into target_campaign_id
  from public.sessions
  where id = requested_session_id and status = 'active';
  if target_campaign_id is null then
    raise exception 'Condition changes require an active campaign session.' using errcode = 'P0001';
  end if;

  select * into target from public.characters
  where id = requested_character_id and campaign_id = target_campaign_id
  for update;
  if not found then
    raise exception 'Character is not part of this session campaign.' using errcode = 'P0001';
  end if;
  if target.owner_id <> current_user_id and not private.is_campaign_manager(target_campaign_id) then
    raise exception 'You cannot change this character''s conditions.' using errcode = '42501';
  end if;

  if requested_operation = 'add' then
    if not (requested_condition = any(target.conditions)) then
      target.conditions := array_append(target.conditions, requested_condition);
    end if;
    insert into public.character_condition_instances (
      character_id, campaign_id, session_id, condition, source, remaining_rounds, applied_by
    ) values (
      target.id, target_campaign_id, requested_session_id, requested_condition,
      requested_source, requested_rounds, current_user_id
    )
    on conflict (character_id, condition) do update set
      campaign_id = excluded.campaign_id,
      session_id = excluded.session_id,
      source = excluded.source,
      remaining_rounds = excluded.remaining_rounds,
      applied_by = excluded.applied_by,
      updated_at = now();
  else
    target.conditions := array_remove(target.conditions, requested_condition);
    delete from public.character_condition_instances
    where character_id = target.id and condition = requested_condition;
  end if;

  update public.characters set conditions = target.conditions where id = target.id;
  insert into public.session_events (
    session_id, campaign_id, actor_id, character_id, kind, visibility, title, body, metadata
  ) values (
    requested_session_id, target_campaign_id, current_user_id, target.id, 'condition', 'party',
    target.name || case when requested_operation = 'add' then ' gained ' else ' lost ' end || requested_condition,
    case
      when requested_operation = 'remove' then 'Condition removed.'
      else 'Source: ' || coalesce(nullif(requested_source, ''), 'unspecified') ||
        case when requested_rounds is null then '; duration: until removed.' else '; duration: ' || requested_rounds || ' rounds.' end
    end,
    jsonb_build_object(
      'operation', 'condition_' || requested_operation,
      'condition', requested_condition,
      'source', requested_source,
      'remaining_rounds', requested_rounds
    )
  );
  return jsonb_build_object(
    'character_id', target.id,
    'conditions', target.conditions,
    'condition', requested_condition,
    'source', requested_source,
    'remaining_rounds', requested_rounds
  );
end;
$function$;
REVOKE ALL ON FUNCTION private.apply_character_condition(bigint, bigint, text, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.apply_character_condition(bigint, bigint, text, text, text, integer) TO authenticated;
CREATE OR REPLACE FUNCTION private.apply_character_health_change(requested_session_id bigint, requested_character_id bigint, change_kind text, amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_user_id uuid := (select auth.uid());
  target public.characters;
  target_campaign_id bigint;
  previous_hp integer;
  previous_temporary_hp integer;
  previous_combat_state text;
  absorbed integer := 0;
  concentration_check_dc integer;
  event_title text;
  event_body text;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if change_kind not in ('damage', 'healing', 'temporary_hp') then
    raise exception 'Unsupported health change.' using errcode = '22023';
  end if;
  if amount < 1 or amount > 100000 then
    raise exception 'Amount must be between 1 and 100000.' using errcode = '22023';
  end if;

  select campaign_id into target_campaign_id
  from public.sessions
  where id = requested_session_id and status = 'active';
  if target_campaign_id is null then
    raise exception 'Health changes require an active campaign session.' using errcode = 'P0001';
  end if;

  select * into target
  from public.characters
  where id = requested_character_id and campaign_id = target_campaign_id
  for update;
  if not found then
    raise exception 'Character is not part of this session campaign.' using errcode = 'P0001';
  end if;
  if target.owner_id <> current_user_id and not private.is_campaign_manager(target_campaign_id) then
    raise exception 'You cannot change this character''s health.' using errcode = '42501';
  end if;

  previous_hp := target.current_hp;
  previous_temporary_hp := target.temporary_hp;
  previous_combat_state := target.combat_state;
  if change_kind = 'damage' then
    absorbed := least(target.temporary_hp, amount);
    target.temporary_hp := target.temporary_hp - absorbed;
    target.current_hp := greatest(0, target.current_hp - (amount - absorbed));
    event_title := target.name || ' took ' || amount || ' damage';
    event_body := 'HP ' || previous_hp || ' → ' || target.current_hp ||
      '; temporary HP ' || previous_temporary_hp || ' → ' || target.temporary_hp ||
      case when absorbed > 0 then ' (' || absorbed || ' absorbed).' else '.' end;
    if target.concentration <> '' then
      concentration_check_dc := greatest(10, floor(amount / 2.0)::integer);
    end if;
    if target.current_hp = 0 and target.combat_state <> 'dead' then
      target.combat_state := 'unconscious';
      if not ('unconscious' = any(target.conditions)) then
        target.conditions := array_append(target.conditions, 'unconscious');
      end if;
    end if;
  elsif change_kind = 'healing' then
    if target.combat_state = 'dead' then
      raise exception 'A dead character must be revived before receiving healing.' using errcode = 'P0001';
    end if;
    target.current_hp := least(target.max_hp, target.current_hp + amount);
    event_title := target.name || ' regained ' || (target.current_hp - previous_hp) || ' HP';
    event_body := 'HP ' || previous_hp || ' → ' || target.current_hp || ' (requested ' || amount || ').';
    if target.current_hp > 0 then
      target.combat_state := 'conscious';
      target.conditions := array_remove(target.conditions, 'unconscious');
      target.death_save_successes := 0;
      target.death_save_failures := 0;
    end if;
  else
    target.temporary_hp := greatest(target.temporary_hp, amount);
    event_title := target.name || ' gained temporary HP';
    event_body := 'Temporary HP ' || previous_temporary_hp || ' → ' || target.temporary_hp || '.';
  end if;

  update public.characters
  set current_hp = target.current_hp,
      temporary_hp = target.temporary_hp,
      combat_state = target.combat_state,
      conditions = target.conditions,
      death_save_successes = target.death_save_successes,
      death_save_failures = target.death_save_failures
  where id = target.id;

  insert into public.session_events (
    session_id, campaign_id, actor_id, character_id, kind, visibility,
    title, body, metadata
  ) values (
    requested_session_id, target_campaign_id, current_user_id, target.id,
    case when change_kind = 'temporary_hp' then 'healing' else change_kind end,
    'party', event_title, event_body,
    jsonb_build_object(
      'change_kind', change_kind, 'requested_amount', amount,
      'absorbed_by_temporary_hp', absorbed, 'previous_hp', previous_hp,
      'current_hp', target.current_hp, 'previous_temporary_hp', previous_temporary_hp,
      'temporary_hp', target.temporary_hp,
      'previous_combat_state', previous_combat_state, 'combat_state', target.combat_state,
      'concentration_check_dc', concentration_check_dc
    )
  );

  return jsonb_build_object(
    'character_id', target.id, 'current_hp', target.current_hp,
    'max_hp', target.max_hp, 'temporary_hp', target.temporary_hp,
    'combat_state', target.combat_state,
    'concentration_check_dc', concentration_check_dc
  );
end;
$function$;
CREATE OR REPLACE FUNCTION private.apply_character_status_change(requested_session_id bigint, requested_character_id bigint, requested_operation text, requested_value text DEFAULT ''::text)
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
  previous_combat_state text;
  event_title text;
  event_body text;
  allowed_conditions constant text[] := array['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'];
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if requested_operation not in ('condition_add', 'condition_remove', 'concentration_start', 'concentration_end', 'concentration_check_pass', 'concentration_check_fail', 'death_success', 'death_failure', 'death_reset', 'stabilize', 'mark_dead', 'revive') then
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
  previous_combat_state := target.combat_state;

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
  elsif requested_operation = 'concentration_check_pass' then
    event_title := target.name || ' maintained concentration';
    event_body := case when target.concentration = '' then 'No concentration was active.' else target.concentration || ' continues.' end;
  elsif requested_operation = 'concentration_check_fail' then
    target.concentration := '';
    event_title := target.name || ' lost concentration';
    event_body := case when previous_concentration = '' then 'No concentration was active.' else previous_concentration || ' ended after a failed Constitution save.' end;
  elsif requested_operation = 'death_success' then
    target.death_save_successes := least(3, target.death_save_successes + 1);
    if target.death_save_successes = 3 then
      target.combat_state := 'stabilized';
    end if;
    event_title := target.name || ' marked a death-save success';
    event_body := 'Death saves: ' || target.death_save_successes || ' successes, ' || target.death_save_failures || ' failures.';
  elsif requested_operation = 'death_failure' then
    target.death_save_failures := least(3, target.death_save_failures + 1);
    if target.death_save_failures = 3 then
      target.combat_state := 'dead';
    end if;
    event_title := target.name || ' marked a death-save failure';
    event_body := 'Death saves: ' || target.death_save_successes || ' successes, ' || target.death_save_failures || ' failures.';
  elsif requested_operation = 'death_reset' then
    target.death_save_successes := 0;
    target.death_save_failures := 0;
    event_title := target.name || ' reset death saves';
    event_body := 'Death-save counters reset to zero.';
  elsif requested_operation = 'stabilize' then
    target.combat_state := 'stabilized';
    target.death_save_successes := 3;
    target.death_save_failures := 0;
    event_title := target.name || ' stabilized';
    event_body := 'The character is stable at ' || target.current_hp || ' HP.';
  elsif requested_operation = 'mark_dead' then
    target.combat_state := 'dead';
    target.current_hp := 0;
    target.death_save_failures := 3;
    target.concentration := '';
    event_title := target.name || ' died';
    event_body := 'The character was marked dead.';
  else
    target.combat_state := case when target.current_hp > 0 then 'conscious' else 'unconscious' end;
    target.death_save_successes := 0;
    target.death_save_failures := 0;
    if target.current_hp > 0 then
      target.conditions := array_remove(target.conditions, 'unconscious');
    end if;
    event_title := target.name || ' was revived';
    event_body := 'Combat state changed from ' || previous_combat_state || ' to ' || target.combat_state || '.';
  end if;

  update public.characters set
    conditions = target.conditions,
    concentration = target.concentration,
    combat_state = target.combat_state,
    current_hp = target.current_hp,
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
      'previous_combat_state', previous_combat_state, 'combat_state', target.combat_state,
      'previous_death_successes', previous_successes, 'death_successes', target.death_save_successes,
      'previous_death_failures', previous_failures, 'death_failures', target.death_save_failures
    )
  );

  return jsonb_build_object(
    'character_id', target.id, 'conditions', target.conditions,
    'concentration', target.concentration,
    'combat_state', target.combat_state,
    'death_save_successes', target.death_save_successes,
    'death_save_failures', target.death_save_failures
  );
end;
$function$;
CREATE FUNCTION private.tick_character_conditions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  elapsed_rounds integer;
  expired record;
  current_user_id uuid := (select auth.uid());
begin
  elapsed_rounds := new.round_number - old.round_number;
  if elapsed_rounds <= 0 then return new; end if;

  for expired in
    select condition_instances.*
    from public.character_condition_instances condition_instances
    where condition_instances.session_id = new.session_id
      and condition_instances.remaining_rounds is not null
      and condition_instances.remaining_rounds <= elapsed_rounds
  loop
    update public.characters
    set conditions = array_remove(conditions, expired.condition)
    where id = expired.character_id;
    insert into public.session_events (
      session_id, campaign_id, actor_id, character_id, kind, visibility, title, body, round_number, metadata
    )
    select
      new.session_id, new.campaign_id, current_user_id, characters.id, 'condition', 'party',
      characters.name || ' is no longer ' || expired.condition,
      'The timed condition expired at the start of round ' || new.round_number || '.',
      new.round_number,
      jsonb_build_object('operation', 'condition_expired', 'condition', expired.condition, 'source', expired.source)
    from public.characters
    where characters.id = expired.character_id;
    delete from public.character_condition_instances where id = expired.id;
  end loop;

  update public.character_condition_instances
  set remaining_rounds = remaining_rounds - elapsed_rounds
  where session_id = new.session_id
    and remaining_rounds is not null
    and remaining_rounds > elapsed_rounds;
  return new;
end;
$function$;
REVOKE ALL ON FUNCTION private.tick_character_conditions() FROM PUBLIC, anon, authenticated;
CREATE FUNCTION public.apply_character_condition(session_id bigint, character_id bigint, operation text, condition text, source text DEFAULT ''::text, duration_rounds integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.apply_character_condition(
    session_id, character_id, operation, condition, source, duration_rounds
  );
$function$;
REVOKE ALL ON FUNCTION public.apply_character_condition(bigint, bigint, text, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_character_condition(bigint, bigint, text, text, text, integer) TO authenticated;
CREATE TABLE public.character_condition_instances (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, character_id bigint NOT NULL, campaign_id bigint NOT NULL, session_id bigint NOT NULL, condition text NOT NULL, source text DEFAULT ''::text NOT NULL, remaining_rounds smallint, applied_by uuid NOT NULL, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
ALTER TABLE public.character_condition_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_applied_by_fkey FOREIGN KEY (applied_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_character_id_condition_key UNIQUE (character_id, condition);
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters(id) ON DELETE CASCADE;
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_condition_check CHECK (condition = ANY (ARRAY['blinded'::text, 'charmed'::text, 'deafened'::text, 'frightened'::text, 'grappled'::text, 'incapacitated'::text, 'invisible'::text, 'paralyzed'::text, 'petrified'::text, 'poisoned'::text, 'prone'::text, 'restrained'::text, 'stunned'::text, 'unconscious'::text]));
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_pkey PRIMARY KEY (id);
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_remaining_rounds_check CHECK (remaining_rounds IS NULL OR remaining_rounds >= 1 AND remaining_rounds <= 999);
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;
ALTER TABLE public.character_condition_instances ADD CONSTRAINT character_condition_instances_source_check CHECK (char_length(source) <= 160);
GRANT SELECT ON public.character_condition_instances TO authenticated;
CREATE INDEX character_condition_instances_session_id_idx ON public.character_condition_instances (session_id);
CREATE INDEX character_condition_instances_campaign_id_idx ON public.character_condition_instances (campaign_id);
CREATE TRIGGER character_condition_instances_set_updated_at BEFORE UPDATE ON public.character_condition_instances FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE POLICY character_condition_instances_select_members ON public.character_condition_instances FOR SELECT TO authenticated USING (( SELECT private.is_campaign_member(character_condition_instances.campaign_id) AS is_campaign_member));
ALTER TABLE public.characters ADD COLUMN combat_state text DEFAULT 'conscious'::text NOT NULL;
ALTER TABLE public.characters ADD CONSTRAINT characters_combat_state_check CHECK (combat_state = ANY (ARRAY['conscious'::text, 'unconscious'::text, 'stabilized'::text, 'dead'::text]));
CREATE TRIGGER session_encounters_tick_conditions AFTER UPDATE OF round_number ON public.session_encounters FOR EACH ROW WHEN (new.round_number > old.round_number) EXECUTE FUNCTION private.tick_character_conditions();
