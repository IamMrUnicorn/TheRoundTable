import { supabase } from '../../lib/supabase'

export async function getCampaignLogistics(campaignId: number) {
  const [inventory, tasks] = await Promise.all([
    supabase
      .from('campaign_inventory_items')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('category')
      .order('name'),
    supabase
      .from('campaign_tasks')
      .select(
        '*, assignee:profiles!campaign_tasks_assigned_to_fkey(display_name)',
      )
      .eq('campaign_id', campaignId)
      .order('status')
      .order('due_at', { nullsFirst: false }),
  ])
  if (inventory.error) throw inventory.error
  if (tasks.error) throw tasks.error
  return { inventory: inventory.data ?? [], tasks: tasks.data ?? [] }
}

export async function createInventoryItem(input: {
  campaignId: number
  category: string
  createdBy: string
  description: string
  holder: string
  name: string
  quantity: number
  unit: string
}) {
  const { error } = await supabase.from('campaign_inventory_items').insert({
    campaign_id: input.campaignId,
    category: input.category,
    created_by: input.createdBy,
    description: input.description.trim(),
    holder: input.holder.trim(),
    name: input.name.trim(),
    quantity: input.quantity,
    unit: input.unit.trim(),
  })
  if (error) throw error
}

export async function updateInventoryQuantity(id: number, quantity: number) {
  const { error } = await supabase
    .from('campaign_inventory_items')
    .update({ quantity })
    .eq('id', id)
  if (error) throw error
}

export async function deleteInventoryItem(id: number) {
  const { error } = await supabase
    .from('campaign_inventory_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function createCampaignTask(input: {
  assignedTo: string
  campaignId: number
  category: string
  createdBy: string
  description: string
  dueAt: string
  isGmOnly: boolean
  title: string
}) {
  const { error } = await supabase.from('campaign_tasks').insert({
    assigned_to: input.assignedTo || null,
    campaign_id: input.campaignId,
    category: input.category,
    created_by: input.createdBy,
    description: input.description.trim(),
    due_at: input.dueAt ? new Date(input.dueAt).toISOString() : null,
    is_gm_only: input.isGmOnly,
    title: input.title.trim(),
  })
  if (error) throw error
}

export async function updateCampaignTaskStatus(id: number, status: string) {
  const { error } = await supabase
    .from('campaign_tasks')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCampaignTask(id: number) {
  const { error } = await supabase.from('campaign_tasks').delete().eq('id', id)
  if (error) throw error
}
