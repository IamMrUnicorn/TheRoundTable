create function private.resolve_monster_attack(
  requested_session_id bigint,
  requested_attacker_entry_id bigint,
  requested_target_character_id bigint,
  requested_attack_name text,
  requested_roll_mode text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_campaign_id bigint;
  active_entry_id bigint;
  attacker public.session_initiative_entries;
  target public.characters;
  action_data jsonb;
  automation jsonb;
  action_type text;
  attack_bonus integer;
  dice_count integer;
  die_size integer;
  damage_bonus integer;
  damage_type text;
  roll_one integer;
  roll_two integer;
  natural_roll integer;
  attack_total integer;
  damage integer := 0;
  did_hit boolean;
  was_critical boolean;
  absorbed integer := 0;
  previous_hp integer;
  previous_temporary_hp integer;
  concentration_check_dc integer;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if requested_roll_mode not in ('normal', 'advantage', 'disadvantage') then
    raise exception 'Unsupported attack roll mode.' using errcode = '22023';
  end if;

  select sessions.campaign_id into target_campaign_id
  from public.sessions
  where id = requested_session_id and status = 'active';
  if target_campaign_id is null then
    raise exception 'Monster attacks require an active campaign session.' using errcode = 'P0001';
  end if;
  if not private.is_campaign_manager(target_campaign_id) then
    raise exception 'Only a campaign manager can control monster attacks.' using errcode = '42501';
  end if;

  select * into attacker
  from public.session_initiative_entries
  where id = requested_attacker_entry_id
    and session_id = requested_session_id
    and campaign_id = target_campaign_id
    and character_id is null
    and combatant_kind in ('monster', 'npc')
  for update;
  if not found then
    raise exception 'That monster or NPC is unavailable.' using errcode = 'P0001';
  end if;

  select value into action_data
  from jsonb_array_elements(coalesce(attacker.stat_block -> 'actions', '[]'::jsonb))
  where value ->> 'name' = requested_attack_name
  limit 1;
  automation := action_data -> 'automation';
  if action_data is null or automation is null then
    raise exception 'That action does not contain an automated attack.' using errcode = 'P0001';
  end if;

  action_type := action_data ->> 'action_type';
  attack_bonus := (automation ->> 'attack_bonus')::integer;
  dice_count := (automation ->> 'damage_dice_count')::integer;
  die_size := (automation ->> 'damage_die_size')::integer;
  damage_bonus := (automation ->> 'damage_bonus')::integer;
  damage_type := automation ->> 'damage_type';
  if attack_bonus not between -100 and 100
    or dice_count not between 1 and 20
    or die_size not between 2 and 100
    or damage_bonus not between -100 and 100
    or char_length(damage_type) not between 1 and 40 then
    raise exception 'The stored attack automation is invalid.' using errcode = '22023';
  end if;

  if action_type = 'ACTION' then
    select session_encounters.active_entry_id into active_entry_id
    from public.session_encounters
    where session_id = requested_session_id and status = 'active';
    if active_entry_id is distinct from attacker.id then
      raise exception 'It is not this combatant''s turn.' using errcode = 'P0001';
    end if;
    if attacker.action_used then
      raise exception 'This combatant already used its action.' using errcode = 'P0001';
    end if;
  elsif action_type = 'REACTION' and attacker.reaction_used then
    raise exception 'This combatant already used its reaction.' using errcode = 'P0001';
  end if;

  select * into target
  from public.characters
  where id = requested_target_character_id and campaign_id = target_campaign_id
  for update;
  if not found then
    raise exception 'That character is not part of this campaign.' using errcode = 'P0001';
  end if;

  roll_one := floor(random() * 20)::integer + 1;
  roll_two := floor(random() * 20)::integer + 1;
  natural_roll := case requested_roll_mode
    when 'advantage' then greatest(roll_one, roll_two)
    when 'disadvantage' then least(roll_one, roll_two)
    else roll_one
  end;
  attack_total := natural_roll + attack_bonus;
  was_critical := natural_roll = 20;
  did_hit := was_critical or (natural_roll <> 1 and attack_total >= target.armor_class);
  previous_hp := target.current_hp;
  previous_temporary_hp := target.temporary_hp;

  if did_hit then
    for roll_index in 1..(dice_count * case when was_critical then 2 else 1 end)
    loop
      damage := damage + floor(random() * die_size)::integer + 1;
    end loop;
    damage := greatest(0, damage + damage_bonus);
    absorbed := least(target.temporary_hp, damage);
    target.temporary_hp := target.temporary_hp - absorbed;
    target.current_hp := greatest(0, target.current_hp - (damage - absorbed));
    if target.concentration <> '' then
      concentration_check_dc := greatest(10, floor(damage / 2.0)::integer);
    end if;
    if target.current_hp = 0 and target.combat_state <> 'dead' then
      target.combat_state := 'unconscious';
      if not ('unconscious' = any(target.conditions)) then
        target.conditions := array_append(target.conditions, 'unconscious');
      end if;
    end if;
    update public.characters
    set
      current_hp = target.current_hp,
      temporary_hp = target.temporary_hp,
      combat_state = target.combat_state,
      conditions = target.conditions
    where id = target.id;
  end if;

  update public.session_initiative_entries
  set
    action_used = case when action_type = 'ACTION' then true else action_used end,
    reaction_used = case when action_type = 'REACTION' then true else reaction_used end
  where id = attacker.id;

  insert into public.session_events (
    session_id, campaign_id, actor_id, character_id, kind, visibility,
    title, body, metadata
  ) values (
    requested_session_id, target_campaign_id, current_user_id, target.id,
    case when did_hit then 'damage' else 'action' end, 'party',
    attacker.combatant_name || ' used ' || requested_attack_name || ' against ' || target.name,
    case
      when not did_hit then 'Missed with ' || attack_total || ' against AC ' || target.armor_class || '.'
      else case when was_critical then 'Critical hit! ' else 'Hit. ' end ||
        damage || ' ' || damage_type || ' damage; HP ' || previous_hp || ' → ' || target.current_hp ||
        case when absorbed > 0 then '; ' || absorbed || ' absorbed by temporary HP.' else '.' end
    end,
    jsonb_build_object(
      'resolution', 'monster_attack',
      'attacker_entry_id', attacker.id,
      'attacker_name', attacker.combatant_name,
      'attack_name', requested_attack_name,
      'action_type', action_type,
      'target_character_id', target.id,
      'target_name', target.name,
      'roll_mode', requested_roll_mode,
      'roll_one', roll_one,
      'roll_two', case when requested_roll_mode = 'normal' then null else roll_two end,
      'natural_roll', natural_roll,
      'attack_bonus', attack_bonus,
      'attack_total', attack_total,
      'target_armor_class', target.armor_class,
      'hit', did_hit,
      'critical', was_critical,
      'damage_formula', dice_count || 'd' || die_size ||
        case when damage_bonus >= 0 then '+' else '' end || damage_bonus,
      'damage_type', damage_type,
      'damage', damage,
      'previous_hp', previous_hp,
      'current_hp', target.current_hp,
      'previous_temporary_hp', previous_temporary_hp,
      'temporary_hp', target.temporary_hp,
      'concentration_check_dc', concentration_check_dc,
      'source_reference', attacker.source_reference
    )
  );

  return jsonb_build_object(
    'hit', did_hit,
    'critical', was_critical,
    'natural_roll', natural_roll,
    'attack_total', attack_total,
    'damage', damage,
    'damage_type', damage_type,
    'target_name', target.name,
    'target_hp', target.current_hp,
    'target_max_hp', target.max_hp,
    'concentration_check_dc', concentration_check_dc
  );
end;
$$;

create function public.resolve_monster_attack(
  session_id bigint,
  attacker_entry_id bigint,
  target_character_id bigint,
  attack_name text,
  roll_mode text
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.resolve_monster_attack(
    session_id, attacker_entry_id, target_character_id, attack_name, roll_mode
  );
$$;


revoke execute on function private.resolve_monster_attack(bigint, bigint, bigint, text, text) from public, anon, authenticated;
revoke execute on function public.resolve_monster_attack(bigint, bigint, bigint, text, text) from public, anon;
grant execute on function private.resolve_monster_attack(bigint, bigint, bigint, text, text) to authenticated;
grant execute on function public.resolve_monster_attack(bigint, bigint, bigint, text, text) to authenticated;
