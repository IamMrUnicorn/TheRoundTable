import { supabase } from '../../lib/supabase'
import type { Tables } from '../../types/database'

export type CampaignSummary = Tables<'campaigns'> & {
  membershipRole: string
}

export type CampaignMember = Pick<
  Tables<'campaign_members'>,
  'joined_at' | 'role' | 'status' | 'user_id'
> & {
  profiles: Pick<Tables<'profiles'>, 'display_name'> | null
}

export type CampaignDetail = Tables<'campaigns'> & {
  campaign_members: CampaignMember[]
}

export async function listCampaigns(userId: string) {
  const [campaignsResult, membershipsResult] = await Promise.all([
    supabase.from('campaigns').select('*').order('updated_at', {
      ascending: false,
    }),
    supabase
      .from('campaign_members')
      .select('campaign_id, role')
      .eq('user_id', userId)
      .eq('status', 'active'),
  ])

  if (campaignsResult.error) throw campaignsResult.error
  if (membershipsResult.error) throw membershipsResult.error

  const roles = new Map(
    membershipsResult.data.map(({ campaign_id, role }) => [campaign_id, role]),
  )

  return campaignsResult.data.map((campaign) => ({
    ...campaign,
    membershipRole:
      roles.get(campaign.id) ??
      (campaign.owner_id === userId ? 'owner' : 'player'),
  })) satisfies CampaignSummary[]
}

function createSlug(name: string) {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'campaign'
  const suffix = crypto.randomUUID().slice(0, 6)
  return `${base.slice(0, 72)}-${suffix}`
}

export async function createCampaign(input: {
  description: string
  name: string
  ownerId: string
}) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      description: input.description.trim(),
      name: input.name.trim(),
      owner_id: input.ownerId,
      slug: createSlug(input.name),
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function joinCampaign(inviteCode: string) {
  const { data, error } = await supabase.rpc('join_campaign', {
    campaign_code: inviteCode.trim().toUpperCase(),
  })

  if (error) throw error
  return data
}

export async function getCampaign(campaignId: number) {
  const { data, error } = await supabase
    .from('campaigns')
    .select(
      '*, campaign_members(user_id, role, status, joined_at, profiles(display_name))',
    )
    .eq('id', campaignId)
    .eq('campaign_members.status', 'active')
    .single()

  if (error) throw error
  return data as CampaignDetail
}

export async function updateCampaignSettings(
  campaignId: number,
  input: {
    cadence: string
    description: string
    name: string
    preferredSessionMinutes: number
    status: string
    timezone: string
  },
) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      cadence: input.cadence,
      description: input.description.trim(),
      name: input.name.trim(),
      preferred_session_minutes: input.preferredSessionMinutes,
      status: input.status,
      timezone: input.timezone.trim(),
    })
    .eq('id', campaignId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function rotateInviteCode(campaignId: number) {
  const inviteCode = crypto
    .randomUUID()
    .replaceAll('-', '')
    .slice(0, 8)
    .toUpperCase()
  const { data, error } = await supabase
    .from('campaigns')
    .update({ invite_code: inviteCode })
    .eq('id', campaignId)
    .select('invite_code')
    .single()
  if (error) throw error
  return data.invite_code
}

export async function transferCampaignOwnership(
  campaignId: number,
  newOwnerId: string,
) {
  const { error } = await supabase.rpc('transfer_campaign_ownership', {
    campaign_id: campaignId,
    new_owner_id: newOwnerId,
  })
  if (error) throw error
}

export async function updateMemberRole(
  campaignId: number,
  userId: string,
  role: string,
) {
  const { error } = await supabase
    .from('campaign_members')
    .update({ role })
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function removeCampaignMember(campaignId: number, userId: string) {
  const { error } = await supabase
    .from('campaign_members')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function listAnnouncements(campaignId: number) {
  const { data, error } = await supabase
    .from('campaign_announcements')
    .select('*, profiles(display_name)')
    .eq('campaign_id', campaignId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createAnnouncement(input: {
  authorId: string
  body: string
  campaignId: number
  isPinned: boolean
  title: string
}) {
  const { error } = await supabase.from('campaign_announcements').insert({
    author_id: input.authorId,
    body: input.body.trim(),
    campaign_id: input.campaignId,
    is_pinned: input.isPinned,
    title: input.title.trim(),
  })
  if (error) throw error
}

export async function deleteAnnouncement(id: number) {
  const { error } = await supabase
    .from('campaign_announcements')
    .delete()
    .eq('id', id)
  if (error) throw error
}
