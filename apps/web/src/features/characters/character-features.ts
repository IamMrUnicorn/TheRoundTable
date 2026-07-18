import { supabase } from '../../lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../../types/database'

export type CharacterFeature = Tables<'character_features'>

export async function listCharacterFeatures(characterId: number) {
  const { data, error } = await supabase
    .from('character_features')
    .select('*')
    .eq('character_id', characterId)
    .order('sort_order')
    .order('name')
  if (error) throw error
  return data
}

export async function createCharacterFeature(
  input: TablesInsert<'character_features'>,
) {
  const { data, error } = await supabase
    .from('character_features')
    .insert(input)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCharacterFeature(
  featureId: number,
  updates: TablesUpdate<'character_features'>,
) {
  const { data, error } = await supabase
    .from('character_features')
    .update(updates)
    .eq('id', featureId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteCharacterFeature(featureId: number) {
  const { error } = await supabase
    .from('character_features')
    .delete()
    .eq('id', featureId)
  if (error) throw error
}
