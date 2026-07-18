import { supabase } from '../../lib/supabase'

export async function listMyInvitations() {
  const { data, error } = await supabase
    .from('campaign_invitations')
    .select('*, campaigns(name)')
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listCampaignInvitations(campaignId: number) {
  const { data, error } = await supabase
    .from('campaign_invitations')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createCampaignInvitation(input: {
  campaignId: number
  email: string
  invitedBy: string
  role: string
}) {
  const { error } = await supabase.from('campaign_invitations').insert({
    campaign_id: input.campaignId,
    invited_by: input.invitedBy,
    invited_email: input.email.trim().toLowerCase(),
    role: input.role,
  })
  if (error) throw error
}

export async function respondCampaignInvitation(
  token: string,
  accept: boolean,
) {
  const { data, error } = await supabase.rpc('respond_campaign_invitation', {
    invitation_token: token,
    should_accept: accept,
  })
  if (error) throw error
  return data
}

export async function cancelCampaignInvitation(id: number) {
  const { error } = await supabase
    .from('campaign_invitations')
    .update({ status: 'cancelled' })
    .eq('id', id)
  if (error) throw error
}
