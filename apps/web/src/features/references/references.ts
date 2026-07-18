import { supabase } from '../../lib/supabase'

export async function listCampaignReferences(campaignId: number) {
  const { data, error } = await supabase
    .from('campaign_references')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('kind')
    .order('name')
  if (error) throw error
  return data
}

export async function createCampaignReference(input: {
  campaignId: number
  createdBy: string
  details: string
  isSecret: boolean
  kind: string
  name: string
  status: string
  summary: string
  tags: string
}) {
  const { error } = await supabase.from('campaign_references').insert({
    campaign_id: input.campaignId,
    created_by: input.createdBy,
    details: input.details.trim(),
    is_secret: input.isSecret,
    kind: input.kind,
    name: input.name.trim(),
    status: input.status.trim(),
    summary: input.summary.trim(),
    tags: input.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 20),
  })
  if (error) throw error
}

export async function updateCampaignReference(
  id: number,
  updates: { details?: string; status?: string; summary?: string },
) {
  const { error } = await supabase
    .from('campaign_references')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteCampaignReference(id: number) {
  const { error } = await supabase
    .from('campaign_references')
    .delete()
    .eq('id', id)
  if (error) throw error
}
