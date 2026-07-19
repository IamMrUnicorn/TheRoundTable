import { supabase } from '../../lib/supabase'

export async function applyCharacterHealthChange(input: {
  amount: number
  changeKind: 'damage' | 'healing' | 'temporary_hp'
  characterId: number
  sessionId: number
}) {
  const { data, error } = await supabase.rpc('apply_character_health_change', {
    amount: input.amount,
    change_kind: input.changeKind,
    character_id: input.characterId,
    session_id: input.sessionId,
  })
  if (error) throw error
  return data
}
