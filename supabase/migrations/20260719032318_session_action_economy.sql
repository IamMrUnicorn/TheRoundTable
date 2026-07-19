alter table public.session_initiative_entries
  add column action_used boolean not null default false,
  add column bonus_action_used boolean not null default false,
  add column reaction_used boolean not null default false,
  add column object_interaction_used boolean not null default false,
  add column movement_used integer not null default 0
    check (movement_used between 0 and 10000);
