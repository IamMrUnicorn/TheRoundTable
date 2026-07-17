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
