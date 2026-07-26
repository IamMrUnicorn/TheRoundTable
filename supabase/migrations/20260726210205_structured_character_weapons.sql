alter table public.character_inventory_items
  add column is_weapon boolean not null default false,
  add column attack_ability text not null default 'strength',
  add column is_proficient boolean not null default true,
  add column attack_bonus_override smallint,
  add column damage_formula text not null default '',
  add column damage_bonus_override smallint,
  add column damage_type text not null default '',
  add column weapon_range text not null default '',
  add constraint character_inventory_items_attack_ability_check
    check (attack_ability in ('strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma')),
  add constraint character_inventory_items_attack_bonus_override_check
    check (attack_bonus_override is null or attack_bonus_override between -100 and 100),
  add constraint character_inventory_items_damage_formula_check
    check (char_length(damage_formula) <= 120),
  add constraint character_inventory_items_damage_bonus_override_check
    check (damage_bonus_override is null or damage_bonus_override between -100 and 100),
  add constraint character_inventory_items_damage_type_check
    check (char_length(damage_type) <= 80),
  add constraint character_inventory_items_weapon_range_check
    check (char_length(weapon_range) <= 80),
  add constraint character_inventory_items_weapon_requires_damage_check
    check (not is_weapon or char_length(damage_formula) between 2 and 120);
