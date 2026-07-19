SET check_function_bodies = false;
CREATE FUNCTION private.apply_character_health_change(requested_session_id bigint, requested_character_id bigint, change_kind text, amount integer)
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
  absorbed integer := 0;
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
  if change_kind = 'damage' then
    absorbed := least(target.temporary_hp, amount);
    target.temporary_hp := target.temporary_hp - absorbed;
    target.current_hp := greatest(0, target.current_hp - (amount - absorbed));
    event_title := target.name || ' took ' || amount || ' damage';
    event_body := 'HP ' || previous_hp || ' → ' || target.current_hp ||
      '; temporary HP ' || previous_temporary_hp || ' → ' || target.temporary_hp ||
      case when absorbed > 0 then ' (' || absorbed || ' absorbed).' else '.' end;
  elsif change_kind = 'healing' then
    target.current_hp := least(target.max_hp, target.current_hp + amount);
    event_title := target.name || ' regained ' || (target.current_hp - previous_hp) || ' HP';
    event_body := 'HP ' || previous_hp || ' → ' || target.current_hp || ' (requested ' || amount || ').';
  else
    target.temporary_hp := greatest(target.temporary_hp, amount);
    event_title := target.name || ' gained temporary HP';
    event_body := 'Temporary HP ' || previous_temporary_hp || ' → ' || target.temporary_hp || '.';
  end if;

  update public.characters
  set current_hp = target.current_hp, temporary_hp = target.temporary_hp
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
      'temporary_hp', target.temporary_hp
    )
  );

  return jsonb_build_object(
    'character_id', target.id, 'current_hp', target.current_hp,
    'max_hp', target.max_hp, 'temporary_hp', target.temporary_hp
  );
end;
$function$;
REVOKE ALL ON FUNCTION private.apply_character_health_change(bigint, bigint, text, integer) FROM PUBLIC, anon;
GRANT ALL ON FUNCTION private.apply_character_health_change(bigint, bigint, text, integer) TO authenticated;
CREATE FUNCTION public.apply_character_health_change(session_id bigint, character_id bigint, change_kind text, amount integer)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.apply_character_health_change(session_id, character_id, change_kind, amount);
$function$;
REVOKE ALL ON FUNCTION public.apply_character_health_change(bigint, bigint, text, integer) FROM PUBLIC, anon;
GRANT ALL ON FUNCTION public.apply_character_health_change(bigint, bigint, text, integer) TO authenticated;
