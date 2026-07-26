import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Dices, Footprints, Swords } from 'lucide-react'

import { getSessionInitiative, updateTurnResources } from './initiative'

type ActionBarCharacter = {
  id: number
  name: string
  owner_id: string
  speed: number
}

export function TurnActionBar({
  actorId,
  characters,
  isManager,
  onOpenTool,
  sessionId,
}: {
  actorId: string
  characters: ActionBarCharacter[]
  isManager: boolean
  onOpenTool: (tool: 'actions' | 'combat' | 'log') => void
  sessionId: number
}) {
  const client = useQueryClient()
  const key = ['session-initiative', sessionId]
  const initiative = useQuery({
    queryKey: key,
    queryFn: () => getSessionInitiative(sessionId),
    refetchInterval: 5_000,
  })
  const encounter = initiative.data?.encounter
  const activeEntry = initiative.data?.entries.find(
    (entry) => entry.id === encounter?.active_entry_id,
  )
  const character = characters.find(
    (candidate) => candidate.id === activeEntry?.character_id,
  )
  const canControl =
    Boolean(activeEntry) &&
    (isManager || (character !== undefined && character.owner_id === actorId))
  const update = useMutation({
    mutationFn: (updates: Parameters<typeof updateTurnResources>[1]) => {
      if (!activeEntry) throw new Error('There is no active turn.')
      return updateTurnResources(activeEntry.id, updates)
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  })

  if (!encounter || encounter.status !== 'active' || !activeEntry)
    return (
      <nav className="turn-action-bar idle" aria-label="Session shortcuts">
        <span>
          <strong>Exploration mode</strong>
          <small>Start an encounter when structured turns are needed.</small>
        </span>
        <button type="button" onClick={() => onOpenTool('actions')}>
          <Dices /> Actions & dice
        </button>
        <button type="button" onClick={() => onOpenTool('combat')}>
          <Swords /> Start encounter
        </button>
        <button type="button" onClick={() => onOpenTool('log')}>
          <BookOpen /> Session log
        </button>
      </nav>
    )

  const resources = [
    ['action_used', 'Action'],
    ['bonus_action_used', 'Bonus action'],
    ['reaction_used', 'Reaction'],
    ['object_interaction_used', 'Interact'],
  ] as const

  return (
    <section className="turn-action-bar" aria-label="Active turn actions">
      <span className="active-turn-summary">
        <small>Round {encounter.round_number} · active turn</small>
        <strong>{character?.name || activeEntry.combatant_name}</strong>
      </span>
      <div className="turn-resource-buttons">
        {resources.map(([field, label]) => (
          <button
            type="button"
            key={field}
            className={activeEntry[field] ? 'spent' : ''}
            disabled={!canControl || update.isPending}
            onClick={() => update.mutate({ [field]: !activeEntry[field] })}
          >
            {label}
            <small>{activeEntry[field] ? 'spent' : 'ready'}</small>
          </button>
        ))}
      </div>
      <label className="compact-movement-control">
        <Footprints aria-hidden="true" />
        <span>
          Movement
          <small>
            {activeEntry.movement_used}/{character?.speed ?? 30} ft
          </small>
        </span>
        <input
          aria-label="Movement used"
          type="number"
          min={0}
          max={character?.speed ?? 30}
          disabled={!canControl || update.isPending}
          value={activeEntry.movement_used}
          onChange={(event) =>
            update.mutate({ movement_used: Number(event.target.value) })
          }
        />
      </label>
      <button type="button" onClick={() => onOpenTool('actions')}>
        <Swords /> Choose action
      </button>
    </section>
  )
}
