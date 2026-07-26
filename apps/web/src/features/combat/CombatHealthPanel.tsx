import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { applyCharacterHealthChange } from './health'

type HealthCharacter = {
  combat_state: string
  concentration: string
  conditions: string[]
  current_hp: number
  id: number
  max_hp: number
  name: string
  owner_id: string
  temporary_hp: number
}

export function CombatHealthPanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
  sessionStatus,
}: {
  actorId: string
  campaignId: number
  characters: HealthCharacter[]
  isManager: boolean
  sessionId: number
  sessionStatus: string
}) {
  const client = useQueryClient()
  const [amounts, setAmounts] = useState<Record<number, string>>({})
  const [feedback, setFeedback] = useState('')
  const change = useMutation({
    mutationFn: ({
      characterId,
      changeKind,
    }: {
      characterId: number
      changeKind: 'damage' | 'healing' | 'temporary_hp'
    }) => {
      const amount = Number(amounts[characterId] ?? '')
      if (!Number.isSafeInteger(amount) || amount < 1 || amount > 100000)
        throw new Error('Enter a whole-number amount between 1 and 100000.')
      return applyCharacterHealthChange({
        amount,
        changeKind,
        characterId,
        sessionId,
      })
    },
    onMutate: () => setFeedback(''),
    onSuccess: async (result, variables) => {
      setAmounts((current) => ({ ...current, [variables.characterId]: '' }))
      setFeedback(
        result.concentration_check_dc
          ? `Health updated. Concentration check required: DC ${result.concentration_check_dc} Constitution save.`
          : `Health updated. ${result.combat_state.replace('_', ' ')}.`,
      )
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['campaign-characters', campaignId],
        }),
        client.invalidateQueries({ queryKey: ['session-events', sessionId] }),
        client.invalidateQueries({
          queryKey: ['character-memories', variables.characterId],
        }),
        client.invalidateQueries({
          queryKey: ['character', variables.characterId],
        }),
      ])
    },
    onError: (error) =>
      setFeedback(
        error instanceof Error ? error.message : 'The health change failed.',
      ),
  })

  return (
    <section className="combat-health-panel">
      <header>
        <div>
          <p className="eyebrow">Combat state</p>
          <h3>Party health</h3>
        </div>
        {sessionStatus !== 'active' && (
          <span>Start the session to change health</span>
        )}
      </header>
      <div className="combat-health-grid">
        {characters.map((character) => {
          const canChange =
            sessionStatus === 'active' &&
            (isManager || character.owner_id === actorId)
          const hpPercent = character.max_hp
            ? Math.max(
                0,
                Math.min(100, (character.current_hp / character.max_hp) * 100),
              )
            : 0
          return (
            <article key={character.id}>
              <header>
                <strong>{character.name}</strong>
                <span>
                  {character.current_hp}/{character.max_hp} HP
                  {character.temporary_hp > 0 &&
                    ` + ${character.temporary_hp} temp`}
                </span>
              </header>
              <span className={`combat-state-badge ${character.combat_state}`}>
                {character.combat_state}
                {character.concentration && ` · concentrating`}
              </span>
              <div
                className="health-meter"
                aria-label={`${character.name} hit points`}
              >
                <span style={{ width: `${hpPercent}%` }} />
              </div>
              {character.conditions.length > 0 && (
                <p>{character.conditions.join(' · ')}</p>
              )}
              {canChange && (
                <div className="health-controls">
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    aria-label={`Health amount for ${character.name}`}
                    placeholder="Amount"
                    value={amounts[character.id] ?? ''}
                    onChange={(event) =>
                      setAmounts((current) => ({
                        ...current,
                        [character.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    disabled={change.isPending}
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        changeKind: 'damage',
                      })
                    }
                  >
                    Damage
                  </button>
                  <button
                    type="button"
                    disabled={change.isPending}
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        changeKind: 'healing',
                      })
                    }
                  >
                    Heal
                  </button>
                  <button
                    type="button"
                    disabled={change.isPending}
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        changeKind: 'temporary_hp',
                      })
                    }
                  >
                    Temp HP
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
      {feedback && (
        <p className={change.isError ? 'form-error' : 'muted-copy'}>
          {feedback}
        </p>
      )}
    </section>
  )
}
