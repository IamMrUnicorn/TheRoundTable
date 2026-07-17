import { supabase } from '../../lib/supabase'

export async function getOwnProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateOwnProfile(
  userId: string,
  displayName: string,
  timezone: string,
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name: displayName.trim(), timezone })
    .eq('id', userId)
    .select('*')
    .single()
  if (error) throw error
  return data
}
