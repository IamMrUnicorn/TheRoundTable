import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import type { Json } from '../../types/database'
import { createSessionEvent } from '../sessions/session-events'
import { type DiceMode, describeDiceResult, rollFormula } from './dice'

export function DiceRollerPanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
}: {
  actorId: string
  campaignId: number
  characters: { id: number; name: string; owner_id: string }[]
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
        metadata = {
          formula: rolled.formula,
          manual: false,
          mode: rolled.mode,
          terms: rolled.terms,
          total,
          d20_candidates: rolled.d20Candidates ?? null,
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
        <input
          maxLength={160}
          placeholder="Roll label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        {manual ? (
          <input
            required
            type="number"
            min={-1_000_000}
            max={1_000_000}
            placeholder="Manual total"
            value={manualResult}
            onChange={(event) => setManualResult(event.target.value)}
          />
        ) : (
          <input
            required
            maxLength={120}
            aria-label="Dice formula"
            placeholder="1d20 + 5"
            value={formula}
            onChange={(event) => setFormula(event.target.value)}
          />
        )}
        <select
          value={mode}
          disabled={manual}
          onChange={(event) => setMode(event.target.value as DiceMode)}
        >
          <option value="normal">Normal</option>
          <option value="advantage">Advantage</option>
          <option value="disadvantage">Disadvantage</option>
        </select>
        <select
          value={characterId}
          onChange={(event) => setCharacterId(event.target.value)}
        >
          <option value="">No linked character</option>
          {availableCharacters.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>
        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value)}
        >
          <option value="party">Public roll</option>
          {isManager && <option value="gm_only">Private GM roll</option>}
        </select>
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
