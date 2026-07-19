import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, RotateCcw, Swords } from 'lucide-react'
import { useState } from 'react'

import {
  clearInitiative,
  getSessionInitiative,
  setCharacterInitiative,
  setEncounterTurn,
  updateTurnResources,
} from './initiative'

type InitiativeCharacter = {
  dexterity: number
  id: number
  name: string
  owner_id: string
  speed: number
}

export function InitiativePanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
}: {
  actorId: string
  campaignId: number
  characters: InitiativeCharacter[]
  isManager: boolean
  sessionId: number
}) {
  const client = useQueryClient()
  const key = ['session-initiative', sessionId]
  const initiative = useQuery({
    queryKey: key,
    queryFn: () => getSessionInitiative(sessionId),
    refetchInterval: 3_000,
  })
  const [manual, setManual] = useState<Record<number, string>>({})
  const refresh = () => client.invalidateQueries({ queryKey: key })
  const roll = useMutation({
    mutationFn: ({
      character,
      value,
    }: {
      character: InitiativeCharacter
      value?: number
    }) =>
      setCharacterInitiative({
        campaignId,
        characterId: character.id,
        initiative:
          value ??
          Math.floor(Math.random() * 20) +
            1 +
            Math.floor((character.dexterity - 10) / 2),
        sessionId,
        userId: actorId,
      }),
    onSuccess: refresh,
  })
  const turn = useMutation({
    mutationFn: async () => {
      const entries = initiative.data?.entries ?? []
      if (!entries.length) return
      const currentIndex = entries.findIndex(
        (entry) =>
          entry.character_id ===
          initiative.data?.encounter?.active_character_id,
      )
      const nextIndex =
        currentIndex < 0 ? 0 : (currentIndex + 1) % entries.length
      const wrapped = currentIndex >= 0 && nextIndex === 0
      await setEncounterTurn({
        activeCharacterId: entries[nextIndex].character_id,
        campaignId,
        roundNumber:
          (initiative.data?.encounter?.round_number ?? 1) + (wrapped ? 1 : 0),
        sessionId,
      })
    },
    onSuccess: refresh,
  })
  const reset = useMutation({
    mutationFn: () => clearInitiative(sessionId),
    onSuccess: refresh,
  })
  const resources = useMutation({
    mutationFn: ({
      entryId,
      updates,
    }: {
      entryId: number
      updates: Parameters<typeof updateTurnResources>[1]
    }) => updateTurnResources(entryId, updates),
    onSuccess: refresh,
  })
  const entries = initiative.data?.entries ?? []

  return (
    <section className="initiative-panel">
      <header>
        <div>
          <p className="eyebrow">Turn order</p>
          <h3>
            Initiative · Round {initiative.data?.encounter?.round_number ?? 1}
          </h3>
        </div>
        {isManager && (
          <div className="heading-actions">
            <button
              className="secondary-button"
              disabled={!entries.length || turn.isPending}
              onClick={() => turn.mutate()}
            >
              <ChevronRight /> Next turn
            </button>
            <button
              className="secondary-button"
              disabled={!entries.length || reset.isPending}
              onClick={() => reset.mutate()}
            >
              <RotateCcw /> Clear
            </button>
          </div>
        )}
      </header>
      <div className="initiative-entry-list">
        {entries.map((entry, index) => {
          const character = characters.find(
            (item) => item.id === entry.character_id,
          )
          const active =
            initiative.data?.encounter?.active_character_id ===
            entry.character_id
          const canControl = isManager || character?.owner_id === actorId
          return (
            <article className={active ? 'active-turn' : ''} key={entry.id}>
              <strong className="initiative-position">{index + 1}</strong>
              <span className="initiative-name">
                <b>{character?.name ?? 'Unknown character'}</b>
                {active && <small>Active turn</small>}
              </span>
              <em className="initiative-score">{entry.initiative}</em>
              <div className="turn-resource-controls">
                {(
                  [
                    'action_used',
                    'bonus_action_used',
                    'reaction_used',
                    'object_interaction_used',
                  ] as const
                ).map((resource) => {
                  const label = resource.replace('_used', '').replace('_', ' ')
                  const unavailable = !active && resource !== 'reaction_used'
                  return (
                    <button
                      type="button"
                      key={resource}
                      className={entry[resource] ? 'spent' : ''}
                      disabled={
                        !canControl || unavailable || resources.isPending
                      }
                      onClick={() =>
                        resources.mutate({
                          entryId: entry.id,
                          updates: { [resource]: !entry[resource] },
                        })
                      }
                    >
                      {label}: {entry[resource] ? 'used' : 'ready'}
                    </button>
                  )
                })}
                <label>
                  Movement
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    disabled={!canControl || !active || resources.isPending}
                    value={entry.movement_used}
                    onChange={(event) =>
                      resources.mutate({
                        entryId: entry.id,
                        updates: { movement_used: Number(event.target.value) },
                      })
                    }
                  />
                  <span>/ {character?.speed ?? 30} ft</span>
                </label>
              </div>
            </article>
          )
        })}
      </div>
      <div className="initiative-roll-list">
        {characters
          .filter((character) => isManager || character.owner_id === actorId)
          .map((character) => (
            <div key={character.id}>
              <span>
                <Swords /> {character.name}
              </span>
              <input
                aria-label={`Manual initiative for ${character.name}`}
                type="number"
                min={-100}
                max={200}
                placeholder="Manual"
                value={manual[character.id] ?? ''}
                onChange={(event) =>
                  setManual({ ...manual, [character.id]: event.target.value })
                }
              />
              <button
                disabled={roll.isPending}
                onClick={() => {
                  const value = manual[character.id]
                  roll.mutate({
                    character,
                    value:
                      value === '' || value === undefined
                        ? undefined
                        : Number(value),
                  })
                }}
              >
                Roll / set
              </button>
            </div>
          ))}
      </div>
    </section>
  )
}
