import { supabase } from '../../lib/supabase'

export type StatusOperation =
  | 'concentration_start'
  | 'concentration_end'
  | 'concentration_check_pass'
  | 'concentration_check_fail'
  | 'death_success'
  | 'death_failure'
  | 'death_reset'
  | 'stabilize'
  | 'mark_dead'
  | 'revive'

export async function listCharacterConditions(sessionId: number) {
  const { data, error } = await supabase
    .from('character_condition_instances')
    .select('*')
    .eq('session_id', sessionId)
    .order('character_id')
    .order('condition')
  if (error) throw error
  return data
}

export async function applyCharacterCondition(input: {
  characterId: number
  condition: string
  durationRounds: number | null
  operation: 'add' | 'remove'
  sessionId: number
  source: string
}) {
  const { data, error } = await supabase.rpc('apply_character_condition', {
    character_id: input.characterId,
    condition: input.condition,
    duration_rounds: input.durationRounds,
    operation: input.operation,
    session_id: input.sessionId,
    source: input.source,
  })
  if (error) throw error
  return data
}

export async function applyCharacterStatusChange(input: {
  characterId: number
  operation: StatusOperation
  sessionId: number
  value?: string
}) {
  const { data, error } = await supabase.rpc('apply_character_status_change', {
    character_id: input.characterId,
    operation: input.operation,
    session_id: input.sessionId,
    value: input.value ?? '',
  })
  if (error) throw error
  return data
}
