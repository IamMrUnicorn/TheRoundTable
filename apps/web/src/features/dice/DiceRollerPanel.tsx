import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import type { Json } from '../../types/database'
import { createSessionEvent } from '../sessions/session-events'
import {
  type AbilityName,
  type DiceMode,
  abilityModifier,
  abilityNames,
  d20Formula,
  describeDiceResult,
  proficiencyBonus,
  rollFormula,
  skillAbilities,
} from './dice'

type RollCharacter = {
  charisma: number
  constitution: number
  dexterity: number
  id: number
  intelligence: number
  level: number
  name: string
  owner_id: string
  saving_throw_proficiencies: string[]
  skill_expertise: string[]
  skill_proficiencies: string[]
  strength: number
  wisdom: number
}

const titleCase = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export function DiceRollerPanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
}: {
  actorId: string
  campaignId: number
  characters: RollCharacter[]
  isManager: boolean
  sessionId: number
}) {
  const client = useQueryClient()
  const availableCharacters = isManager
    ? characters
    : characters.filter((character) => character.owner_id === actorId)
  const [formula, setFormula] = useState('1d20')
  const [mode, setMode] = useState<DiceMode>('normal')
  const [label, setLabel] = useState('Check')
  const [characterId, setCharacterId] = useState('')
  const [visibility, setVisibility] = useState('party')
  const [manual, setManual] = useState(false)
  const [manualResult, setManualResult] = useState('')
  const [shortcut, setShortcut] = useState('')
  const [result, setResult] = useState('')
  const [validationError, setValidationError] = useState('')
  const record = useMutation({
    mutationFn: () => {
      let body: string
      let total: number
      let metadata: Json
      if (manual) {
        total = Number(manualResult)
        if (!Number.isSafeInteger(total) || Math.abs(total) > 1_000_000)
          throw new Error(
            'Enter a whole-number manual result between -1,000,000 and 1,000,000.',
          )
        body = `Manual result: ${total}.`
        metadata = { formula: null, manual: true, mode: 'manual', total }
      } else {
        const rolled = rollFormula(formula, mode)
        total = rolled.total
        body = describeDiceResult(rolled)
        const firstTerm = rolled.terms[0]
        const naturalRoll =
          firstTerm?.type === 'dice' && firstTerm.sides === 20
            ? firstTerm.rolls[0]
            : null
        metadata = {
          formula: rolled.formula,
          manual: false,
          mode: rolled.mode,
          terms: rolled.terms,
          total,
          d20_candidates: rolled.d20Candidates ?? null,
          natural_roll: naturalRoll,
          natural_outcome:
            naturalRoll === 20
              ? 'natural_20'
              : naturalRoll === 1
                ? 'natural_1'
                : null,
        } as Json
      }
      setResult(`${label.trim() || 'Roll'}: ${total}`)
      return createSessionEvent({
        actor_id: actorId,
        campaign_id: campaignId,
        session_id: sessionId,
        character_id: characterId ? Number(characterId) : null,
        kind: 'roll',
        visibility,
        title: `${label.trim() || 'Roll'}: ${total}`,
        body,
        metadata,
      })
    },
    onMutate: () => setValidationError(''),
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: ['session-events', sessionId],
      })
    },
    onError: (error) =>
      setValidationError(
        error instanceof Error ? error.message : 'The roll failed.',
      ),
  })
  const applyShortcut = (value: string) => {
    setShortcut(value)
    const character = availableCharacters.find(
      (entry) => entry.id === Number(characterId),
    )
    if (!character || !value) return
    const [kind, name] = value.split(':') as [
      'ability' | 'save' | 'skill',
      string,
    ]
    const ability =
      kind === 'skill'
        ? skillAbilities[name as keyof typeof skillAbilities]
        : (name as AbilityName)
    let modifier = abilityModifier(character[ability])
    if (kind === 'save') {
      if (character.saving_throw_proficiencies.includes(name))
        modifier += proficiencyBonus(character.level)
    } else if (kind === 'skill') {
      if (character.skill_expertise.includes(name))
        modifier += proficiencyBonus(character.level) * 2
      else if (character.skill_proficiencies.includes(name))
        modifier += proficiencyBonus(character.level)
    }
    setFormula(d20Formula(modifier))
    setLabel(
      kind === 'ability'
        ? `${titleCase(name)} check`
        : kind === 'save'
          ? `${titleCase(name)} saving throw`
          : `${titleCase(name)} check`,
    )
    setManual(false)
  }

  return (
    <section className="dice-roller-panel">
      <header>
        <div>
          <p className="eyebrow">Action tool</p>
          <h3>Dice roller</h3>
        </div>
        {result && <strong>{result}</strong>}
      </header>
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          record.mutate()
        }}
      >
        <label className="play-field">
          Roll name
          <input
            maxLength={160}
            placeholder="Perception check"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>
        <label className="play-field">
          {manual ? 'Recorded total' : 'Dice formula'}
          {manual ? (
            <input
              required
              type="number"
              min={-1_000_000}
              max={1_000_000}
              placeholder="15"
              value={manualResult}
              onChange={(event) => setManualResult(event.target.value)}
            />
          ) : (
            <input
              required
              maxLength={120}
              placeholder="1d20 + 5"
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
            />
          )}
        </label>
        <label className="play-field">
          Roll mode
          <select
            value={mode}
            disabled={manual}
            onChange={(event) => setMode(event.target.value as DiceMode)}
          >
            <option value="normal">Normal</option>
            <option value="advantage">Advantage</option>
            <option value="disadvantage">Disadvantage</option>
          </select>
        </label>
        <label className="play-field">
          Rolling character
          <select
            value={characterId}
            onChange={(event) => {
              setCharacterId(event.target.value)
              setShortcut('')
            }}
          >
            <option value="">No linked character</option>
            {availableCharacters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
        </label>
        <label className="play-field">
          Character check or save
          <select
            disabled={!characterId || manual}
            value={shortcut}
            onChange={(event) => applyShortcut(event.target.value)}
          >
            <option value="">Choose a shortcut</option>
            <optgroup label="Ability checks">
              {abilityNames.map((ability) => (
                <option key={`ability:${ability}`} value={`ability:${ability}`}>
                  {titleCase(ability)}
                </option>
              ))}
            </optgroup>
            <optgroup label="Saving throws">
              {abilityNames.map((ability) => (
                <option key={`save:${ability}`} value={`save:${ability}`}>
                  {titleCase(ability)} save
                </option>
              ))}
            </optgroup>
            <optgroup label="Skills">
              {Object.keys(skillAbilities).map((skill) => (
                <option key={`skill:${skill}`} value={`skill:${skill}`}>
                  {titleCase(skill)}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="play-field">
          Who can see this roll?
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
          >
            <option value="party">Entire party</option>
            {isManager && <option value="gm_only">Game Master only</option>}
          </select>
        </label>
        <label className="manual-roll-toggle">
          <input
            type="checkbox"
            checked={manual}
            onChange={(event) => setManual(event.target.checked)}
          />
          Manual result
        </label>
        <button disabled={record.isPending}>
          {record.isPending
            ? 'Rolling…'
            : manual
              ? 'Record result'
              : 'Roll & record'}
        </button>
      </form>
      {validationError && <p className="form-error">{validationError}</p>}
      <p className="muted-copy">
        Examples: 1d20 + 5, 2d6 + 1d4 + 3, or d100. Every result becomes an
        immutable session event.
      </p>
    </section>
  )
}
