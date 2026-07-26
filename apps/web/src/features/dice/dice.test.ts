import { describe, expect, it } from 'vitest'

import {
  abilityModifier,
  criticalDamageFormula,
  d20Formula,
  describeDiceResult,
  proficiencyBonus,
  rollFormula,
} from './dice'

function sequence(values: number[]) {
  let index = 0
  return () => values[index++] ?? 0
}

describe('rollFormula', () => {
  it('rolls multiple pools and signed modifiers', () => {
    const result = rollFormula(
      '2d6 + 1d4 - 2',
      'normal',
      sequence([0, 0.5, 0.75]),
    )
    expect(result.total).toBe(7)
    expect(describeDiceResult(result)).toContain('2d6 [1, 4]')
    expect(describeDiceResult(result)).toContain('1d4 [4]')
  })

  it('keeps the higher or lower d20 for advantage modes', () => {
    expect(rollFormula('1d20', 'advantage', sequence([0.1, 0.9])).total).toBe(
      19,
    )
    expect(rollFormula('d20', 'disadvantage', sequence([0.1, 0.9])).total).toBe(
      3,
    )
    const modified = rollFormula('1d20 + 5', 'advantage', sequence([0.1, 0.9]))
    expect(modified.total).toBe(24)
    expect(modified.terms).toHaveLength(2)
  })

  it('rejects malformed, excessive, and incompatible formulas', () => {
    expect(() => rollFormula('2d6 bananas')).toThrow(/formulas/i)
    expect(() => rollFormula('101d6')).toThrow(/1–100/i)
    expect(() => rollFormula('2d20', 'advantage')).toThrow(/exactly 1d20/i)
  })
})

describe('character roll modifiers', () => {
  it('calculates ability and proficiency modifiers', () => {
    expect(abilityModifier(8)).toBe(-1)
    expect(abilityModifier(18)).toBe(4)
    expect(proficiencyBonus(1)).toBe(2)
    expect(proficiencyBonus(5)).toBe(3)
    expect(proficiencyBonus(17)).toBe(6)
    expect(d20Formula(-1)).toBe('1d20 - 1')
  })
})

describe('criticalDamageFormula', () => {
  it('doubles dice without doubling flat modifiers', () => {
    expect(criticalDamageFormula('1d8 + 2d6 + 4')).toBe('2d8 + 4d6 + 4')
    expect(criticalDamageFormula('d10 + 3')).toBe('2d10 + 3')
  })
})
