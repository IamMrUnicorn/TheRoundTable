export type Open5eAction = {
  action_type: string
  automation?: {
    attack_bonus: number
    damage_bonus: number
    damage_dice_count: number
    damage_die_size: number
    damage_type: string
  }
  attacks: {
    damage_bonus: number | null
    damage_die_count: number | null
    damage_die_type: string | null
    damage_type: { name: string } | null
    reach: number | null
    to_hit_mod: number | null
  }[]
  desc: string
  name: string
}

export function normalizeMonsterAttacks(monster: Open5eMonster) {
  return {
    ...monster,
    actions: monster.actions.map((action) => {
      const attack = action.attacks[0]
      const hit = action.desc.match(
        /Hit:\s*\d+\s*\((\d+)d(\d+)\s*([+-]\s*\d+)?\)\s*([a-z]+)\s+damage/i,
      )
      if (!attack || attack.to_hit_mod === null || !hit) return action
      return {
        ...action,
        automation: {
          attack_bonus: attack.to_hit_mod,
          damage_bonus: Number((hit[3] ?? '0').replaceAll(' ', '')),
          damage_dice_count: Number(hit[1]),
          damage_die_size: Number(hit[2]),
          damage_type: hit[4].toLowerCase(),
        },
      }
    }),
  }
}

export type Open5eMonster = {
  ability_scores: Record<string, number>
  actions: Open5eAction[]
  alignment: string
  armor_class: number
  armor_detail: string
  challenge_rating: number
  document: {
    key: string
    name: string
    permalink: string
  }
  environments: string[]
  hit_dice: string
  hit_points: number
  initiative_bonus: number
  key: string
  languages: { as_string: string }
  name: string
  passive_perception: number
  resistances_and_immunities: Record<string, string | string[]>
  saving_throws: Record<string, number>
  senses?: Record<string, unknown>
  size: { name: string }
  skill_bonuses: Record<string, number>
  speed: Record<string, number | string>
  traits: { desc: string; name: string }[]
  type: { name: string }
}

type Open5eResponse = {
  count: number
  results: Open5eMonster[]
}

export async function searchSrdMonsters(search: string) {
  const params = new URLSearchParams({
    document__key__in: 'srd-2014',
    limit: '20',
    ordering: 'challenge_rating',
  })
  if (search.trim()) params.set('name__icontains', search.trim())
  const response = await fetch(
    `https://api.open5e.com/v2/creatures/?${params.toString()}`,
  )
  if (!response.ok)
    throw new Error('The open SRD monster library could not be reached.')
  return (await response.json()) as Open5eResponse
}

export function monsterSpeed(monster: Open5eMonster) {
  return Object.entries(monster.speed)
    .map(([kind, value]) =>
      kind === 'unit'
        ? null
        : `${kind} ${value} ${monster.speed.unit ?? 'ft.'}`,
    )
    .filter(Boolean)
    .join(', ')
}
