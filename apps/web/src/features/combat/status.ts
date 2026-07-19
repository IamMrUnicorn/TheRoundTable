import { supabase } from '../../lib/supabase'

export type StatusOperation =
  | 'condition_add'
  | 'condition_remove'
  | 'concentration_start'
  | 'concentration_end'
  | 'death_success'
  | 'death_failure'
  | 'death_reset'

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
