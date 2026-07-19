import { supabase } from '../../lib/supabase'
export async function listReactionPrompts(sessionId: number) {
  const { data, error } = await supabase
    .from('session_reaction_prompts')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}
export async function createReactionPrompt(input: {
  campaignId: number
  characterId: number
  createdBy: string
  durationSeconds: number
  prompt: string
  sessionId: number
  targetUserId: string
}) {
  const { error } = await supabase.from('session_reaction_prompts').insert({
    campaign_id: input.campaignId,
    character_id: input.characterId,
    created_by: input.createdBy,
    expires_at: new Date(
      Date.now() + input.durationSeconds * 1000,
    ).toISOString(),
    prompt: input.prompt.trim(),
    session_id: input.sessionId,
    target_user_id: input.targetUserId,
  })
  if (error) throw error
}
export async function respondReactionPrompt(promptId: number, accept: boolean) {
  const { error } = await supabase.rpc('respond_reaction_prompt', {
    prompt_id: promptId,
    should_accept: accept,
  })
  if (error) throw error
}
