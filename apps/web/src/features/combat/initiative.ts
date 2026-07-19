import { supabase } from '../../lib/supabase'

export async function getSessionInitiative(sessionId: number) {
  const [encounter, entries] = await Promise.all([
    supabase
      .from('session_encounters')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle(),
    supabase
      .from('session_initiative_entries')
      .select('*')
      .eq('session_id', sessionId)
      .order('initiative', { ascending: false })
      .order('id'),
  ])
  if (encounter.error) throw encounter.error
  if (entries.error) throw entries.error
  return { encounter: encounter.data, entries: entries.data }
}

export async function setCharacterInitiative(input: {
  campaignId: number
  characterId: number
  initiative: number
  sessionId: number
  userId: string
}) {
  const { error } = await supabase.from('session_initiative_entries').upsert(
    {
      campaign_id: input.campaignId,
      character_id: input.characterId,
      created_by: input.userId,
      initiative: input.initiative,
      session_id: input.sessionId,
    },
    { onConflict: 'session_id,character_id' },
  )
  if (error) throw error
}

export async function setEncounterTurn(input: {
  activeCharacterId: number | null
  campaignId: number
  roundNumber: number
  sessionId: number
}) {
  if (input.activeCharacterId !== null) {
    const { error: resetError } = await supabase
      .from('session_initiative_entries')
      .update({
        action_used: false,
        bonus_action_used: false,
        movement_used: 0,
        object_interaction_used: false,
        reaction_used: false,
      })
      .eq('session_id', input.sessionId)
      .eq('character_id', input.activeCharacterId)
    if (resetError) throw resetError
  }
  const { error } = await supabase.from('session_encounters').upsert({
    active_character_id: input.activeCharacterId,
    campaign_id: input.campaignId,
    round_number: input.roundNumber,
    session_id: input.sessionId,
  })
  if (error) throw error
}

export async function updateTurnResources(
  entryId: number,
  updates: {
    action_used?: boolean
    bonus_action_used?: boolean
    movement_used?: number
    object_interaction_used?: boolean
    reaction_used?: boolean
  },
) {
  const { error } = await supabase
    .from('session_initiative_entries')
    .update(updates)
    .eq('id', entryId)
  if (error) throw error
}

export async function clearInitiative(sessionId: number) {
  const { error } = await supabase
    .from('session_initiative_entries')
    .delete()
    .eq('session_id', sessionId)
  if (error) throw error
  const { error: encounterError } = await supabase
    .from('session_encounters')
    .delete()
    .eq('session_id', sessionId)
  if (encounterError) throw encounterError
}
