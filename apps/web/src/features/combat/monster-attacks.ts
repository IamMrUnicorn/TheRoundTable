import { supabase } from '../../lib/supabase'

export type MonsterAttackResolution = {
  attack_total: number
  concentration_check_dc: number | null
  critical: boolean
  damage: number
  damage_type: string
  hit: boolean
  natural_roll: number
  target_hp: number
  target_max_hp: number
  target_name: string
}

export async function resolveMonsterAttack(input: {
  actionName: string
  attackerEntryId: number
  rollMode: 'advantage' | 'disadvantage' | 'normal'
  sessionId: number
  targetCharacterId: number
}) {
  const { data, error } = await supabase.rpc('resolve_monster_attack', {
    attack_name: input.actionName,
    attacker_entry_id: input.attackerEntryId,
    roll_mode: input.rollMode,
    session_id: input.sessionId,
    target_character_id: input.targetCharacterId,
  })
  if (error) throw error
  return data as MonsterAttackResolution
}
