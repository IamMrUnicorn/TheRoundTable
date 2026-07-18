import { supabase } from '../../lib/supabase'

export async function listCampaignActivity(campaignId: number) {
  const queries = await Promise.all([
    supabase
      .from('sessions')
      .select('id,title,status,updated_at')
      .eq('campaign_id', campaignId)
      .limit(8),
    supabase
      .from('campaign_announcements')
      .select('id,title,updated_at')
      .eq('campaign_id', campaignId)
      .limit(8),
    supabase
      .from('campaign_documents')
      .select('id,title,kind,updated_at')
      .eq('campaign_id', campaignId)
      .limit(8),
    supabase
      .from('campaign_objectives')
      .select('id,title,status,updated_at')
      .eq('campaign_id', campaignId)
      .limit(8),
    supabase
      .from('campaign_inventory_items')
      .select('id,name,quantity,updated_at')
      .eq('campaign_id', campaignId)
      .limit(8),
    supabase
      .from('campaign_tasks')
      .select('id,title,status,updated_at')
      .eq('campaign_id', campaignId)
      .limit(8),
    supabase
      .from('campaign_references')
      .select('id,name,kind,status,updated_at')
      .eq('campaign_id', campaignId)
      .limit(8),
  ])
  for (const query of queries) if (query.error) throw query.error
  const sessions = queries[0].data ?? []
  const announcements = queries[1].data ?? []
  const documents = queries[2].data ?? []
  const objectives = queries[3].data ?? []
  const inventory = queries[4].data ?? []
  const tasks = queries[5].data ?? []
  const references = queries[6].data ?? []
  return [
    ...sessions.map((x) => ({
      id: `session-${x.id}`,
      kind: 'session',
      label: x.title,
      detail: x.status,
      at: x.updated_at,
    })),
    ...announcements.map((x) => ({
      id: `announcement-${x.id}`,
      kind: 'announcement',
      label: x.title,
      detail: 'Campaign announcement',
      at: x.updated_at,
    })),
    ...documents.map((x) => ({
      id: `document-${x.id}`,
      kind: x.kind,
      label: x.title,
      detail: 'Campaign knowledge',
      at: x.updated_at,
    })),
    ...objectives.map((x) => ({
      id: `objective-${x.id}`,
      kind: 'objective',
      label: x.title,
      detail: x.status,
      at: x.updated_at,
    })),
    ...inventory.map((x) => ({
      id: `inventory-${x.id}`,
      kind: 'inventory',
      label: x.name,
      detail: `Quantity ${x.quantity}`,
      at: x.updated_at,
    })),
    ...tasks.map((x) => ({
      id: `task-${x.id}`,
      kind: 'task',
      label: x.title,
      detail: x.status.replace('_', ' '),
      at: x.updated_at,
    })),
    ...references.map((x) => ({
      id: `reference-${x.id}`,
      kind: x.kind,
      label: x.name,
      detail: x.status,
      at: x.updated_at,
    })),
  ]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 12)
}
