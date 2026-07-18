import { describe, expect, it } from 'vitest'

import { describeDiceResult, rollFormula } from './dice'

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
  })

  it('rejects malformed, excessive, and incompatible formulas', () => {
    expect(() => rollFormula('2d6 bananas')).toThrow(/formulas/i)
    expect(() => rollFormula('101d6')).toThrow(/1–100/i)
    expect(() => rollFormula('2d20', 'advantage')).toThrow(/exactly 1d20/i)
  })
})
