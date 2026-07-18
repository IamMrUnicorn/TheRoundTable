import { supabase } from '../../lib/supabase'
import type { TablesInsert, TablesUpdate } from '../../types/database'

export async function listSpellcastingProfiles(characterId: number) {
  const { data, error } = await supabase
    .from('character_spellcasting_profiles')
    .select('*, character_spells(*), character_spell_slots(*)')
    .eq('character_id', characterId)
    .order('name')
  if (error) throw error
  return data
}

export async function createSpellcastingProfile(
  input: TablesInsert<'character_spellcasting_profiles'>,
) {
  const { data, error } = await supabase
    .from('character_spellcasting_profiles')
    .insert(input)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function createCharacterSpell(
  input: TablesInsert<'character_spells'>,
) {
  const { data, error } = await supabase
    .from('character_spells')
    .insert(input)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCharacterSpell(
  id: number,
  updates: TablesUpdate<'character_spells'>,
) {
  const { error } = await supabase
    .from('character_spells')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteCharacterSpell(id: number) {
  const { error } = await supabase
    .from('character_spells')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function saveSpellSlot(
  input: TablesInsert<'character_spell_slots'>,
) {
  const { error } = await supabase
    .from('character_spell_slots')
    .upsert(input, { onConflict: 'profile_id,spell_level' })
  if (error) throw error
}
