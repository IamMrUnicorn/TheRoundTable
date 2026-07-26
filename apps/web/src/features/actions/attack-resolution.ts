import { supabase } from '../../lib/supabase'

export type AttackResolution = {
  critical: boolean
  damage: number
  defeated: boolean
  hit: boolean
  target_hp: number
  target_max_hp: number
  target_name: string
}

export async function resolveSessionAttack(input: {
  attackName: string
  attackTotal: number
  attackerCharacterId: number
  damage: number
  naturalRoll: number
  sessionId: number
  targetEntryId: number
}) {
  const { data, error } = await supabase.rpc('resolve_session_attack', {
    attack_name: input.attackName,
    attack_total: input.attackTotal,
    attacker_character_id: input.attackerCharacterId,
    damage: input.damage,
    natural_roll: input.naturalRoll,
    session_id: input.sessionId,
    target_entry_id: input.targetEntryId,
  })
  if (error) throw error
  return data as AttackResolution
}
