SET check_function_bodies = false;
CREATE FUNCTION private.resolve_session_attack(requested_session_id bigint, requested_attacker_character_id bigint, requested_target_entry_id bigint, requested_attack_name text, requested_natural_roll integer, requested_attack_total integer, requested_damage integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  current_user_id uuid := (select auth.uid());
  target_campaign_id bigint;
  attacker public.characters;
  target public.session_initiative_entries;
  did_hit boolean;
  was_critical boolean;
  absorbed integer := 0;
  previous_hp integer;
  previous_temporary_hp integer;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  requested_attack_name := trim(requested_attack_name);
  if char_length(requested_attack_name) not between 1 and 160 then
    raise exception 'Attack name must be 1–160 characters.' using errcode = '22023';
  end if;
  if requested_natural_roll not between 1 and 20 or requested_attack_total not between -1000 and 1000 then
    raise exception 'Attack roll is outside the supported range.' using errcode = '22023';
  end if;
  if requested_damage not between 0 and 100000 then
    raise exception 'Damage must be between 0 and 100000.' using errcode = '22023';
  end if;

  select campaign_id into target_campaign_id
  from public.sessions
  where id = requested_session_id and status = 'active';
  if target_campaign_id is null then
    raise exception 'Attacks require an active campaign session.' using errcode = 'P0001';
  end if;
  select * into attacker from public.characters
  where id = requested_attacker_character_id and campaign_id = target_campaign_id;
  if not found or (attacker.owner_id <> current_user_id and not private.is_campaign_manager(target_campaign_id)) then
    raise exception 'You cannot attack with this character.' using errcode = '42501';
  end if;

  select * into target from public.session_initiative_entries
  where id = requested_target_entry_id
    and session_id = requested_session_id
    and campaign_id = target_campaign_id
    and character_id is null
  for update;
  if not found or (target.is_hidden and not private.is_campaign_manager(target_campaign_id)) then
    raise exception 'That target is unavailable.' using errcode = '42501';
  end if;
  if target.armor_class is null or target.current_hp is null or target.max_hp is null or target.temporary_hp is null then
    raise exception 'That target does not have resolvable combat statistics.' using errcode = 'P0001';
  end if;

  was_critical := requested_natural_roll = 20;
  did_hit := was_critical or (requested_natural_roll <> 1 and requested_attack_total >= target.armor_class);
  previous_hp := target.current_hp;
  previous_temporary_hp := target.temporary_hp;
  if did_hit then
    absorbed := least(target.temporary_hp, requested_damage);
    target.temporary_hp := target.temporary_hp - absorbed;
    target.current_hp := greatest(0, target.current_hp - (requested_damage - absorbed));
    update public.session_initiative_entries
    set current_hp = target.current_hp, temporary_hp = target.temporary_hp
    where id = target.id;
  end if;

  insert into public.session_events (
    session_id, campaign_id, actor_id, character_id, kind, visibility, title, body, metadata
  ) values (
    requested_session_id, target_campaign_id, current_user_id, attacker.id, 'action',
    case when target.is_hidden then 'gm_only' else 'party' end,
    attacker.name || ' used ' || requested_attack_name || ' against ' || target.combatant_name,
    case
      when not did_hit then 'Missed with ' || requested_attack_total || ' against AC ' || target.armor_class || '.'
      else case when was_critical then 'Critical hit! ' else 'Hit. ' end ||
        requested_damage || ' damage; HP ' || previous_hp || ' → ' || target.current_hp ||
        case when absorbed > 0 then '; ' || absorbed || ' absorbed by temporary HP.' else '.' end
    end,
    jsonb_build_object(
      'resolution', 'attack',
      'attack_name', requested_attack_name,
      'target_entry_id', target.id,
      'target_name', target.combatant_name,
      'natural_roll', requested_natural_roll,
      'attack_total', requested_attack_total,
      'target_armor_class', target.armor_class,
      'hit', did_hit,
      'critical', was_critical,
      'damage', case when did_hit then requested_damage else 0 end,
      'previous_hp', previous_hp,
      'current_hp', target.current_hp,
      'previous_temporary_hp', previous_temporary_hp,
      'temporary_hp', target.temporary_hp,
      'defeated', target.current_hp = 0
    )
  );
  return jsonb_build_object(
    'hit', did_hit,
    'critical', was_critical,
    'damage', case when did_hit then requested_damage else 0 end,
    'target_name', target.combatant_name,
    'target_hp', target.current_hp,
    'target_max_hp', target.max_hp,
    'defeated', target.current_hp = 0
  );
end;
$function$;
REVOKE ALL ON FUNCTION private.resolve_session_attack(bigint, bigint, bigint, text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.resolve_session_attack(bigint, bigint, bigint, text, integer, integer, integer) TO authenticated;
CREATE FUNCTION public.resolve_session_attack(session_id bigint, attacker_character_id bigint, target_entry_id bigint, attack_name text, natural_roll integer, attack_total integer, damage integer)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.resolve_session_attack(
    session_id, attacker_character_id, target_entry_id, attack_name,
    natural_roll, attack_total, damage
  );
$function$;
REVOKE ALL ON FUNCTION public.resolve_session_attack(bigint, bigint, bigint, text, integer, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_session_attack(bigint, bigint, bigint, text, integer, integer, integer) TO authenticated;
