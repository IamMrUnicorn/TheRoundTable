import { supabase } from '../../lib/supabase'

export async function listCampaignDocuments(campaignId: number) {
  const { data, error } = await supabase
    .from('campaign_documents')
    .select('*, profiles(display_name)')
    .eq('campaign_id', campaignId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createCampaignDocument(input: {
  authorId: string
  body: string
  campaignId: number
  isPinned: boolean
  kind: string
  title: string
  url: string
  visibility: string
}) {
  const { error } = await supabase.from('campaign_documents').insert({
    author_id: input.authorId,
    body: input.body.trim(),
    campaign_id: input.campaignId,
    is_pinned: input.isPinned,
    kind: input.kind,
    title: input.title.trim(),
    url: input.url.trim(),
    visibility: input.visibility,
  })
  if (error) throw error
}

export async function updateCampaignDocument(
  id: number,
  input: {
    body: string
    isPinned: boolean
    title: string
    url: string
  },
) {
  const { error } = await supabase
    .from('campaign_documents')
    .update({
      body: input.body.trim(),
      is_pinned: input.isPinned,
      title: input.title.trim(),
      url: input.url.trim(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCampaignDocument(id: number) {
  const { error } = await supabase
    .from('campaign_documents')
    .delete()
    .eq('id', id)
  if (error) throw error
}
