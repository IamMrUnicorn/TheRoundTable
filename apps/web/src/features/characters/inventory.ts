import { supabase } from '../../lib/supabase'
import type { TablesInsert, TablesUpdate } from '../../types/database'

export async function listCharacterInventory(characterId: number) {
  const { data, error } = await supabase
    .from('character_inventory_items')
    .select('*')
    .eq('character_id', characterId)
    .order('category')
    .order('name')
  if (error) throw error
  return data
}

export async function listEquippedWeapons(characterIds: number[]) {
  if (characterIds.length === 0) return []
  const { data, error } = await supabase
    .from('character_inventory_items')
    .select('*')
    .in('character_id', characterIds)
    .eq('is_weapon', true)
    .eq('is_equipped', true)
    .gt('quantity', 0)
    .order('name')
  if (error) throw error
  return data
}

export async function createCharacterInventoryItem(
  input: TablesInsert<'character_inventory_items'>,
) {
  const { error } = await supabase
    .from('character_inventory_items')
    .insert(input)
  if (error) throw error
}

export async function updateCharacterInventoryItem(
  id: number,
  updates: TablesUpdate<'character_inventory_items'>,
) {
  const { error } = await supabase
    .from('character_inventory_items')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteCharacterInventoryItem(id: number) {
  const { error } = await supabase
    .from('character_inventory_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}
