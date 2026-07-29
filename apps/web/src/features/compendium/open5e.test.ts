import { describe, expect, it } from 'vitest'

import { normalizeMonsterAttacks, type Open5eMonster } from './open5e'

describe('normalizeMonsterAttacks', () => {
  it('uses the licensed stat-block text for complete attack damage data', () => {
    const monster = {
      actions: [
        {
          action_type: 'ACTION',
          attacks: [
            {
              damage_bonus: null,
              damage_die_count: 1,
              damage_die_type: 'd6',
              damage_type: { name: 'Thunder' },
              reach: 5,
              to_hit_mod: 4,
            },
          ],
          desc: 'Melee Weapon Attack: +4 to hit. Hit: 5 (1d6 + 2) slashing damage.',
          name: 'Scimitar',
        },
      ],
    } as Open5eMonster

    expect(normalizeMonsterAttacks(monster).actions[0].automation).toEqual({
      attack_bonus: 4,
      damage_bonus: 2,
      damage_dice_count: 1,
      damage_die_size: 6,
      damage_type: 'slashing',
    })
  })
})
