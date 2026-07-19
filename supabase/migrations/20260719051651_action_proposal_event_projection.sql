create function private.record_approved_action_proposal()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'approved' or (tg_op = 'UPDATE' and old.status = 'approved') then return new; end if;
  insert into public.session_events (session_id, campaign_id, actor_id, character_id, kind, visibility, title, body, metadata)
  values (new.session_id, new.campaign_id, new.created_by, new.character_id, 'action', 'party', new.title,
    new.details || case when new.reviewer_note = '' then '' else E'\n\nGM ruling: ' || new.reviewer_note end,
    jsonb_build_object('action_proposal_id', new.id, 'action_kind', new.kind, 'approval_mode', new.approval_mode, 'reviewed_by', new.reviewed_by));
  return new;
end;
$$;
create trigger action_proposals_record_approved_event after insert or update of status on public.session_action_proposals for each row execute function private.record_approved_action_proposal();
revoke execute on function private.record_approved_action_proposal() from public, anon, authenticated;
