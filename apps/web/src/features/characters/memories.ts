import { supabase } from '../../lib/supabase'
import type { TablesInsert, TablesUpdate } from '../../types/database'

export async function listCharacterMemories(characterId: number) {
  const { data, error } = await supabase
    .from('character_memories')
    .select('*')
    .eq('character_id', characterId)
    .order('is_pinned', { ascending: false })
    .order('occurred_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createCharacterMemory(
  input: TablesInsert<'character_memories'>,
) {
  const { error } = await supabase.from('character_memories').insert(input)
  if (error) throw error
}

export async function updateCharacterMemory(
  id: number,
  updates: TablesUpdate<'character_memories'>,
) {
  const { error } = await supabase
    .from('character_memories')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteCharacterMemory(id: number) {
  const { error } = await supabase
    .from('character_memories')
    .delete()
    .eq('id', id)
  if (error) throw error
}
