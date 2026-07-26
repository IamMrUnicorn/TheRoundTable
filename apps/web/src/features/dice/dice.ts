export type DiceMode = 'normal' | 'advantage' | 'disadvantage'

export type DiceTerm =
  | {
      count: number
      sign: 1 | -1
      sides: number
      type: 'dice'
      rolls: number[]
      subtotal: number
    }
  | { sign: 1 | -1; type: 'modifier'; value: number; subtotal: number }

export type DiceResult = {
  formula: string
  mode: DiceMode
  terms: DiceTerm[]
  total: number
  d20Candidates?: [number, number]
}

export const abilityNames = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const

export type AbilityName = (typeof abilityNames)[number]

export const skillAbilities = {
  acrobatics: 'dexterity',
  animal_handling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleight_of_hand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
} as const satisfies Record<string, AbilityName>

export type SkillName = keyof typeof skillAbilities

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2)
}

export function proficiencyBonus(level: number) {
  return Math.ceil(Math.max(1, level) / 4) + 1
}

export function d20Formula(modifier: number) {
  return `1d20 ${modifier < 0 ? '-' : '+'} ${Math.abs(modifier)}`
}

const randomFraction = () => {
  const value = new Uint32Array(1)
  crypto.getRandomValues(value)
  return value[0] / 4_294_967_296
}

export function rollFormula(
  input: string,
  mode: DiceMode = 'normal',
  random: () => number = randomFraction,
): DiceResult {
  const formula = input.replaceAll(/\s/g, '').toLowerCase()
  if (!formula || formula.length > 120)
    throw new Error('Enter a shorter dice formula.')

  const pattern = /([+-]?)(?:(\d*)d(\d+)|(\d+))/gy
  const parsed: Array<
    | { count: number; sign: 1 | -1; sides: number; type: 'dice' }
    | { sign: 1 | -1; type: 'modifier'; value: number }
  > = []
  let position = 0
  let totalDice = 0
  while (position < formula.length) {
    pattern.lastIndex = position
    const match = pattern.exec(formula)
    if (!match || match.index !== position)
      throw new Error('Use formulas like 1d20 + 5 or 2d6 + 1d4.')
    const sign = match[1] === '-' ? -1 : 1
    if (match[3]) {
      const count = Number(match[2] || 1)
      const sides = Number(match[3])
      if (count < 1 || count > 100)
        throw new Error('Each dice pool must contain 1–100 dice.')
      if (sides < 2 || sides > 1000)
        throw new Error('Dice must have 2–1000 sides.')
      totalDice += count
      parsed.push({ count, sign, sides, type: 'dice' })
    } else {
      const value = Number(match[4])
      if (value > 1_000_000)
        throw new Error('Modifiers cannot exceed 1,000,000.')
      parsed.push({ sign, type: 'modifier', value })
    }
    if (parsed.length > 20 || totalDice > 100)
      throw new Error('That formula contains too many terms or dice.')
    position = pattern.lastIndex
  }

  if (mode !== 'normal') {
    const diceTerms = parsed.filter((term) => term.type === 'dice')
    if (
      diceTerms.length !== 1 ||
      diceTerms[0].count !== 1 ||
      diceTerms[0].sides !== 20 ||
      diceTerms[0].sign !== 1
    )
      throw new Error(
        'Advantage and disadvantage require exactly 1d20 plus optional modifiers.',
      )
    const candidates: [number, number] = [
      Math.floor(random() * 20) + 1,
      Math.floor(random() * 20) + 1,
    ]
    const kept =
      mode === 'advantage' ? Math.max(...candidates) : Math.min(...candidates)
    const terms: DiceTerm[] = parsed.map((term) =>
      term.type === 'modifier'
        ? { ...term, subtotal: term.sign * term.value }
        : { ...term, rolls: [kept], subtotal: kept },
    )
    return {
      formula,
      mode,
      terms,
      total: terms.reduce((sum, term) => sum + term.subtotal, 0),
      d20Candidates: candidates,
    }
  }

  const terms: DiceTerm[] = parsed.map((term) => {
    if (term.type === 'modifier')
      return { ...term, subtotal: term.sign * term.value }
    const rolls = Array.from(
      { length: term.count },
      () => Math.floor(random() * term.sides) + 1,
    )
    return {
      ...term,
      rolls,
      subtotal: term.sign * rolls.reduce((sum, roll) => sum + roll, 0),
    }
  })
  return {
    formula,
    mode,
    terms,
    total: terms.reduce((sum, term) => sum + term.subtotal, 0),
  }
}

export function describeDiceResult(result: DiceResult) {
  const naturalRoll =
    result.terms[0]?.type === 'dice' ? result.terms[0].rolls[0] : result.total
  const details = result.d20Candidates
    ? `Rolled ${result.d20Candidates.join(' and ')}; kept ${naturalRoll}.`
    : result.terms
        .map((term) =>
          term.type === 'dice'
            ? `${term.sign === -1 ? '-' : ''}${term.count}d${term.sides} [${term.rolls.join(', ')}]`
            : `${term.sign === -1 ? '-' : '+'}${term.value}`,
        )
        .join(' ')
  return `${result.formula} = ${result.total}. ${details}`
}

export function criticalDamageFormula(input: string) {
  return input.replace(/(\d*)d(\d+)/gi, (_, count: string, sides: string) => {
    const diceCount = Number(count || 1)
    return `${diceCount * 2}d${sides}`
  })
}
