alter table public.session_initiative_entries
  add column source_reference text not null default ''
    check (char_length(source_reference) <= 500),
  add column stat_block jsonb not null default '{}'::jsonb
    check (jsonb_typeof(stat_block) = 'object');
