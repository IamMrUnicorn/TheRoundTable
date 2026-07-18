import { supabase } from '../../lib/supabase'

export async function getCampaignStory(campaignId: number) {
  const [world, gmState, objectives] = await Promise.all([
    supabase
      .from('campaign_world_states')
      .select('*')
      .eq('campaign_id', campaignId)
      .maybeSingle(),
    supabase
      .from('campaign_gm_states')
      .select('*')
      .eq('campaign_id', campaignId)
      .maybeSingle(),
    supabase
      .from('campaign_objectives')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('status')
      .order('priority')
      .order('updated_at', { ascending: false }),
  ])
  for (const result of [world, gmState, objectives])
    if (result.error) throw result.error
  return {
    gmState: gmState.data,
    objectives: objectives.data ?? [],
    world: world.data,
  }
}

export async function saveWorldState(input: {
  campaignId: number
  currentLocation: string
  inWorldDatetime: string
  summary: string
  updatedBy: string
  weather: string
}) {
  const { error } = await supabase.from('campaign_world_states').upsert(
    {
      campaign_id: input.campaignId,
      current_location: input.currentLocation.trim(),
      in_world_datetime: input.inWorldDatetime.trim(),
      summary: input.summary.trim(),
      updated_by: input.updatedBy,
      weather: input.weather.trim(),
    },
    { onConflict: 'campaign_id' },
  )
  if (error) throw error
}

export async function saveGmState(input: {
  campaignId: number
  secretState: string
  updatedBy: string
}) {
  const { error } = await supabase.from('campaign_gm_states').upsert(
    {
      campaign_id: input.campaignId,
      secret_state: input.secretState.trim(),
      updated_by: input.updatedBy,
    },
    { onConflict: 'campaign_id' },
  )
  if (error) throw error
}

export async function createObjective(input: {
  campaignId: number
  createdBy: string
  description: string
  isSecret: boolean
  priority: string
  title: string
}) {
  const { error } = await supabase.from('campaign_objectives').insert({
    campaign_id: input.campaignId,
    created_by: input.createdBy,
    description: input.description.trim(),
    is_secret: input.isSecret,
    priority: input.priority,
    title: input.title.trim(),
  })
  if (error) throw error
}

export async function updateObjective(
  id: number,
  updates: { priority?: string; status?: string },
) {
  const { error } = await supabase
    .from('campaign_objectives')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteObjective(id: number) {
  const { error } = await supabase
    .from('campaign_objectives')
    .delete()
    .eq('id', id)
  if (error) throw error
}
