import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  applyCharacterCondition,
  applyCharacterStatusChange,
  listCharacterConditions,
  type StatusOperation,
} from './status'

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
  combat_state: string
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
  const [conditionSources, setConditionSources] = useState<
    Record<number, string>
  >({})
  const [conditionRounds, setConditionRounds] = useState<
    Record<number, string>
  >({})
  const [feedback, setFeedback] = useState('')
  const conditionInstances = useQuery({
    queryKey: ['character-condition-instances', sessionId],
    queryFn: () => listCharacterConditions(sessionId),
    refetchInterval: 5_000,
  })
  const refresh = async (characterId: number) => {
    await Promise.all([
      client.invalidateQueries({
        queryKey: ['campaign-characters', campaignId],
      }),
      client.invalidateQueries({ queryKey: ['session-events', sessionId] }),
      client.invalidateQueries({
        queryKey: ['character', characterId],
      }),
      client.invalidateQueries({
        queryKey: ['character-memories', characterId],
      }),
      client.invalidateQueries({
        queryKey: ['character-condition-instances', sessionId],
      }),
    ])
  }
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
      await refresh(variables.characterId)
    },
    onError: (error) =>
      setFeedback(
        error instanceof Error ? error.message : 'The status change failed.',
      ),
  })
  const changeCondition = useMutation({
    mutationFn: ({
      characterId,
      condition,
      operation,
    }: {
      characterId: number
      condition: string
      operation: 'add' | 'remove'
    }) => {
      const rawRounds = conditionRounds[characterId]?.trim() ?? ''
      const durationRounds =
        operation === 'add' && rawRounds ? Number(rawRounds) : null
      if (
        durationRounds !== null &&
        (!Number.isSafeInteger(durationRounds) ||
          durationRounds < 1 ||
          durationRounds > 999)
      )
        throw new Error('Duration must be 1–999 rounds, or blank.')
      return applyCharacterCondition({
        characterId,
        condition,
        durationRounds,
        operation,
        sessionId,
        source: conditionSources[characterId] ?? '',
      })
    },
    onMutate: () => setFeedback(''),
    onSuccess: async (_, variables) => {
      setFeedback('Condition and session history updated.')
      await refresh(variables.characterId)
    },
    onError: (error) =>
      setFeedback(
        error instanceof Error ? error.message : 'The condition change failed.',
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
                <span
                  className={`combat-state-badge ${character.combat_state}`}
                >
                  {character.combat_state}
                </span>
                <span>
                  Death saves: {character.death_save_successes} ✓ ·{' '}
                  {character.death_save_failures} ✕
                </span>
              </header>
              <div className="condition-instance-list">
                {character.conditions.map((condition) => {
                  const instance = conditionInstances.data?.find(
                    (item) =>
                      item.character_id === character.id &&
                      item.condition === condition,
                  )
                  return (
                    <span key={condition}>
                      <strong>{condition}</strong>
                      {instance?.source && ` · ${instance.source}`}
                      {instance?.remaining_rounds !== null &&
                        instance?.remaining_rounds !== undefined &&
                        ` · ${instance.remaining_rounds} rounds`}
                    </span>
                  )
                })}
                {character.conditions.length === 0 && (
                  <span>No active conditions</span>
                )}
              </div>
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
                  <input
                    maxLength={160}
                    placeholder="Condition source"
                    value={conditionSources[character.id] ?? ''}
                    onChange={(event) =>
                      setConditionSources((current) => ({
                        ...current,
                        [character.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    disabled={changeCondition.isPending}
                    onClick={() =>
                      changeCondition.mutate({
                        characterId: character.id,
                        condition: selected,
                        operation: character.conditions.includes(selected)
                          ? 'remove'
                          : 'add',
                      })
                    }
                  >
                    {character.conditions.includes(selected)
                      ? 'Remove condition'
                      : 'Add condition'}
                  </button>
                  <input
                    aria-label={`Condition duration in rounds for ${character.name}`}
                    min={1}
                    max={999}
                    type="number"
                    placeholder="Rounds"
                    value={conditionRounds[character.id] ?? ''}
                    onChange={(event) =>
                      setConditionRounds((current) => ({
                        ...current,
                        [character.id]: event.target.value,
                      }))
                    }
                  />
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
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          change.mutate({
                            characterId: character.id,
                            operation: 'concentration_check_pass',
                          })
                        }
                      >
                        Save passed
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          change.mutate({
                            characterId: character.id,
                            operation: 'concentration_check_fail',
                          })
                        }
                      >
                        Save failed
                      </button>
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
                    </>
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
                  <button
                    type="button"
                    onClick={() =>
                      change.mutate({
                        characterId: character.id,
                        operation: 'stabilize',
                      })
                    }
                  >
                    Stabilize
                  </button>
                  {isManager && character.combat_state !== 'dead' && (
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() =>
                        change.mutate({
                          characterId: character.id,
                          operation: 'mark_dead',
                        })
                      }
                    >
                      Mark dead
                    </button>
                  )}
                  {isManager && character.combat_state === 'dead' && (
                    <button
                      type="button"
                      onClick={() =>
                        change.mutate({
                          characterId: character.id,
                          operation: 'revive',
                        })
                      }
                    >
                      Revive
                    </button>
                  )}
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
