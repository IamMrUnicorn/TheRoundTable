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
  ruleset?: string
}) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      description: input.description.trim(),
      name: input.name.trim(),
      owner_id: input.ownerId,
      ruleset: input.ruleset?.trim() || 'D&D 5e',
      slug: createSlug(input.name),
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function createSampleCampaign(ownerId: string) {
  const campaign = await createCampaign({
    description:
      'A testing campaign filled with representative characters, sessions, lore, quests, inventory, and campaign references.',
    name: `The Ember Crown · Sample ${new Date().toLocaleDateString()}`,
    ownerId,
    ruleset: 'D&D 2024',
  })
  const now = Date.now()
  const pastStart = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const futureStart = new Date(now + 2 * 24 * 60 * 60 * 1000)
  const withCampaign = { campaign_id: campaign.id }

  const results = await Promise.all([
    supabase
      .from('characters')
      .insert({
        ...withCampaign,
        ancestry: 'Owlin',
        appearance:
          'A charcoal-feathered scholar wearing a weathered green cloak and a brass astrolabe.',
        armor_class: 14,
        background: 'Sage',
        biography:
          'Left the Starlit Archive after discovering a map burned into an impossible constellation.',
        charisma: 11,
        class_name: 'Wizard',
        constitution: 14,
        current_hp: 31,
        dexterity: 16,
        intelligence: 18,
        languages: ['Common', 'Elvish', 'Celestial'],
        level: 5,
        max_hp: 38,
        name: 'Sable Quill',
        owner_id: ownerId,
        saving_throw_proficiencies: ['intelligence', 'wisdom'],
        skill_proficiencies: ['arcana', 'history', 'investigation'],
        strength: 8,
        wisdom: 15,
      })
      .select('id')
      .single(),
    supabase.from('campaign_announcements').insert([
      {
        ...withCampaign,
        author_id: ownerId,
        body: 'Bring your character sheets and decide whether the party trusts Captain Veyra before the next session.',
        is_pinned: true,
        title: 'Next session preparation',
      },
      {
        ...withCampaign,
        author_id: ownerId,
        body: 'The party reached Ashfall Harbor and recovered the first fragment of the Ember Crown.',
        is_pinned: false,
        title: 'Chapter two complete',
      },
    ]),
    supabase.from('campaign_documents').insert([
      {
        ...withCampaign,
        author_id: ownerId,
        body: 'The Crown was divided into three fragments after the War of Cinders. Each fragment responds to a different oath.',
        is_pinned: true,
        kind: 'note',
        title: 'The Ember Crown',
        url: '',
        visibility: 'shared',
      },
      {
        ...withCampaign,
        author_id: ownerId,
        body: 'Veyra secretly serves the Glass Consortium, but intends to betray them if the party protects her crew.',
        is_pinned: false,
        kind: 'note',
        title: 'Captain Veyra — private motives',
        url: '',
        visibility: 'game_master',
      },
    ]),
    supabase.from('campaign_world_states').insert({
      ...withCampaign,
      current_location: 'Ashfall Harbor',
      in_world_datetime: '14 Emberwane, 742 AR — dusk',
      summary:
        'A volcanic storm has trapped every ship in port while agents of the Glass Consortium search the lower city.',
      updated_by: ownerId,
      weather: 'Warm black rain and distant thunder',
    }),
    supabase.from('campaign_objectives').insert([
      {
        ...withCampaign,
        created_by: ownerId,
        description: 'Follow the cipher found inside the lighthouse lens.',
        priority: 'high',
        title: 'Find the second Crown fragment',
      },
      {
        ...withCampaign,
        created_by: ownerId,
        description: 'Learn why Veyra lied about the Black Gull’s cargo.',
        priority: 'normal',
        title: 'Question Captain Veyra',
      },
    ]),
    supabase.from('campaign_references').insert([
      {
        ...withCampaign,
        created_by: ownerId,
        details:
          'A quick-witted privateer who values her crew more than any flag.',
        kind: 'npc',
        name: 'Captain Veyra Holt',
        status: 'uneasy ally',
        summary: 'Captain of the Black Gull',
        tags: ['captain', 'harbor', 'ally'],
      },
      {
        ...withCampaign,
        created_by: ownerId,
        details:
          'A trade syndicate collecting magical relics through bribery and coercion.',
        kind: 'faction',
        name: 'The Glass Consortium',
        status: 'hostile',
        summary: 'Relic merchants and information brokers',
        tags: ['villain', 'merchant', 'secret'],
      },
      {
        ...withCampaign,
        created_by: ownerId,
        details:
          'A steep harbor city built across black volcanic shelves and linked by brass lifts.',
        kind: 'location',
        name: 'Ashfall Harbor',
        status: 'current location',
        summary: 'Stormbound city on the Cinder Coast',
        tags: ['city', 'harbor', 'current'],
      },
      {
        ...withCampaign,
        created_by: ownerId,
        details:
          'Its shattered lens concealed a cipher pointing toward the drowned observatory.',
        kind: 'location',
        name: 'The Cinder Lighthouse',
        status: 'explored',
        summary: 'Abandoned lighthouse above the old breakwater',
        tags: ['ruin', 'clue', 'past'],
      },
    ]),
    supabase.from('campaign_inventory_items').insert([
      {
        ...withCampaign,
        category: 'quest',
        created_by: ownerId,
        description:
          'Warm to the touch and etched with half of an ancient oath.',
        holder: 'Sable Quill',
        name: 'First Ember Crown Fragment',
        quantity: 1,
        unit: '',
      },
      {
        ...withCampaign,
        category: 'consumable',
        created_by: ownerId,
        description: 'Restores a small amount of vitality.',
        holder: 'Party',
        name: 'Potion of Healing',
        quantity: 3,
        unit: '',
      },
    ]),
    supabase
      .from('sessions')
      .insert([
        {
          ...withCampaign,
          agenda:
            'Arrival at Ashfall Harbor, lighthouse exploration, and the Consortium ambush.',
          created_by: ownerId,
          ends_at: new Date(
            pastStart.getTime() + 3 * 60 * 60 * 1000,
          ).toISOString(),
          starts_at: pastStart.toISOString(),
          status: 'completed',
          title: 'The Lighthouse Cipher',
        },
        {
          ...withCampaign,
          agenda:
            'Investigate the Black Gull, meet the harbor council, and choose an ally.',
          created_by: ownerId,
          ends_at: new Date(
            futureStart.getTime() + 3 * 60 * 60 * 1000,
          ).toISOString(),
          starts_at: futureStart.toISOString(),
          status: 'scheduled',
          title: 'Secrets of the Black Gull',
        },
      ])
      .select('id, status'),
  ])

  const failed = results.find((result) => result.error)
  if (failed?.error) {
    await supabase.from('campaigns').delete().eq('id', campaign.id)
    throw failed.error
  }

  const sampleCharacter = results[0].data as { id: number } | null
  if (sampleCharacter) {
    const { error } = await supabase.from('character_inventory_items').insert({
      attack_ability: 'dexterity',
      category: 'equipment',
      character_id: sampleCharacter.id,
      damage_formula: '1d6',
      damage_type: 'piercing',
      description: 'A balanced silvered blade carried for close encounters.',
      is_equipped: true,
      is_proficient: true,
      is_weapon: true,
      location: 'Belt',
      name: 'Silvered shortsword',
      quantity: 1,
      weapon_range: '5 ft',
    })
    if (error) {
      await supabase.from('campaigns').delete().eq('id', campaign.id)
      throw error
    }
  }

  const sessions = results.at(-1)?.data as
    { id: number; status: string }[] | null
  const scheduled = sessions?.find((session) => session.status === 'scheduled')
  if (scheduled) {
    const { error } = await supabase.from('session_attendance').insert({
      response: 'attending',
      session_id: scheduled.id,
      user_id: ownerId,
    })
    if (error) {
      await supabase.from('campaigns').delete().eq('id', campaign.id)
      throw error
    }
  }

  return campaign
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
    requiresJoinApproval: boolean
    ruleset: string
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
      requires_join_approval: input.requiresJoinApproval,
      ruleset: input.ruleset.trim(),
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

export async function updateMemberStatus(
  campaignId: number,
  userId: string,
  status: string,
) {
  const { error } = await supabase
    .from('campaign_members')
    .update({
      status,
      joined_at: status === 'active' ? new Date().toISOString() : null,
    })
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
