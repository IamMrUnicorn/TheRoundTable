import { supabase } from '../../lib/supabase'

export async function listActionProposals(sessionId: number) {
  const { data, error } = await supabase
    .from('session_action_proposals')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}

export async function createActionProposal(input: {
  approvalMode: 'soft' | 'hard'
  campaignId: number
  characterId: number | null
  details: string
  kind: string
  sessionId: number
  title: string
  userId: string
}) {
  const { error } = await supabase.from('session_action_proposals').insert({
    approval_mode: input.approvalMode,
    campaign_id: input.campaignId,
    character_id: input.characterId,
    created_by: input.userId,
    details: input.details.trim(),
    kind: input.kind,
    session_id: input.sessionId,
    status: input.approvalMode === 'soft' ? 'approved' : 'pending',
    title: input.title.trim(),
  })
  if (error) throw error
}

export async function reviewActionProposal(input: {
  proposalId: number
  reviewerId: string
  reviewerNote: string
  status: 'approved' | 'denied' | 'clarification'
}) {
  const { error } = await supabase
    .from('session_action_proposals')
    .update({
      reviewed_at: new Date().toISOString(),
      reviewed_by: input.reviewerId,
      reviewer_note: input.reviewerNote.trim(),
      status: input.status,
    })
    .eq('id', input.proposalId)
  if (error) throw error
}

export async function editActionProposal(input: {
  details: string
  kind: string
  proposalId: number
  title: string
}) {
  const { error } = await supabase
    .from('session_action_proposals')
    .update({
      details: input.details.trim(),
      kind: input.kind,
      title: input.title.trim(),
    })
    .eq('id', input.proposalId)
  if (error) throw error
}
