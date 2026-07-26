create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_path text,
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
    check (invite_code ~ '^[A-F0-9]{8}$'),
  description text not null default '' check (char_length(description) <= 2000),
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 100),
  cadence text not null default 'weekly'
    check (cadence in ('weekly', 'biweekly', 'monthly', 'irregular')),
  preferred_session_minutes smallint not null default 180
    check (preferred_session_minutes between 30 and 720),
  status text not null default 'forming'
    check (status in ('forming', 'active', 'paused', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  requires_join_approval boolean not null default false,
  ruleset text not null default 'D&D 5e' check (char_length(ruleset) between 1 and 80)
);

create table public.campaign_members (
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'player' check (role in ('owner', 'game_master', 'player', 'observer')),
  status text not null default 'active' check (status in ('invited', 'pending', 'active', 'declined', 'removed', 'banned')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

create table public.characters (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id bigint references public.campaigns (id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  ancestry text not null default '' check (char_length(ancestry) <= 80),
  class_name text not null default '' check (char_length(class_name) <= 80),
  subclass text not null default '' check (char_length(subclass) <= 80),
  background text not null default '' check (char_length(background) <= 120),
  level smallint not null default 1 check (level between 1 and 20),
  armor_class smallint not null default 10 check (armor_class between 0 and 99),
  current_hp integer not null default 1 check (current_hp between 0 and 9999),
  max_hp integer not null default 1 check (max_hp between 1 and 9999),
  speed smallint not null default 30 check (speed between 0 and 999),
  strength smallint not null default 10 check (strength between 1 and 30),
  dexterity smallint not null default 10 check (dexterity between 1 and 30),
  constitution smallint not null default 10 check (constitution between 1 and 30),
  intelligence smallint not null default 10 check (intelligence between 1 and 30),
  wisdom smallint not null default 10 check (wisdom between 1 and 30),
  charisma smallint not null default 10 check (charisma between 1 and 30),
  notes text not null default '' check (char_length(notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  saving_throw_proficiencies text[] not null default '{}',
  skill_proficiencies text[] not null default '{}',
  skill_expertise text[] not null default '{}',
  temporary_hp integer not null default 0 check (temporary_hp between 0 and 9999),
  hit_die_size smallint not null default 8 check (hit_die_size in (4, 6, 8, 10, 12)),
  hit_dice_total smallint not null default 1 check (hit_dice_total between 1 and 20),
  hit_dice_remaining smallint not null default 1 check (hit_dice_remaining between 0 and 20),
  death_save_successes smallint not null default 0 check (death_save_successes between 0 and 3),
  death_save_failures smallint not null default 0 check (death_save_failures between 0 and 3),
  exhaustion smallint not null default 0 check (exhaustion between 0 and 6),
  inspiration boolean not null default false,
  conditions text[] not null default '{}',
  pronouns text not null default '' check (char_length(pronouns) <= 80),
  alignment text not null default '' check (char_length(alignment) <= 80),
  size text not null default 'medium' check (size in ('tiny', 'small', 'medium', 'large', 'huge', 'gargantuan')),
  age text not null default '' check (char_length(age) <= 80),
  height text not null default '' check (char_length(height) <= 80),
  weight_lbs numeric(8, 2) check (weight_lbs is null or weight_lbs between 0 and 999999.99),
  eyes text not null default '' check (char_length(eyes) <= 80),
  hair text not null default '' check (char_length(hair) <= 80),
  skin text not null default '' check (char_length(skin) <= 80),
  appearance text not null default '' check (char_length(appearance) <= 5000),
  biography text not null default '' check (char_length(biography) <= 20000),
  personality_traits text not null default '' check (char_length(personality_traits) <= 5000),
  ideals text not null default '' check (char_length(ideals) <= 5000),
  bonds text not null default '' check (char_length(bonds) <= 5000),
  flaws text not null default '' check (char_length(flaws) <= 5000),
  allies_organizations text not null default '' check (char_length(allies_organizations) <= 5000),
  languages text[] not null default '{}',
  senses text[] not null default '{}',
  concentration text not null default '' check (char_length(concentration) <= 160),
  combat_state text not null default 'conscious'
    check (combat_state in ('conscious', 'unconscious', 'stabilized', 'dead')),
  constraint characters_saving_throw_proficiencies_check check (saving_throw_proficiencies <@ array['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']),
  constraint characters_skill_proficiencies_check check (skill_proficiencies <@ array['acrobatics', 'animal_handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleight_of_hand', 'stealth', 'survival']),
  constraint characters_skill_expertise_check check (skill_expertise <@ skill_proficiencies),
  constraint characters_hit_dice_check check (hit_dice_remaining <= hit_dice_total),
  constraint characters_conditions_check check (conditions <@ array['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious']),
  constraint characters_languages_check check (cardinality(languages) <= 50 and char_length(array_to_string(languages, ',')) <= 2000),
  constraint characters_senses_check check (cardinality(senses) <= 50 and char_length(array_to_string(senses, ',')) <= 2000),
  constraint characters_check check (current_hp <= max_hp)
);

create table public.character_features (
  id bigint generated always as identity primary key,
  character_id bigint not null references public.characters (id) on delete cascade,
  kind text not null default 'class_feature'
    check (kind in ('class_feature', 'subclass_feature', 'ancestry_feature', 'background_feature', 'feat', 'passive', 'resource', 'other')),
  name text not null check (char_length(name) between 1 and 120),
  source text not null default '' check (char_length(source) <= 120),
  description text not null default '' check (char_length(description) <= 10000),
  level_acquired smallint check (level_acquired is null or level_acquired between 1 and 20),
  max_uses smallint check (max_uses is null or max_uses between 1 and 999),
  uses_remaining smallint check (uses_remaining is null or uses_remaining between 0 and 999),
  recovery text check (recovery is null or recovery in ('short_rest', 'long_rest', 'dawn', 'other')),
  is_active boolean not null default true,
  sort_order smallint not null default 0 check (sort_order between -9999 and 9999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint character_features_uses_check check (
    (max_uses is null and uses_remaining is null and recovery is null)
    or (max_uses is not null and uses_remaining is not null and uses_remaining <= max_uses)
  )
);

create table public.character_spellcasting_profiles (
  id bigint generated always as identity primary key,
  character_id bigint not null references public.characters (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  spellcasting_ability text not null check (spellcasting_ability in ('intelligence', 'wisdom', 'charisma')),
  preparation_mode text not null default 'known' check (preparation_mode in ('known', 'prepared', 'spellbook')),
  spell_save_dc smallint check (spell_save_dc is null or spell_save_dc between 0 and 99),
  spell_attack_bonus smallint check (spell_attack_bonus is null or spell_attack_bonus between -20 and 30),
  max_prepared smallint check (max_prepared is null or max_prepared between 0 and 999),
  is_pact_magic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (character_id, name)
);

create table public.character_spells (
  id bigint generated always as identity primary key,
  profile_id bigint not null references public.character_spellcasting_profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  spell_level smallint not null check (spell_level between 0 and 9),
  school text not null default '' check (char_length(school) <= 80),
  is_prepared boolean not null default false,
  is_ritual boolean not null default false,
  requires_concentration boolean not null default false,
  is_favorite boolean not null default false,
  casting_time text not null default '' check (char_length(casting_time) <= 120),
  range text not null default '' check (char_length(range) <= 120),
  duration text not null default '' check (char_length(duration) <= 120),
  components text not null default '' check (char_length(components) <= 500),
  description text not null default '' check (char_length(description) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, name)
);

create table public.character_spell_slots (
  profile_id bigint not null references public.character_spellcasting_profiles (id) on delete cascade,
  spell_level smallint not null check (spell_level between 1 and 9),
  maximum smallint not null check (maximum between 0 and 99),
  remaining smallint not null check (remaining between 0 and 99),
  updated_at timestamptz not null default now(),
  primary key (profile_id, spell_level),
  check (remaining <= maximum)
);

create table public.character_memories (
  id bigint generated always as identity primary key,
  character_id bigint not null references public.characters (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  campaign_id bigint references public.campaigns (id) on delete set null,
  session_id bigint,
  kind text not null default 'note' check (kind in ('note', 'item', 'relationship', 'location', 'discovery', 'objective', 'damage', 'healing', 'rest', 'condition', 'roll', 'action', 'other')),
  visibility text not null default 'private' check (visibility in ('private', 'shared')),
  title text not null check (char_length(title) between 1 and 160),
  summary text not null default '' check (char_length(summary) <= 5000),
  occurred_at timestamptz not null default now(),
  in_world_time text not null default '' check (char_length(in_world_time) <= 160),
  location text not null default '' check (char_length(location) <= 160),
  source_name text not null default '' check (char_length(source_name) <= 160),
  source_reference text not null default '' check (char_length(source_reference) <= 500),
  player_annotation text not null default '' check (char_length(player_annotation) <= 5000),
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(tags) <= 30 and char_length(array_to_string(tags, ',')) <= 2000)
);

create table public.character_inventory_items (
  id bigint generated always as identity primary key,
  character_id bigint not null references public.characters (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  quantity integer not null default 1 check (quantity between 0 and 999999),
  category text not null default 'other' check (category in ('currency', 'consumable', 'equipment', 'quest', 'treasure', 'tool', 'container', 'other')),
  weight numeric(10, 3) check (weight is null or weight between 0 and 999999.999),
  value text not null default '' check (char_length(value) <= 120),
  location text not null default 'Carried' check (char_length(location) between 1 and 120),
  is_equipped boolean not null default false,
  is_attuned boolean not null default false,
  notes text not null default '' check (char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_rules (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_minute smallint not null check (start_minute between 0 and 1439),
  end_minute smallint not null check (end_minute between 1 and 1440),
  preference text not null default 'available'
    check (preference in ('available', 'preferred')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_minute > start_minute),
  unique (campaign_id, user_id, weekday, start_minute, end_minute)
);

create table public.availability_exceptions (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  availability text not null check (availability in ('available', 'preferred', 'unavailable')),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.sessions (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 120),
  agenda text not null default '' check (char_length(agenda) <= 5000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'proposed'
    check (status in ('proposed', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.session_attendance (
  session_id bigint not null references public.sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  response text not null default 'unanswered'
    check (response in ('unanswered', 'attending', 'tentative', 'absent')),
  note text not null default '' check (char_length(note) <= 500),
  responded_at timestamptz,
  ready_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table public.character_condition_instances (
  id bigint generated always as identity primary key,
  character_id bigint not null references public.characters (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  session_id bigint not null references public.sessions (id) on delete cascade,
  condition text not null
    check (condition in ('blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious')),
  source text not null default '' check (char_length(source) <= 160),
  remaining_rounds smallint check (remaining_rounds is null or remaining_rounds between 1 and 999),
  applied_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (character_id, condition)
);

create table public.session_encounters (
  session_id bigint primary key references public.sessions (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  name text not null default 'Encounter' check (char_length(name) between 1 and 120),
  status text not null default 'active' check (status in ('active', 'ended')),
  round_number integer not null default 1 check (round_number between 1 and 999999),
  active_character_id bigint references public.characters (id) on delete set null,
  active_entry_id bigint,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'active' and ended_at is null) or (status = 'ended' and ended_at is not null))
);

create table public.session_initiative_entries (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.sessions (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  character_id bigint references public.characters (id) on delete cascade,
  combatant_name text not null default '' check (char_length(combatant_name) <= 120),
  combatant_kind text not null default 'character' check (combatant_kind in ('character', 'monster', 'npc', 'custom')),
  initiative integer not null check (initiative between -100 and 200),
  armor_class integer check (armor_class between 0 and 99),
  current_hp integer check (current_hp between 0 and 999999),
  max_hp integer check (max_hp between 1 and 999999),
  temporary_hp integer check (temporary_hp between 0 and 999999),
  is_hidden boolean not null default false,
  action_used boolean not null default false,
  bonus_action_used boolean not null default false,
  reaction_used boolean not null default false,
  object_interaction_used boolean not null default false,
  movement_used integer not null default 0 check (movement_used between 0 and 10000),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, character_id),
  unique (session_id, id),
  check (
    (character_id is not null and combatant_kind = 'character' and combatant_name = '')
    or (character_id is null and combatant_kind <> 'character' and char_length(combatant_name) between 1 and 120)
  ),
  check (
    (max_hp is null and current_hp is null and temporary_hp is null)
    or (max_hp is not null and current_hp is not null and temporary_hp is not null and current_hp <= max_hp)
  )
);

alter table public.session_encounters
  add constraint session_encounters_active_entry_fkey
  foreign key (session_id, active_entry_id)
  references public.session_initiative_entries (session_id, id)
  on delete set null (active_entry_id);

create table public.session_action_proposals (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.sessions (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  character_id bigint references public.characters (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  kind text not null check (kind in ('attack', 'magic', 'item', 'movement', 'speech', 'custom')),
  title text not null check (char_length(title) between 1 and 160),
  details text not null default '' check (char_length(details) <= 5000),
  approval_mode text not null default 'soft' check (approval_mode in ('soft', 'hard')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied', 'clarification')),
  reviewer_note text not null default '' check (char_length(reviewer_note) <= 2000),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_reaction_prompts (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.sessions (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  character_id bigint not null references public.characters (id) on delete cascade,
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  prompt text not null check (char_length(prompt) between 1 and 1000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  expires_at timestamptz not null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create table public.session_events (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.sessions (id) on delete cascade,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  character_id bigint references public.characters (id) on delete set null,
  kind text not null default 'note' check (kind in ('narration', 'dialogue', 'action', 'roll', 'damage', 'healing', 'condition', 'item', 'discovery', 'location', 'objective', 'rest', 'system', 'note')),
  visibility text not null default 'party' check (visibility in ('party', 'gm_only')),
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 10000),
  in_world_time text not null default '' check (char_length(in_world_time) <= 160),
  location text not null default '' check (char_length(location) <= 160),
  round_number integer check (round_number is null or round_number between 1 and 999999),
  sequence_number integer not null default 0 check (sequence_number between 0 and 999999999),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.character_memories
  add constraint character_memories_session_id_fkey
  foreign key (session_id) references public.sessions (id) on delete set null;

create table public.campaign_announcements (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 5000),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id bigint references public.campaigns (id) on delete cascade,
  session_id bigint references public.sessions (id) on delete cascade,
  kind text not null check (kind in ('announcement', 'session_proposed', 'session_updated', 'invitation', 'system')),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.campaign_invitations (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  invited_by uuid not null references public.profiles (id) on delete cascade,
  invited_email text not null check (char_length(invited_email) between 3 and 320),
  role text not null default 'player' check (role in ('game_master', 'player', 'observer')),
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_documents (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  kind text not null default 'note' check (kind in ('note', 'resource')),
  visibility text not null default 'shared' check (visibility in ('shared', 'game_master')),
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 10000),
  url text not null default '' check (char_length(url) <= 2000),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind = 'note' or url ~* '^https?://')
);

create table public.campaign_world_states (
  campaign_id bigint primary key references public.campaigns (id) on delete cascade,
  updated_by uuid not null references public.profiles (id) on delete restrict,
  current_location text not null default '' check (char_length(current_location) <= 200),
  in_world_datetime text not null default '' check (char_length(in_world_datetime) <= 200),
  weather text not null default '' check (char_length(weather) <= 500),
  summary text not null default '' check (char_length(summary) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_gm_states (
  campaign_id bigint primary key references public.campaigns (id) on delete cascade,
  updated_by uuid not null references public.profiles (id) on delete restrict,
  secret_state text not null default '' check (char_length(secret_state) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_objectives (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  status text not null default 'active' check (status in ('active', 'completed', 'failed', 'abandoned')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  is_secret boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_inventory_items (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '' check (char_length(description) <= 2000),
  quantity integer not null default 1 check (quantity between 0 and 999999),
  unit text not null default '' check (char_length(unit) <= 40),
  category text not null default 'other' check (category in ('currency', 'consumable', 'equipment', 'quest', 'treasure', 'other')),
  holder text not null default 'Party' check (char_length(holder) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_tasks (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  assigned_to uuid references public.profiles (id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 3000),
  category text not null default 'preparation' check (category in ('preparation', 'downtime')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_at timestamptz,
  is_gm_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_references (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  kind text not null check (kind in ('npc', 'faction', 'location')),
  name text not null check (char_length(name) between 1 and 160),
  summary text not null default '' check (char_length(summary) <= 1000),
  details text not null default '' check (char_length(details) <= 10000),
  status text not null default 'active' check (char_length(status) between 1 and 80),
  tags text[] not null default '{}',
  is_secret boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(tags) <= 20)
);

create table public.campaign_maps (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  location_reference_id bigint references public.campaign_references (id) on delete set null,
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '' check (char_length(description) <= 3000),
  storage_path text not null unique check (storage_path ~ '^[0-9]+/[0-9a-f-]+\.(png|jpg|jpeg|webp)$'),
  mime_type text not null check (mime_type in ('image/png', 'image/jpeg', 'image/webp')),
  file_size bigint not null check (file_size between 1 and 20971520),
  width integer check (width is null or width between 1 and 50000),
  height integer check (height is null or height between 1 and 50000),
  visibility text not null default 'shared' check (visibility in ('shared', 'game_master')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index campaigns_owner_id_idx on public.campaigns (owner_id);
create index campaign_members_user_id_status_idx
  on public.campaign_members (user_id, status);
create index characters_owner_id_idx on public.characters (owner_id);
create index characters_campaign_id_idx on public.characters (campaign_id)
  where campaign_id is not null;
create index character_features_character_kind_idx
  on public.character_features (character_id, kind, sort_order, name);
create index character_spellcasting_profiles_character_idx
  on public.character_spellcasting_profiles (character_id, name);
create index character_spells_profile_level_idx
  on public.character_spells (profile_id, spell_level, name);
create index character_memories_character_time_idx
  on public.character_memories (character_id, is_pinned desc, occurred_at desc);
create index character_memories_campaign_session_idx
  on public.character_memories (campaign_id, session_id) where campaign_id is not null;
create index character_inventory_items_character_category_idx
  on public.character_inventory_items (character_id, category, name);
create index availability_rules_user_campaign_idx on public.availability_rules (user_id, campaign_id);
create index availability_exceptions_campaign_time_idx on public.availability_exceptions (campaign_id, starts_at, ends_at);
create index availability_exceptions_user_id_idx on public.availability_exceptions (user_id);
create index sessions_campaign_starts_at_idx on public.sessions (campaign_id, starts_at);
create unique index sessions_one_active_per_campaign_idx on public.sessions (campaign_id) where status in ('active', 'paused');
create index sessions_created_by_idx on public.sessions (created_by);
create index session_encounters_campaign_id_idx on public.session_encounters (campaign_id);
create index character_condition_instances_campaign_id_idx on public.character_condition_instances (campaign_id);
create index character_condition_instances_session_id_idx on public.character_condition_instances (session_id);
create index session_encounters_active_character_id_idx on public.session_encounters (active_character_id);
create index session_encounters_active_entry_id_idx on public.session_encounters (active_entry_id) where active_entry_id is not null;
create index session_initiative_entries_campaign_id_idx on public.session_initiative_entries (campaign_id);
create index session_initiative_entries_character_id_idx on public.session_initiative_entries (character_id);
create index session_action_proposals_session_created_idx on public.session_action_proposals (session_id, created_at desc);
create index session_action_proposals_campaign_id_idx on public.session_action_proposals (campaign_id);
create index session_action_proposals_character_id_idx on public.session_action_proposals (character_id) where character_id is not null;
create index session_action_proposals_created_by_idx on public.session_action_proposals (created_by);
create index session_action_proposals_reviewed_by_idx on public.session_action_proposals (reviewed_by) where reviewed_by is not null;
create index session_reaction_prompts_session_created_idx on public.session_reaction_prompts (session_id, created_at desc);
create index session_reaction_prompts_target_pending_idx on public.session_reaction_prompts (target_user_id, expires_at) where status = 'pending';
create index session_reaction_prompts_campaign_id_idx on public.session_reaction_prompts (campaign_id);
create index session_reaction_prompts_character_id_idx on public.session_reaction_prompts (character_id);
create index session_reaction_prompts_created_by_idx on public.session_reaction_prompts (created_by);
create index session_attendance_user_id_idx on public.session_attendance (user_id);
create index session_events_session_timeline_idx on public.session_events (session_id, occurred_at desc, sequence_number desc);
create index session_events_character_idx on public.session_events (character_id, occurred_at desc) where character_id is not null;
create index session_events_actor_idx on public.session_events (actor_id);
create index campaign_announcements_campaign_pinned_idx on public.campaign_announcements (campaign_id, is_pinned desc, created_at desc);
create index campaign_announcements_author_id_idx on public.campaign_announcements (author_id);
create index notifications_recipient_unread_idx on public.notifications (recipient_id, created_at desc) where read_at is null;
create index notifications_campaign_id_idx on public.notifications (campaign_id) where campaign_id is not null;
create index notifications_session_id_idx on public.notifications (session_id) where session_id is not null;
create unique index campaign_invitations_pending_email_idx on public.campaign_invitations (campaign_id, invited_email) where status = 'pending';
create index campaign_invitations_email_status_idx on public.campaign_invitations (invited_email, status, expires_at);
create index campaign_invitations_invited_by_idx on public.campaign_invitations (invited_by);
create index campaign_documents_campaign_visibility_idx
  on public.campaign_documents (campaign_id, visibility, is_pinned desc, updated_at desc);
create index campaign_documents_author_id_idx on public.campaign_documents (author_id);
create index campaign_world_states_updated_by_idx on public.campaign_world_states (updated_by);
create index campaign_gm_states_updated_by_idx on public.campaign_gm_states (updated_by);
create index campaign_objectives_campaign_status_idx on public.campaign_objectives (campaign_id, status, priority, updated_at desc);
create index campaign_objectives_created_by_idx on public.campaign_objectives (created_by);
create index campaign_inventory_items_campaign_category_idx on public.campaign_inventory_items (campaign_id, category, updated_at desc);
create index campaign_inventory_items_created_by_idx on public.campaign_inventory_items (created_by);
create index campaign_tasks_campaign_status_idx on public.campaign_tasks (campaign_id, status, category, due_at);
create index campaign_tasks_created_by_idx on public.campaign_tasks (created_by);
create index campaign_tasks_assigned_to_idx on public.campaign_tasks (assigned_to) where assigned_to is not null;
create index campaign_references_campaign_kind_idx on public.campaign_references (campaign_id, kind, name);
create index campaign_references_created_by_idx on public.campaign_references (created_by);
create index campaign_maps_campaign_created_idx on public.campaign_maps (campaign_id, created_at desc);
create index campaign_maps_uploaded_by_idx on public.campaign_maps (uploaded_by);
create index campaign_maps_location_reference_idx on public.campaign_maps (location_reference_id) where location_reference_id is not null;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger campaigns_set_updated_at
before update on public.campaigns
for each row execute function private.set_updated_at();

create trigger campaign_members_set_updated_at
before update on public.campaign_members
for each row execute function private.set_updated_at();

create trigger characters_set_updated_at
before update on public.characters
for each row execute function private.set_updated_at();

create trigger character_features_set_updated_at
before update on public.character_features
for each row execute function private.set_updated_at();

create trigger character_spellcasting_profiles_set_updated_at before update on public.character_spellcasting_profiles for each row execute function private.set_updated_at();
create trigger character_spells_set_updated_at before update on public.character_spells for each row execute function private.set_updated_at();
create trigger character_spell_slots_set_updated_at before update on public.character_spell_slots for each row execute function private.set_updated_at();
create trigger character_memories_set_updated_at before update on public.character_memories for each row execute function private.set_updated_at();
create trigger character_inventory_items_set_updated_at before update on public.character_inventory_items for each row execute function private.set_updated_at();

create function private.record_character_inventory_memory()
returns trigger
language plpgsql
set search_path = ''
as $$
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
$$;

create trigger character_inventory_items_record_memory
after insert or update or delete on public.character_inventory_items
for each row execute function private.record_character_inventory_memory();

create function private.record_session_event_memory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.character_id is null or new.visibility <> 'party' then
    return new;
  end if;

  insert into public.character_memories (
    character_id, created_by, campaign_id, session_id, kind, visibility,
    title, summary, occurred_at, in_world_time, location, source_name,
    source_reference, tags, metadata
  ) values (
    new.character_id, new.actor_id, new.campaign_id, new.session_id,
    case when new.kind in ('damage', 'healing', 'condition', 'item', 'discovery', 'location', 'objective', 'rest', 'roll', 'action') then new.kind else 'other' end,
    'shared', new.title, new.body, new.occurred_at, new.in_world_time,
    new.location, 'Session event', 'session_events:' || new.id,
    array['session', new.kind],
    new.metadata || jsonb_build_object('session_event_id', new.id, 'event_kind', new.kind)
  );
  return new;
end;
$$;

create trigger session_events_record_memory
after insert on public.session_events
for each row execute function private.record_session_event_memory();

create function private.record_approved_action_proposal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'approved' or
    (tg_op = 'UPDATE' and old.status = 'approved') then
    return new;
  end if;

  insert into public.session_events (
    session_id, campaign_id, actor_id, character_id, kind, visibility,
    title, body, metadata
  ) values (
    new.session_id, new.campaign_id, new.created_by, new.character_id,
    'action', 'party', new.title,
    new.details || case when new.reviewer_note = '' then '' else E'\n\nGM ruling: ' || new.reviewer_note end,
    jsonb_build_object(
      'action_proposal_id', new.id,
      'action_kind', new.kind,
      'approval_mode', new.approval_mode,
      'reviewed_by', new.reviewed_by
    )
  );
  return new;
end;
$$;

create trigger action_proposals_record_approved_event
after insert or update of status on public.session_action_proposals
for each row execute function private.record_approved_action_proposal();

create function private.respond_reaction_prompt(requested_prompt_id bigint, should_accept boolean)
returns public.session_reaction_prompts
language plpgsql security definer set search_path = '' as $$
declare target public.session_reaction_prompts;
begin
  if (select auth.uid()) is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  select * into target from public.session_reaction_prompts where id = requested_prompt_id for update;
  if target.id is null or target.target_user_id <> (select auth.uid()) then raise exception 'Reaction prompt is unavailable.' using errcode = '42501'; end if;
  if target.status <> 'pending' or target.expires_at <= now() then raise exception 'Reaction prompt has expired or was already answered.' using errcode = 'P0001'; end if;
  update public.session_reaction_prompts set status = case when should_accept then 'accepted' else 'declined' end, responded_at = now() where id = target.id returning * into target;
  insert into public.session_events (session_id, campaign_id, actor_id, character_id, kind, visibility, title, body, metadata)
  values (target.session_id, target.campaign_id, target.target_user_id, target.character_id, 'action', 'party', case when should_accept then 'Reaction accepted' else 'Reaction declined' end, target.prompt, jsonb_build_object('reaction_prompt_id', target.id, 'accepted', should_accept));
  return target;
end; $$;
create function public.respond_reaction_prompt(prompt_id bigint, should_accept boolean)
returns public.session_reaction_prompts language sql security invoker set search_path = '' as $$ select private.respond_reaction_prompt(prompt_id, should_accept); $$;
revoke execute on function private.respond_reaction_prompt(bigint, boolean) from public, anon;
revoke execute on function public.respond_reaction_prompt(bigint, boolean) from public, anon;
grant execute on function private.respond_reaction_prompt(bigint, boolean) to authenticated;
grant execute on function public.respond_reaction_prompt(bigint, boolean) to authenticated;

create trigger availability_rules_set_updated_at before update on public.availability_rules for each row execute function private.set_updated_at();
create trigger availability_exceptions_set_updated_at before update on public.availability_exceptions for each row execute function private.set_updated_at();
create trigger sessions_set_updated_at before update on public.sessions for each row execute function private.set_updated_at();
create trigger session_attendance_set_updated_at before update on public.session_attendance for each row execute function private.set_updated_at();
create trigger session_encounters_set_updated_at before update on public.session_encounters for each row execute function private.set_updated_at();
create trigger character_condition_instances_set_updated_at before update on public.character_condition_instances for each row execute function private.set_updated_at();
create trigger session_initiative_entries_set_updated_at before update on public.session_initiative_entries for each row execute function private.set_updated_at();
create trigger session_action_proposals_set_updated_at before update on public.session_action_proposals for each row execute function private.set_updated_at();
create trigger campaign_announcements_set_updated_at before update on public.campaign_announcements for each row execute function private.set_updated_at();
create trigger campaign_documents_set_updated_at before update on public.campaign_documents for each row execute function private.set_updated_at();
create trigger campaign_world_states_set_updated_at before update on public.campaign_world_states for each row execute function private.set_updated_at();
create trigger campaign_gm_states_set_updated_at before update on public.campaign_gm_states for each row execute function private.set_updated_at();
create trigger campaign_objectives_set_updated_at before update on public.campaign_objectives for each row execute function private.set_updated_at();
create trigger campaign_inventory_items_set_updated_at before update on public.campaign_inventory_items for each row execute function private.set_updated_at();
create trigger campaign_tasks_set_updated_at before update on public.campaign_tasks for each row execute function private.set_updated_at();
create trigger campaign_references_set_updated_at before update on public.campaign_references for each row execute function private.set_updated_at();
create trigger campaign_maps_set_updated_at before update on public.campaign_maps for each row execute function private.set_updated_at();

create function private.notify_campaign_announcement()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (recipient_id, campaign_id, kind, title, body)
  select user_id, new.campaign_id, 'announcement', new.title, left(new.body, 1000)
  from public.campaign_members
  where campaign_id = new.campaign_id and status = 'active' and user_id <> new.author_id;
  return new;
end;
$$;

create function private.notify_session_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (recipient_id, campaign_id, session_id, kind, title, body)
  select user_id, new.campaign_id, new.id,
    case when tg_op = 'INSERT' then 'session_proposed' else 'session_updated' end,
    case when tg_op = 'INSERT' then 'New session proposed' else 'Session updated' end,
    new.title
  from public.campaign_members
  where campaign_id = new.campaign_id and status = 'active' and user_id <> (select auth.uid());
  return new;
end;
$$;

revoke execute on function private.notify_campaign_announcement() from public, anon, authenticated;
revoke execute on function private.notify_session_change() from public, anon, authenticated;

create trigger notify_after_campaign_announcement after insert on public.campaign_announcements for each row execute function private.notify_campaign_announcement();
create trigger notify_after_session_insert after insert on public.sessions for each row execute function private.notify_session_change();
create trigger notify_after_session_schedule_change after update of starts_at, ends_at, status on public.sessions for each row when (old.* is distinct from new.*) execute function private.notify_session_change();

create trigger campaign_invitations_set_updated_at before update on public.campaign_invitations for each row execute function private.set_updated_at();

create function private.respond_campaign_invitation(invitation_token uuid, should_accept boolean)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  invitation public.campaign_invitations;
  current_user_id uuid := (select auth.uid());
  current_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
begin
  if current_user_id is null then raise exception 'Authentication is required.' using errcode = '42501'; end if;
  select * into invitation from public.campaign_invitations
  where token = invitation_token and status = 'pending' and expires_at > now() and invited_email = current_email
  for update;
  if invitation.id is null then raise exception 'Invitation is invalid, expired, or belongs to another account.' using errcode = 'P0001'; end if;
  if should_accept then
    insert into public.campaign_members (campaign_id, user_id, role, status, joined_at)
    values (invitation.campaign_id, current_user_id, invitation.role, 'active', now())
    on conflict (campaign_id, user_id) do update set role = excluded.role, status = 'active', joined_at = coalesce(public.campaign_members.joined_at, excluded.joined_at), updated_at = now();
  end if;
  update public.campaign_invitations set status = case when should_accept then 'accepted' else 'declined' end where id = invitation.id;
  return invitation.campaign_id;
end;
$$;

create function public.respond_campaign_invitation(invitation_token uuid, should_accept boolean)
returns bigint language sql security invoker set search_path = '' as $$ select private.respond_campaign_invitation(invitation_token, should_accept); $$;

revoke execute on function private.respond_campaign_invitation(uuid, boolean) from public, anon;
revoke execute on function public.respond_campaign_invitation(uuid, boolean) from public, anon;
grant execute on function private.respond_campaign_invitation(uuid, boolean) to authenticated;
grant execute on function public.respond_campaign_invitation(uuid, boolean) to authenticated;

create function private.add_campaign_owner_as_member()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.campaign_members (
    campaign_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (new.id, new.owner_id, 'owner', 'active', now());
  return new;
end;
$$;

create trigger add_campaign_owner_after_insert
after insert on public.campaigns
for each row execute function private.add_campaign_owner_as_member();

create function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, 'adventurer'), '@', 1)
    )
  );
  return new;
end;
$$;

create trigger create_profile_after_signup
after insert on auth.users
for each row execute function private.create_profile_for_new_user();

create function private.is_campaign_member(requested_campaign_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaign_members
    where campaign_id = requested_campaign_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$$;

create function private.is_campaign_owner(requested_campaign_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaigns
    where id = requested_campaign_id
      and owner_id = (select auth.uid())
  );
$$;

create function private.is_campaign_manager(requested_campaign_id bigint)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.campaigns where id = requested_campaign_id and owner_id = (select auth.uid())
  ) or exists (
    select 1 from public.campaign_members where campaign_id = requested_campaign_id
      and user_id = (select auth.uid()) and status = 'active' and role in ('owner', 'game_master')
  );
$$;

create function private.shares_active_campaign(requested_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.campaign_members viewer_membership
    join public.campaign_members requested_membership
      on requested_membership.campaign_id = viewer_membership.campaign_id
    where viewer_membership.user_id = (select auth.uid())
      and viewer_membership.status = 'active'
      and requested_membership.user_id = requested_user_id
      and requested_membership.status = 'active'
  );
$$;

create function private.join_campaign_by_code(campaign_code text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  requested_campaign_id bigint;
  approval_required boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select id, requires_join_approval
  into requested_campaign_id, approval_required
  from public.campaigns
  where invite_code = upper(trim(campaign_code))
    and status in ('forming', 'active', 'paused');

  if requested_campaign_id is null then
    raise exception 'Campaign code is invalid or the campaign is unavailable.'
      using errcode = 'P0001';
  end if;

  if exists (select 1 from public.campaign_members where campaign_id = requested_campaign_id and user_id = current_user_id and status = 'banned') then
    raise exception 'You have been banned from this campaign.' using errcode = '42501';
  end if;

  insert into public.campaign_members (
    campaign_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (requested_campaign_id, current_user_id, 'player', case when approval_required then 'pending' else 'active' end, case when approval_required then null else now() end)
  on conflict (campaign_id, user_id) do update
  set status = excluded.status,
      joined_at = case when excluded.status = 'active' then coalesce(public.campaign_members.joined_at, excluded.joined_at) else null end,
      updated_at = now()
  where public.campaign_members.status in ('declined', 'removed', 'pending');

  return requested_campaign_id;
end;
$$;

create function public.join_campaign(campaign_code text)
returns bigint
language sql
security invoker
set search_path = ''
as $$
  select private.join_campaign_by_code(campaign_code);
$$;

create function private.apply_character_health_change(
  requested_session_id bigint,
  requested_character_id bigint,
  change_kind text,
  amount integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create function public.apply_character_health_change(
  session_id bigint,
  character_id bigint,
  change_kind text,
  amount integer
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.apply_character_health_change(session_id, character_id, change_kind, amount);
$$;

create function private.apply_character_status_change(
  requested_session_id bigint,
  requested_character_id bigint,
  requested_operation text,
  requested_value text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create function public.apply_character_status_change(
  session_id bigint,
  character_id bigint,
  operation text,
  value text default ''
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.apply_character_status_change(session_id, character_id, operation, value);
$$;

create function private.apply_character_condition(
  requested_session_id bigint,
  requested_character_id bigint,
  requested_operation text,
  requested_condition text,
  requested_source text default '',
  requested_rounds integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create function public.apply_character_condition(
  session_id bigint,
  character_id bigint,
  operation text,
  condition text,
  source text default '',
  duration_rounds integer default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.apply_character_condition(
    session_id, character_id, operation, condition, source, duration_rounds
  );
$$;

create function private.tick_character_conditions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create function private.resolve_session_attack(
  requested_session_id bigint,
  requested_attacker_character_id bigint,
  requested_target_entry_id bigint,
  requested_attack_name text,
  requested_natural_roll integer,
  requested_attack_total integer,
  requested_damage integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create function public.resolve_session_attack(
  session_id bigint,
  attacker_character_id bigint,
  target_entry_id bigint,
  attack_name text,
  natural_roll integer,
  attack_total integer,
  damage integer
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.resolve_session_attack(
    session_id, attacker_character_id, target_entry_id, attack_name,
    natural_roll, attack_total, damage
  );
$$;

create trigger session_encounters_tick_conditions
after update of round_number on public.session_encounters
for each row
when (new.round_number > old.round_number)
execute function private.tick_character_conditions();

revoke execute on function private.set_updated_at() from public, anon, authenticated;
revoke execute on function private.record_approved_action_proposal() from public, anon, authenticated;
revoke execute on function private.record_character_inventory_memory() from public, anon, authenticated;
revoke execute on function private.record_session_event_memory() from public, anon, authenticated;
revoke execute on function private.create_profile_for_new_user() from public, anon, authenticated;
revoke execute on function private.add_campaign_owner_as_member() from public, anon, authenticated;
revoke execute on function private.is_campaign_member(bigint) from public, anon;
revoke execute on function private.is_campaign_owner(bigint) from public, anon;
revoke execute on function private.is_campaign_manager(bigint) from public, anon;
revoke execute on function private.shares_active_campaign(uuid) from public, anon;
revoke execute on function private.join_campaign_by_code(text) from public, anon;
revoke execute on function public.join_campaign(text) from public, anon;
revoke execute on function private.apply_character_health_change(bigint, bigint, text, integer) from public, anon;
revoke execute on function public.apply_character_health_change(bigint, bigint, text, integer) from public, anon;
revoke execute on function private.apply_character_status_change(bigint, bigint, text, text) from public, anon;
revoke execute on function public.apply_character_status_change(bigint, bigint, text, text) from public, anon;
revoke execute on function private.apply_character_condition(bigint, bigint, text, text, text, integer) from public, anon, authenticated;
revoke execute on function public.apply_character_condition(bigint, bigint, text, text, text, integer) from public, anon;
revoke execute on function private.tick_character_conditions() from public, anon, authenticated;
revoke execute on function private.resolve_session_attack(bigint, bigint, bigint, text, integer, integer, integer) from public, anon, authenticated;
revoke execute on function public.resolve_session_attack(bigint, bigint, bigint, text, integer, integer, integer) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_campaign_member(bigint) to authenticated;
grant execute on function private.is_campaign_owner(bigint) to authenticated;
grant execute on function private.is_campaign_manager(bigint) to authenticated;
grant execute on function private.shares_active_campaign(uuid) to authenticated;
grant execute on function private.join_campaign_by_code(text) to authenticated;
grant execute on function public.join_campaign(text) to authenticated;
grant execute on function private.apply_character_health_change(bigint, bigint, text, integer) to authenticated;
grant execute on function public.apply_character_health_change(bigint, bigint, text, integer) to authenticated;
grant execute on function private.apply_character_status_change(bigint, bigint, text, text) to authenticated;
grant execute on function public.apply_character_status_change(bigint, bigint, text, text) to authenticated;
grant execute on function private.apply_character_condition(bigint, bigint, text, text, text, integer) to authenticated;
grant execute on function public.apply_character_condition(bigint, bigint, text, text, text, integer) to authenticated;
grant execute on function private.resolve_session_attack(bigint, bigint, bigint, text, integer, integer, integer) to authenticated;
grant execute on function public.resolve_session_attack(bigint, bigint, bigint, text, integer, integer, integer) to authenticated;

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.characters enable row level security;
alter table public.character_features enable row level security;
alter table public.character_spellcasting_profiles enable row level security;
alter table public.character_spells enable row level security;
alter table public.character_spell_slots enable row level security;
alter table public.character_memories enable row level security;
alter table public.character_inventory_items enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.sessions enable row level security;
alter table public.session_attendance enable row level security;
alter table public.session_encounters enable row level security;
alter table public.character_condition_instances enable row level security;
alter table public.session_initiative_entries enable row level security;
alter table public.session_action_proposals enable row level security;
alter table public.session_reaction_prompts enable row level security;
alter table public.session_events enable row level security;
alter table public.campaign_announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.campaign_invitations enable row level security;
alter table public.campaign_documents enable row level security;
alter table public.campaign_world_states enable row level security;
alter table public.campaign_gm_states enable row level security;
alter table public.campaign_objectives enable row level security;
alter table public.campaign_inventory_items enable row level security;
alter table public.campaign_tasks enable row level security;
alter table public.campaign_references enable row level security;
alter table public.campaign_maps enable row level security;

create policy profiles_select_own
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.shares_active_campaign(id))
);

create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy campaigns_select_member
on public.campaigns for select
to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.is_campaign_member(id))
);

create policy campaigns_insert_owner
on public.campaigns for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy campaigns_update_owner
on public.campaigns for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy campaigns_delete_owner
on public.campaigns for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy campaign_members_select_campaign
on public.campaign_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or (status = 'active' and (select private.is_campaign_member(campaign_id)))
  or (select private.is_campaign_manager(campaign_id))
);

create policy campaign_members_insert_owner
on public.campaign_members for insert
to authenticated
with check ((select private.is_campaign_owner(campaign_id)));

create policy campaign_members_update_owner
on public.campaign_members for update
to authenticated
using ((select private.is_campaign_owner(campaign_id)))
with check ((select private.is_campaign_owner(campaign_id)));

create policy campaign_members_delete_owner_or_self
on public.campaign_members for delete
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_campaign_owner(campaign_id))
);

create policy characters_select_owner_or_campaign_member
on public.characters for select
to authenticated
using (
  owner_id = (select auth.uid())
  or (
    campaign_id is not null
    and (select private.is_campaign_member(campaign_id))
  )
);

create policy characters_insert_owner
on public.characters for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (
    campaign_id is null
    or (select private.is_campaign_member(campaign_id))
  )
);

create policy characters_update_owner
on public.characters for update
to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and (
    campaign_id is null
    or (select private.is_campaign_member(campaign_id))
  )
);

create policy characters_delete_owner
on public.characters for delete
to authenticated
using (owner_id = (select auth.uid()));

create policy character_features_select_visible_character
on public.character_features for select
to authenticated
using (
  exists (
    select 1 from public.characters
    where characters.id = character_features.character_id
  )
);

create policy character_features_insert_character_owner
on public.character_features for insert
to authenticated
with check (
  exists (
    select 1 from public.characters
    where characters.id = character_features.character_id
      and characters.owner_id = (select auth.uid())
  )
);

create policy character_features_update_character_owner
on public.character_features for update
to authenticated
using (
  exists (
    select 1 from public.characters
    where characters.id = character_features.character_id
      and characters.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.characters
    where characters.id = character_features.character_id
      and characters.owner_id = (select auth.uid())
  )
);

create policy character_features_delete_character_owner
on public.character_features for delete
to authenticated
using (
  exists (
    select 1 from public.characters
    where characters.id = character_features.character_id
      and characters.owner_id = (select auth.uid())
  )
);

create policy spellcasting_profiles_select_visible_character on public.character_spellcasting_profiles for select to authenticated
using (exists (select 1 from public.characters where characters.id = character_spellcasting_profiles.character_id));
create policy spellcasting_profiles_insert_owner on public.character_spellcasting_profiles for insert to authenticated
with check (exists (select 1 from public.characters where characters.id = character_spellcasting_profiles.character_id and characters.owner_id = (select auth.uid())));
create policy spellcasting_profiles_update_owner on public.character_spellcasting_profiles for update to authenticated
using (exists (select 1 from public.characters where characters.id = character_spellcasting_profiles.character_id and characters.owner_id = (select auth.uid())))
with check (exists (select 1 from public.characters where characters.id = character_spellcasting_profiles.character_id and characters.owner_id = (select auth.uid())));
create policy spellcasting_profiles_delete_owner on public.character_spellcasting_profiles for delete to authenticated
using (exists (select 1 from public.characters where characters.id = character_spellcasting_profiles.character_id and characters.owner_id = (select auth.uid())));

create policy character_spells_select_visible_character on public.character_spells for select to authenticated
using (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spells.profile_id));
create policy character_spells_insert_owner on public.character_spells for insert to authenticated
with check (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spells.profile_id and characters.owner_id = (select auth.uid())));
create policy character_spells_update_owner on public.character_spells for update to authenticated
using (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spells.profile_id and characters.owner_id = (select auth.uid())))
with check (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spells.profile_id and characters.owner_id = (select auth.uid())));
create policy character_spells_delete_owner on public.character_spells for delete to authenticated
using (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spells.profile_id and characters.owner_id = (select auth.uid())));

create policy character_spell_slots_select_visible_character on public.character_spell_slots for select to authenticated
using (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spell_slots.profile_id));
create policy character_spell_slots_insert_owner on public.character_spell_slots for insert to authenticated
with check (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spell_slots.profile_id and characters.owner_id = (select auth.uid())));
create policy character_spell_slots_update_owner on public.character_spell_slots for update to authenticated
using (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spell_slots.profile_id and characters.owner_id = (select auth.uid())))
with check (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spell_slots.profile_id and characters.owner_id = (select auth.uid())));
create policy character_spell_slots_delete_owner on public.character_spell_slots for delete to authenticated
using (exists (select 1 from public.character_spellcasting_profiles join public.characters on characters.id = character_spellcasting_profiles.character_id where character_spellcasting_profiles.id = character_spell_slots.profile_id and characters.owner_id = (select auth.uid())));

create policy character_memories_select_allowed on public.character_memories for select to authenticated
using (exists (
  select 1 from public.characters
  where characters.id = character_memories.character_id
    and (
      characters.owner_id = (select auth.uid())
      or (character_memories.visibility = 'shared' and characters.campaign_id is not null and (select private.is_campaign_member(characters.campaign_id)))
    )
));
create policy character_memories_insert_owner on public.character_memories for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.characters where characters.id = character_memories.character_id and characters.owner_id = (select auth.uid())));
create policy character_memories_update_owner on public.character_memories for update to authenticated
using (exists (select 1 from public.characters where characters.id = character_memories.character_id and characters.owner_id = (select auth.uid())))
with check (created_by = (select auth.uid()) and exists (select 1 from public.characters where characters.id = character_memories.character_id and characters.owner_id = (select auth.uid())));
create policy character_memories_delete_owner on public.character_memories for delete to authenticated
using (exists (select 1 from public.characters where characters.id = character_memories.character_id and characters.owner_id = (select auth.uid())));

create policy character_inventory_items_select_visible_character on public.character_inventory_items for select to authenticated
using (exists (select 1 from public.characters where characters.id = character_inventory_items.character_id));
create policy character_inventory_items_insert_owner on public.character_inventory_items for insert to authenticated
with check (exists (select 1 from public.characters where characters.id = character_inventory_items.character_id and characters.owner_id = (select auth.uid())));
create policy character_inventory_items_update_owner on public.character_inventory_items for update to authenticated
using (exists (select 1 from public.characters where characters.id = character_inventory_items.character_id and characters.owner_id = (select auth.uid())))
with check (exists (select 1 from public.characters where characters.id = character_inventory_items.character_id and characters.owner_id = (select auth.uid())));
create policy character_inventory_items_delete_owner on public.character_inventory_items for delete to authenticated
using (exists (select 1 from public.characters where characters.id = character_inventory_items.character_id and characters.owner_id = (select auth.uid())));

create policy availability_rules_select_members on public.availability_rules for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy availability_rules_insert_own on public.availability_rules for insert to authenticated with check (user_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy availability_rules_update_own on public.availability_rules for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy availability_rules_delete_own on public.availability_rules for delete to authenticated using (user_id = (select auth.uid()));

create policy availability_exceptions_select_members on public.availability_exceptions for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy availability_exceptions_insert_own on public.availability_exceptions for insert to authenticated with check (user_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy availability_exceptions_update_own on public.availability_exceptions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy availability_exceptions_delete_own on public.availability_exceptions for delete to authenticated using (user_id = (select auth.uid()));

create policy sessions_select_members on public.sessions for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy sessions_insert_managers on public.sessions for insert to authenticated with check (created_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy sessions_update_managers on public.sessions for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy sessions_delete_managers on public.sessions for delete to authenticated using ((select private.is_campaign_manager(campaign_id)));

create policy attendance_select_session_members on public.session_attendance for select to authenticated using (exists (select 1 from public.sessions where id = session_id and (select private.is_campaign_member(campaign_id))));
create policy attendance_insert_own on public.session_attendance for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.sessions where id = session_id and (select private.is_campaign_member(campaign_id))));
create policy attendance_update_own on public.session_attendance for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy attendance_delete_own_or_manager on public.session_attendance for delete to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.sessions where id = session_id and (select private.is_campaign_manager(campaign_id))));

create policy session_encounters_select_members on public.session_encounters for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy session_encounters_insert_managers on public.session_encounters for insert to authenticated with check ((select private.is_campaign_manager(campaign_id)) and exists (select 1 from public.sessions where id = session_id and sessions.campaign_id = session_encounters.campaign_id));
create policy session_encounters_update_managers on public.session_encounters for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy session_encounters_delete_managers on public.session_encounters for delete to authenticated using ((select private.is_campaign_manager(campaign_id)));

create policy character_condition_instances_select_members on public.character_condition_instances for select to authenticated
using ((select private.is_campaign_member(campaign_id)));

create policy initiative_entries_select_members on public.session_initiative_entries for select to authenticated
using ((select private.is_campaign_member(campaign_id)) and (not is_hidden or (select private.is_campaign_manager(campaign_id))));
create policy initiative_entries_insert_allowed on public.session_initiative_entries for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (select 1 from public.sessions where id = session_id and sessions.campaign_id = session_initiative_entries.campaign_id)
  and (
    (
      character_id is not null and combatant_kind = 'character' and combatant_name = '' and not is_hidden
      and armor_class is null and max_hp is null and current_hp is null and temporary_hp is null
      and exists (
        select 1 from public.characters
        where id = character_id and characters.campaign_id = session_initiative_entries.campaign_id
          and (characters.owner_id = (select auth.uid()) or (select private.is_campaign_manager(session_initiative_entries.campaign_id)))
      )
    )
    or (
      character_id is null and combatant_kind <> 'character'
      and (select private.is_campaign_manager(session_initiative_entries.campaign_id))
    )
  )
);
create policy initiative_entries_update_allowed on public.session_initiative_entries for update to authenticated
using ((select private.is_campaign_manager(campaign_id)) or exists (select 1 from public.characters where id = character_id and owner_id = (select auth.uid())))
with check (
  (select private.is_campaign_manager(campaign_id))
  or (
    character_id is not null and combatant_kind = 'character' and combatant_name = '' and not is_hidden
    and armor_class is null and max_hp is null and current_hp is null and temporary_hp is null
    and exists (select 1 from public.characters where id = character_id and owner_id = (select auth.uid()))
  )
);
create policy initiative_entries_delete_allowed on public.session_initiative_entries for delete to authenticated using ((select private.is_campaign_manager(campaign_id)) or exists (select 1 from public.characters where id = character_id and owner_id = (select auth.uid())));

create policy action_proposals_select_members on public.session_action_proposals for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy action_proposals_insert_own on public.session_action_proposals for insert to authenticated with check (created_by = (select auth.uid()) and reviewed_by is null and reviewed_at is null and ((approval_mode = 'soft' and status = 'approved') or (approval_mode = 'hard' and status = 'pending')) and exists (select 1 from public.sessions where id = session_id and sessions.campaign_id = session_action_proposals.campaign_id and sessions.status in ('active', 'paused')) and (character_id is null or exists (select 1 from public.characters where id = character_id and characters.campaign_id = session_action_proposals.campaign_id and characters.owner_id = (select auth.uid()))));
create policy action_proposals_update_managers on public.session_action_proposals for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy reaction_prompts_select_allowed on public.session_reaction_prompts for select to authenticated using (target_user_id = (select auth.uid()) or (select private.is_campaign_manager(campaign_id)));
create policy reaction_prompts_insert_managers on public.session_reaction_prompts for insert to authenticated with check (created_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)) and status = 'pending' and responded_at is null and exists (select 1 from public.sessions where id = session_id and sessions.campaign_id = session_reaction_prompts.campaign_id and sessions.status = 'active') and exists (select 1 from public.characters where id = character_id and characters.campaign_id = session_reaction_prompts.campaign_id and characters.owner_id = target_user_id));

create policy session_events_select_allowed on public.session_events for select to authenticated
using ((select private.is_campaign_member(campaign_id)) and (visibility = 'party' or (select private.is_campaign_manager(campaign_id))));
create policy session_events_insert_allowed on public.session_events for insert to authenticated
with check (
  actor_id = (select auth.uid())
  and exists (select 1 from public.sessions where sessions.id = session_events.session_id and sessions.campaign_id = session_events.campaign_id)
  and (select private.is_campaign_member(campaign_id))
  and (visibility = 'party' or (select private.is_campaign_manager(campaign_id)))
  and (
    character_id is null
    or exists (
      select 1 from public.characters
      where characters.id = session_events.character_id
        and characters.campaign_id = session_events.campaign_id
        and (characters.owner_id = (select auth.uid()) or (select private.is_campaign_manager(session_events.campaign_id)))
    )
  )
);

create policy announcements_select_members on public.campaign_announcements for select to authenticated using ((select private.is_campaign_member(campaign_id)));
create policy announcements_insert_managers on public.campaign_announcements for insert to authenticated with check (author_id = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy announcements_update_managers on public.campaign_announcements for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy announcements_delete_managers on public.campaign_announcements for delete to authenticated using ((select private.is_campaign_manager(campaign_id)));

create policy notifications_select_own on public.notifications for select to authenticated using (recipient_id = (select auth.uid()));
create policy notifications_update_own on public.notifications for update to authenticated using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy notifications_delete_own on public.notifications for delete to authenticated using (recipient_id = (select auth.uid()));

create policy invitations_select_manager_or_recipient on public.campaign_invitations for select to authenticated using ((select private.is_campaign_manager(campaign_id)) or invited_email = lower(coalesce((select auth.jwt()) ->> 'email', '')));
create policy invitations_insert_managers on public.campaign_invitations for insert to authenticated with check (invited_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy invitations_update_managers on public.campaign_invitations for update to authenticated using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy invitations_delete_managers on public.campaign_invitations for delete to authenticated using ((select private.is_campaign_manager(campaign_id)));

create policy campaign_documents_select_allowed on public.campaign_documents for select to authenticated
using ((select private.is_campaign_member(campaign_id)) and (visibility = 'shared' or (select private.is_campaign_manager(campaign_id))));
create policy campaign_documents_insert_allowed on public.campaign_documents for insert to authenticated
with check (author_id = (select auth.uid()) and (select private.is_campaign_member(campaign_id)) and (visibility = 'shared' or (select private.is_campaign_manager(campaign_id))) and (not is_pinned or (select private.is_campaign_manager(campaign_id))));
create policy campaign_documents_update_author_or_manager on public.campaign_documents for update to authenticated
using (author_id = (select auth.uid()) or (select private.is_campaign_manager(campaign_id)))
with check ((select private.is_campaign_member(campaign_id)) and (author_id = (select auth.uid()) or (select private.is_campaign_manager(campaign_id))) and (visibility = 'shared' or (select private.is_campaign_manager(campaign_id))) and (not is_pinned or (select private.is_campaign_manager(campaign_id))));
create policy campaign_documents_delete_author_or_manager on public.campaign_documents for delete to authenticated
using (author_id = (select auth.uid()) or (select private.is_campaign_manager(campaign_id)));

create policy campaign_world_states_select_members on public.campaign_world_states for select to authenticated
using ((select private.is_campaign_member(campaign_id)));
create policy campaign_world_states_insert_managers on public.campaign_world_states for insert to authenticated
with check (updated_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy campaign_world_states_update_managers on public.campaign_world_states for update to authenticated
using ((select private.is_campaign_manager(campaign_id)))
with check (updated_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy campaign_world_states_delete_managers on public.campaign_world_states for delete to authenticated
using ((select private.is_campaign_manager(campaign_id)));

create policy campaign_gm_states_select_managers on public.campaign_gm_states for select to authenticated
using ((select private.is_campaign_manager(campaign_id)));
create policy campaign_gm_states_insert_managers on public.campaign_gm_states for insert to authenticated
with check (updated_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy campaign_gm_states_update_managers on public.campaign_gm_states for update to authenticated
using ((select private.is_campaign_manager(campaign_id)))
with check (updated_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy campaign_gm_states_delete_managers on public.campaign_gm_states for delete to authenticated
using ((select private.is_campaign_manager(campaign_id)));

create policy campaign_objectives_select_allowed on public.campaign_objectives for select to authenticated
using ((select private.is_campaign_member(campaign_id)) and (not is_secret or (select private.is_campaign_manager(campaign_id))));
create policy campaign_objectives_insert_managers on public.campaign_objectives for insert to authenticated
with check (created_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy campaign_objectives_update_managers on public.campaign_objectives for update to authenticated
using ((select private.is_campaign_manager(campaign_id)))
with check ((select private.is_campaign_manager(campaign_id)));
create policy campaign_objectives_delete_managers on public.campaign_objectives for delete to authenticated
using ((select private.is_campaign_manager(campaign_id)));

create policy campaign_inventory_items_select_members on public.campaign_inventory_items for select to authenticated
using ((select private.is_campaign_member(campaign_id)));
create policy campaign_inventory_items_insert_members on public.campaign_inventory_items for insert to authenticated
with check (created_by = (select auth.uid()) and (select private.is_campaign_member(campaign_id)));
create policy campaign_inventory_items_update_members on public.campaign_inventory_items for update to authenticated
using ((select private.is_campaign_member(campaign_id)))
with check ((select private.is_campaign_member(campaign_id)));
create policy campaign_inventory_items_delete_members on public.campaign_inventory_items for delete to authenticated
using ((select private.is_campaign_member(campaign_id)));

create policy campaign_tasks_select_allowed on public.campaign_tasks for select to authenticated
using ((select private.is_campaign_member(campaign_id)) and (not is_gm_only or (select private.is_campaign_manager(campaign_id))));
create policy campaign_tasks_insert_allowed on public.campaign_tasks for insert to authenticated
with check (created_by = (select auth.uid()) and (select private.is_campaign_member(campaign_id)) and (not is_gm_only or (select private.is_campaign_manager(campaign_id))));
create policy campaign_tasks_update_allowed on public.campaign_tasks for update to authenticated
using (created_by = (select auth.uid()) or assigned_to = (select auth.uid()) or (select private.is_campaign_manager(campaign_id)))
with check ((select private.is_campaign_member(campaign_id)) and (not is_gm_only or (select private.is_campaign_manager(campaign_id))));
create policy campaign_tasks_delete_author_or_manager on public.campaign_tasks for delete to authenticated
using (created_by = (select auth.uid()) or (select private.is_campaign_manager(campaign_id)));

create policy campaign_references_select_allowed on public.campaign_references for select to authenticated
using ((select private.is_campaign_member(campaign_id)) and (not is_secret or (select private.is_campaign_manager(campaign_id))));
create policy campaign_references_insert_managers on public.campaign_references for insert to authenticated
with check (created_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy campaign_references_update_managers on public.campaign_references for update to authenticated
using ((select private.is_campaign_manager(campaign_id))) with check ((select private.is_campaign_manager(campaign_id)));
create policy campaign_references_delete_managers on public.campaign_references for delete to authenticated
using ((select private.is_campaign_manager(campaign_id)));

create policy campaign_maps_select_allowed on public.campaign_maps for select to authenticated
using ((select private.is_campaign_member(campaign_id)) and (visibility = 'shared' or (select private.is_campaign_manager(campaign_id))));
create policy campaign_maps_insert_managers on public.campaign_maps for insert to authenticated
with check (uploaded_by = (select auth.uid()) and (select private.is_campaign_manager(campaign_id)));
create policy campaign_maps_update_managers on public.campaign_maps for update to authenticated
using ((select private.is_campaign_manager(campaign_id)))
with check ((select private.is_campaign_manager(campaign_id)));
create policy campaign_maps_delete_managers on public.campaign_maps for delete to authenticated
using ((select private.is_campaign_manager(campaign_id)));

create policy campaign_map_objects_insert_managers on storage.objects for insert to authenticated
with check (
  bucket_id = 'campaign-maps'
  and case
    when (storage.foldername(name))[1] ~ '^[0-9]+$'
      then (select private.is_campaign_manager(((storage.foldername(name))[1])::bigint))
    else false
  end
);
create policy campaign_map_objects_select_allowed on storage.objects for select to authenticated
using (
  bucket_id = 'campaign-maps'
  and exists (
    select 1 from public.campaign_maps
    where campaign_maps.storage_path = storage.objects.name
      and (select private.is_campaign_member(campaign_maps.campaign_id))
      and (campaign_maps.visibility = 'shared' or (select private.is_campaign_manager(campaign_maps.campaign_id)))
  )
);
create policy campaign_map_objects_delete_managers on storage.objects for delete to authenticated
using (
  bucket_id = 'campaign-maps'
  and case
    when (storage.foldername(name))[1] ~ '^[0-9]+$'
      then (select private.is_campaign_manager(((storage.foldername(name))[1])::bigint))
    else false
  end
);

grant usage on schema public to authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.campaigns from anon, authenticated;
revoke all on table public.campaign_members from anon, authenticated;
revoke all on table public.characters from anon, authenticated;
revoke all on table public.character_condition_instances from anon, authenticated;
revoke all on table public.availability_rules, public.availability_exceptions, public.sessions, public.session_attendance from anon, authenticated;
revoke all on table public.session_events from anon, authenticated;
revoke all on table public.campaign_announcements from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;
revoke all on table public.campaign_invitations from anon, authenticated;
revoke all on table public.campaign_documents from anon, authenticated;
revoke all on table public.campaign_world_states, public.campaign_gm_states, public.campaign_objectives from anon, authenticated;
revoke all on table public.campaign_inventory_items, public.campaign_tasks from anon, authenticated;
revoke all on table public.campaign_references from anon, authenticated;
revoke all on table public.campaign_maps from anon, authenticated;
revoke all on table public.character_spellcasting_profiles, public.character_spells, public.character_spell_slots from anon, authenticated;
revoke all on table public.character_memories from anon, authenticated;
revoke all on table public.character_inventory_items from anon, authenticated;
revoke all on sequence public.campaigns_id_seq from anon, authenticated;
revoke all on sequence public.characters_id_seq from anon, authenticated;
revoke all on sequence public.character_condition_instances_id_seq from anon, authenticated;
revoke all on sequence public.character_features_id_seq from anon, authenticated;
revoke all on sequence public.character_spellcasting_profiles_id_seq, public.character_spells_id_seq from anon, authenticated;
revoke all on sequence public.character_memories_id_seq from anon, authenticated;
revoke all on sequence public.character_inventory_items_id_seq from anon, authenticated;
revoke all on sequence public.availability_rules_id_seq, public.availability_exceptions_id_seq, public.sessions_id_seq from anon, authenticated;
revoke all on sequence public.session_events_id_seq from anon, authenticated;
revoke all on sequence public.campaign_announcements_id_seq from anon, authenticated;
revoke all on sequence public.notifications_id_seq from anon, authenticated;
revoke all on sequence public.campaign_invitations_id_seq from anon, authenticated;
revoke all on sequence public.campaign_documents_id_seq from anon, authenticated;
revoke all on sequence public.campaign_objectives_id_seq from anon, authenticated;
revoke all on sequence public.campaign_inventory_items_id_seq, public.campaign_tasks_id_seq from anon, authenticated;
revoke all on sequence public.campaign_references_id_seq from anon, authenticated;
revoke all on sequence public.campaign_maps_id_seq from anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.campaigns to authenticated;
grant select, insert, update, delete on table public.campaign_members to authenticated;
grant select, insert, update, delete on table public.characters to authenticated;
grant select on table public.character_condition_instances to authenticated;
grant select, insert, update, delete on table public.character_features to authenticated;
grant select, insert, update, delete on table public.character_spellcasting_profiles, public.character_spells, public.character_spell_slots to authenticated;
grant select, insert, update, delete on table public.character_memories to authenticated;
grant select, insert, update, delete on table public.character_inventory_items to authenticated;
grant select, insert, update, delete on table public.availability_rules, public.availability_exceptions, public.sessions, public.session_attendance to authenticated;
grant select, insert, update, delete on table public.session_encounters, public.session_initiative_entries to authenticated;
grant select, insert, update on table public.session_action_proposals to authenticated;
grant select, insert on table public.session_reaction_prompts to authenticated;
grant select, insert on table public.session_events to authenticated;
grant select, insert, update, delete on table public.campaign_announcements to authenticated;
grant select, update, delete on table public.notifications to authenticated;
grant select, insert, update, delete on table public.campaign_invitations to authenticated;
grant select, insert, update, delete on table public.campaign_documents to authenticated;
grant select, insert, update, delete on table public.campaign_world_states, public.campaign_gm_states, public.campaign_objectives to authenticated;
grant select, insert, update, delete on table public.campaign_inventory_items, public.campaign_tasks to authenticated;
grant select, insert, update, delete on table public.campaign_references to authenticated;
grant select, insert, update, delete on table public.campaign_maps to authenticated;
grant usage, select on sequence public.campaign_invitations_id_seq to authenticated;
grant usage, select on sequence public.campaign_documents_id_seq to authenticated;
grant usage, select on sequence public.campaign_objectives_id_seq to authenticated;
grant usage, select on sequence public.campaign_inventory_items_id_seq, public.campaign_tasks_id_seq to authenticated;
grant usage, select on sequence public.campaign_references_id_seq to authenticated;
grant usage, select on sequence public.campaign_maps_id_seq to authenticated;
grant usage, select on sequence public.campaigns_id_seq to authenticated;
grant usage, select on sequence public.characters_id_seq to authenticated;
grant usage, select on sequence public.character_features_id_seq to authenticated;
grant usage, select on sequence public.character_spellcasting_profiles_id_seq, public.character_spells_id_seq to authenticated;
grant usage, select on sequence public.character_memories_id_seq to authenticated;
grant usage, select on sequence public.character_inventory_items_id_seq to authenticated;
grant usage, select on sequence public.availability_rules_id_seq, public.availability_exceptions_id_seq, public.sessions_id_seq to authenticated;
grant usage, select on sequence public.session_events_id_seq to authenticated;
grant usage, select on sequence public.session_initiative_entries_id_seq to authenticated;
grant usage, select on sequence public.session_action_proposals_id_seq to authenticated;
grant usage, select on sequence public.session_reaction_prompts_id_seq to authenticated;
grant usage, select on sequence public.campaign_announcements_id_seq to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'session_events'
    ) then
    execute 'alter publication supabase_realtime add table public.session_events';
  end if;
end;
$$;
