import { supabase } from '../../lib/supabase'
import type { Json } from '../../types/database'
import { createSessionEvent } from '../sessions/session-events'

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

export async function startEncounter(input: {
  actorId: string
  campaignId: number
  name: string
  sessionId: number
}) {
  const { error: encounterError } = await supabase
    .from('session_encounters')
    .upsert({
      active_character_id: null,
      active_entry_id: null,
      campaign_id: input.campaignId,
      ended_at: null,
      name: input.name.trim(),
      round_number: 1,
      session_id: input.sessionId,
      started_at: new Date().toISOString(),
      status: 'active',
    })
  if (encounterError) throw encounterError

  await createSessionEvent({
    actor_id: input.actorId,
    campaign_id: input.campaignId,
    kind: 'action',
    metadata: { encounter_name: input.name.trim(), lifecycle: 'started' },
    session_id: input.sessionId,
    title: `Encounter started: ${input.name.trim()}`,
    visibility: 'party',
  })
}

export async function endEncounter(input: {
  actorId: string
  campaignId: number
  name: string
  roundNumber: number
  sessionId: number
}) {
  const { error } = await supabase
    .from('session_encounters')
    .update({
      active_character_id: null,
      active_entry_id: null,
      ended_at: new Date().toISOString(),
      status: 'ended',
    })
    .eq('session_id', input.sessionId)
  if (error) throw error
  await createSessionEvent({
    actor_id: input.actorId,
    campaign_id: input.campaignId,
    kind: 'action',
    metadata: {
      encounter_name: input.name,
      lifecycle: 'ended',
      rounds_completed: input.roundNumber,
    },
    round_number: input.roundNumber,
    session_id: input.sessionId,
    title: `Encounter ended: ${input.name}`,
    visibility: 'party',
  })
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
      combatant_kind: 'character',
      combatant_name: '',
      created_by: input.userId,
      initiative: input.initiative,
      is_hidden: false,
      session_id: input.sessionId,
    },
    { onConflict: 'session_id,character_id' },
  )
  if (error) throw error
}

export async function addCustomCombatant(input: {
  actorId: string
  armorClass: number
  campaignId: number
  hitPoints: number
  initiative: number
  isHidden: boolean
  kind: 'custom' | 'monster' | 'npc'
  name: string
  sessionId: number
  sourceReference?: string
  statBlock?: Json
}) {
  const { error } = await supabase.from('session_initiative_entries').insert({
    armor_class: input.armorClass,
    campaign_id: input.campaignId,
    character_id: null,
    combatant_kind: input.kind,
    combatant_name: input.name.trim(),
    created_by: input.actorId,
    current_hp: input.hitPoints,
    initiative: input.initiative,
    is_hidden: input.isHidden,
    max_hp: input.hitPoints,
    session_id: input.sessionId,
    source_reference: input.sourceReference ?? '',
    stat_block: input.statBlock ?? {},
    temporary_hp: 0,
  })
  if (error) throw error
}

export async function setEncounterTurn(input: {
  activeCharacterId: number | null
  activeEntryId: number
  campaignId: number
  roundNumber: number
  sessionId: number
}) {
  const { error: resetError } = await supabase
    .from('session_initiative_entries')
    .update({
      action_used: false,
      bonus_action_used: false,
      movement_used: 0,
      object_interaction_used: false,
      reaction_used: false,
    })
    .eq('id', input.activeEntryId)
    .eq('session_id', input.sessionId)
  if (resetError) throw resetError

  const { error } = await supabase
    .from('session_encounters')
    .update({
      active_character_id: input.activeCharacterId,
      active_entry_id: input.activeEntryId,
      campaign_id: input.campaignId,
      round_number: input.roundNumber,
    })
    .eq('session_id', input.sessionId)
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

export async function updateCustomCombatant(
  entryId: number,
  updates: {
    current_hp?: number
    initiative?: number
    is_hidden?: boolean
    temporary_hp?: number
  },
) {
  const { error } = await supabase
    .from('session_initiative_entries')
    .update(updates)
    .eq('id', entryId)
  if (error) throw error
}

export async function removeInitiativeEntry(entryId: number) {
  const { error } = await supabase
    .from('session_initiative_entries')
    .delete()
    .eq('id', entryId)
  if (error) throw error
}
