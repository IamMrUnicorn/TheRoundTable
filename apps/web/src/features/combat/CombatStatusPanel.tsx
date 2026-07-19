import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { applyCharacterStatusChange, type StatusOperation } from './status'

const conditions = [
  'blinded',
  'charmed',
  'deafened',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
] as const

type StatusCharacter = {
  concentration: string
  conditions: string[]
  death_save_failures: number
  death_save_successes: number
  id: number
  name: string
  owner_id: string
}

export function CombatStatusPanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
  sessionStatus,
}: {
  actorId: string
  campaignId: number
  characters: StatusCharacter[]
  isManager: boolean
  sessionId: number
  sessionStatus: string
}) {
  const client = useQueryClient()
  const [selectedConditions, setSelectedConditions] = useState<
    Record<number, string>
  >({})
  const [concentration, setConcentration] = useState<Record<number, string>>({})
  const [feedback, setFeedback] = useState('')
  const change = useMutation({
    mutationFn: ({
      characterId,
      operation,
      value,
    }: {
      characterId: number
      operation: StatusOperation
      value?: string
    }) =>
      applyCharacterStatusChange({ characterId, operation, sessionId, value }),
    onMutate: () => setFeedback(''),
    onSuccess: async (_, variables) => {
      setFeedback('Combat status and history updated.')
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['campaign-characters', campaignId],
        }),
        client.invalidateQueries({ queryKey: ['session-events', sessionId] }),
        client.invalidateQueries({
          queryKey: ['character', variables.characterId],
        }),
        client.invalidateQueries({
          queryKey: ['character-memories', variables.characterId],
        }),
      ])
    },
    onError: (error) =>
      setFeedback(
        error instanceof Error ? error.message : 'The status change failed.',
      ),
  })

  return (
    <section className="combat-status-panel">
      <header>
        <div>
          <p className="eyebrow">Ongoing effects</p>
          <h3>Conditions, concentration & death saves</h3>
        </div>
      </header>
      <div className="combat-status-grid">
        {characters.map((character) => {
          const canChange =
            sessionStatus === 'active' &&
            (isManager || character.owner_id === actorId)
          const selected = selectedConditions[character.id] ?? 'prone'
          return (
            <article key={character.id}>
              <header>
                <strong>{character.name}</strong>
                <span>
                  Death saves: {character.death_save_successes} ✓ ·{' '}
                  {character.death_save_failures} ✕
                </span>
              </header>
              <p>
                {character.conditions.length
                  ? character.conditions.join(' · ')
                  : 'No active conditions'}
              </p>
              <p>
                {character.concentration
                  ? `Concentrating: ${character.concentration}`
                  : 'Not concentrating'}
              </p>
              {canChange && (
                <div className="status-controls">
                  <select
                    value={selected}
                    onChange={(event) =>
                      setSelectedConditions((current) => ({
                        ...current,
                        [character.id]: event.target.value,
                      }))
                    }
                  >
                    {conditions.map((condition) => (
                      <option key={condition}>{condition}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        operation: character.conditions.includes(selected)
                          ? 'condition_remove'
                          : 'condition_add',
                        value: selected,
                      })
                    }
                  >
                    {character.conditions.includes(selected)
                      ? 'Remove condition'
                      : 'Add condition'}
                  </button>
                  <input
                    maxLength={160}
                    placeholder="Concentration source"
                    value={concentration[character.id] ?? ''}
                    onChange={(event) =>
                      setConcentration((current) => ({
                        ...current,
                        [character.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    disabled={!concentration[character.id]?.trim()}
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        operation: 'concentration_start',
                        value: concentration[character.id],
                      })
                    }
                  >
                    Concentrate
                  </button>
                  {character.concentration && (
                    <button
                      type="button"
                      onClick={() =>
                        change.mutate({
                          characterId: character.id,
                          operation: 'concentration_end',
                        })
                      }
                    >
                      End concentration
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        operation: 'death_success',
                      })
                    }
                  >
                    Save ✓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        operation: 'death_failure',
                      })
                    }
                  >
                    Fail ✕
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        operation: 'death_reset',
                      })
                    }
                  >
                    Reset saves
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
