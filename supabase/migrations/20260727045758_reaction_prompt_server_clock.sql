create function public.create_reaction_prompt(
  requested_session_id bigint,
  requested_campaign_id bigint,
  requested_character_id bigint,
  requested_target_user_id uuid,
  requested_prompt text,
  duration_seconds integer
)
returns public.session_reaction_prompts
language plpgsql
security invoker
set search_path = ''
as $$
declare created_prompt public.session_reaction_prompts;
begin
  if duration_seconds not between 5 and 300 then
    raise exception 'Reaction duration must be between 5 and 300 seconds.' using errcode = '22023';
  end if;
  insert into public.session_reaction_prompts (
    session_id, campaign_id, character_id, target_user_id, created_by, prompt, expires_at
  )
  values (
    requested_session_id,
    requested_campaign_id,
    requested_character_id,
    requested_target_user_id,
    (select auth.uid()),
    btrim(requested_prompt),
    statement_timestamp() + make_interval(secs => duration_seconds)
  )
  returning * into created_prompt;
  return created_prompt;
end;
$$;

revoke execute on function public.create_reaction_prompt(bigint, bigint, bigint, uuid, text, integer) from public, anon;
grant execute on function public.create_reaction_prompt(bigint, bigint, bigint, uuid, text, integer) to authenticated;
