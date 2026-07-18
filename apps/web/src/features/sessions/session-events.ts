import { supabase } from '../../lib/supabase'
import type { TablesInsert } from '../../types/database'

export async function listSessionEvents(sessionId: number) {
  const { data, error } = await supabase
    .from('session_events')
    .select(
      '*, actor:profiles!session_events_actor_id_fkey(display_name), character:characters(name)',
    )
    .eq('session_id', sessionId)
    .order('occurred_at', { ascending: false })
    .order('sequence_number', { ascending: false })
    .limit(200)
  if (error) throw error
  return data
}

export async function createSessionEvent(
  input: TablesInsert<'session_events'>,
) {
  const { error } = await supabase.from('session_events').insert(input)
  if (error) throw error
}
