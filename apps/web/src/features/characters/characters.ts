import { supabase } from '../../lib/supabase'
import type { Tables, TablesUpdate } from '../../types/database'

export type Character = Tables<'characters'>

export async function listOwnedCharacters(ownerId: string) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listCampaignCharacters(campaignId: number) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('name')
  if (error) throw error
  return data
}

export async function getCharacter(characterId: number) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single()
  if (error) throw error
  return data
}

export async function createCharacter(input: {
  ancestry: string
  appearance?: string
  campaignId: number | null
  className: string
  level?: number
  name: string
  ownerId: string
}) {
  const { data, error } = await supabase
    .from('characters')
    .insert({
      ancestry: input.ancestry.trim(),
      appearance: input.appearance?.trim() ?? '',
      campaign_id: input.campaignId,
      class_name: input.className.trim(),
      level: input.level ?? 1,
      name: input.name.trim(),
      owner_id: input.ownerId,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCharacter(
  characterId: number,
  updates: TablesUpdate<'characters'>,
) {
  const { data, error } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', characterId)
    .select('*')
    .single()
  if (error) throw error
  return data
}
