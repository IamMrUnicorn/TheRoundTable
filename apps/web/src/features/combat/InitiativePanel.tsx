import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Flag,
  Plus,
  Swords,
  Trash2,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'
import {
  addCustomCombatant,
  endEncounter,
  getSessionInitiative,
  removeInitiativeEntry,
  setCharacterInitiative,
  setEncounterTurn,
  startEncounter,
  updateCustomCombatant,
  updateTurnResources,
} from './initiative'

type InitiativeCharacter = {
  dexterity: number
  id: number
  name: string
  owner_id: string
  speed: number
}

const blankCombatant = {
  armorClass: '12',
  hitPoints: '10',
  initiative: '10',
  isHidden: false,
  kind: 'monster' as 'custom' | 'monster' | 'npc',
  name: '',
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
    refetchInterval: 5_000,
  })
  const [encounterName, setEncounterName] = useState('New encounter')
  const [manual, setManual] = useState<Record<number, string>>({})
  const [combatant, setCombatant] = useState(blankCombatant)
  const refresh = () => client.invalidateQueries({ queryKey: key })

  useEffect(() => {
    const refreshInitiative = () =>
      void client.invalidateQueries({
        queryKey: ['session-initiative', sessionId],
      })
    const channel = supabase
      .channel(`session-initiative:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `session_id=eq.${sessionId}`,
          schema: 'public',
          table: 'session_encounters',
        },
        refreshInitiative,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `session_id=eq.${sessionId}`,
          schema: 'public',
          table: 'session_initiative_entries',
        },
        refreshInitiative,
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [client, sessionId])

  const begin = useMutation({
    mutationFn: async () => {
      await startEncounter({
        actorId,
        campaignId,
        name: encounterName,
        sessionId,
      })
      await Promise.all(
        characters.map((character) =>
          setCharacterInitiative({
            campaignId,
            characterId: character.id,
            initiative:
              Math.floor(Math.random() * 20) +
              1 +
              Math.floor((character.dexterity - 10) / 2),
            sessionId,
            userId: actorId,
          }),
        ),
      )
    },
    onSuccess: refresh,
  })
  const finish = useMutation({
    mutationFn: () =>
      endEncounter({
        actorId,
        campaignId,
        name: initiative.data?.encounter?.name ?? 'Encounter',
        roundNumber: initiative.data?.encounter?.round_number ?? 1,
        sessionId,
      }),
    onSuccess: async () => {
      await Promise.all([
        refresh(),
        client.invalidateQueries({ queryKey: ['session-events', sessionId] }),
      ])
    },
  })
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
  const add = useMutation({
    mutationFn: () =>
      addCustomCombatant({
        actorId,
        armorClass: Number(combatant.armorClass),
        campaignId,
        hitPoints: Number(combatant.hitPoints),
        initiative: Number(combatant.initiative),
        isHidden: combatant.isHidden,
        kind: combatant.kind,
        name: combatant.name,
        sessionId,
      }),
    onSuccess: async () => {
      setCombatant(blankCombatant)
      await refresh()
    },
  })
  const turn = useMutation({
    mutationFn: ({
      entryId,
      roundNumber,
    }: {
      entryId: number
      roundNumber: number
    }) => {
      const entry = initiative.data?.entries.find((item) => item.id === entryId)
      if (!entry) throw new Error('That combatant is no longer in initiative.')
      return setEncounterTurn({
        activeCharacterId: entry.character_id,
        activeEntryId: entry.id,
        campaignId,
        roundNumber,
        sessionId,
      })
    },
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
  const updateCustom = useMutation({
    mutationFn: ({
      entryId,
      updates,
    }: {
      entryId: number
      updates: Parameters<typeof updateCustomCombatant>[1]
    }) => updateCustomCombatant(entryId, updates),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: removeInitiativeEntry,
    onSuccess: refresh,
  })
  const entries = initiative.data?.entries ?? []
  const encounter = initiative.data?.encounter
  const activeIndex = entries.findIndex(
    (entry) => entry.id === encounter?.active_entry_id,
  )
  const nextIndex =
    entries.length === 0
      ? -1
      : activeIndex < 0
        ? 0
        : (activeIndex + 1) % entries.length
  const previousIndex =
    entries.length === 0
      ? -1
      : activeIndex < 0
        ? entries.length - 1
        : (activeIndex - 1 + entries.length) % entries.length
  const advance = (direction: 'next' | 'previous') => {
    const index = direction === 'next' ? nextIndex : previousIndex
    if (index < 0) return
    const wrappedForward =
      direction === 'next' && activeIndex >= 0 && index === 0
    const wrappedBackward =
      direction === 'previous' &&
      activeIndex === 0 &&
      index === entries.length - 1
    turn.mutate({
      entryId: entries[index].id,
      roundNumber: Math.max(
        1,
        (encounter?.round_number ?? 1) +
          (wrappedForward ? 1 : wrappedBackward ? -1 : 0),
      ),
    })
  }

  if (!encounter || encounter.status === 'ended')
    return (
      <section className="initiative-panel encounter-launcher">
        <div>
          <p className="eyebrow">Encounter manager</p>
          <h3>
            {encounter ? `${encounter.name} ended` : 'No active encounter'}
          </h3>
          <p className="muted-copy">
            {encounter
              ? `Completed after ${encounter.round_number} round${encounter.round_number === 1 ? '' : 's'}. The final order remains in the session record until a new encounter begins.`
              : 'Start an encounter before collecting initiative.'}
            {!encounter &&
              ' Starting an encounter automatically rolls the current party; every value can still be overridden.'}
          </p>
        </div>
        {isManager ? (
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              begin.mutate()
            }}
          >
            <label className="play-field">
              Encounter name
              <input
                required
                maxLength={120}
                value={encounterName}
                onChange={(event) => setEncounterName(event.target.value)}
              />
            </label>
            <button disabled={begin.isPending || !encounterName.trim()}>
              <Swords /> {begin.isPending ? 'Starting…' : 'Start encounter'}
            </button>
          </form>
        ) : (
          <p className="muted-copy">
            The Game Master controls encounter setup.
          </p>
        )}
        {begin.error && <p className="form-error">{begin.error.message}</p>}
      </section>
    )

  return (
    <section className="initiative-panel">
      <header>
        <div>
          <p className="eyebrow">Active encounter</p>
          <h3>
            {encounter.name} · Round {encounter.round_number}
          </h3>
          {nextIndex >= 0 && (
            <small className="next-turn-preview">
              Next:{' '}
              {entries[nextIndex].combatant_name ||
                characters.find(
                  (character) =>
                    character.id === entries[nextIndex].character_id,
                )?.name ||
                'Unknown'}
            </small>
          )}
        </div>
        {isManager && (
          <div className="heading-actions">
            <button
              className="secondary-button"
              disabled={!entries.length || turn.isPending}
              onClick={() => advance('previous')}
            >
              <ChevronLeft /> Previous
            </button>
            <button
              className="secondary-button"
              disabled={!entries.length || turn.isPending}
              onClick={() => advance('next')}
            >
              <ChevronRight /> Next
            </button>
            <button
              className="danger-button"
              disabled={finish.isPending}
              onClick={() => {
                if (window.confirm(`End ${encounter.name}?`)) finish.mutate()
              }}
            >
              <Flag /> End
            </button>
          </div>
        )}
      </header>
      {!isManager &&
        encounter.active_entry_id !== null &&
        activeIndex === -1 && (
          <p className="hidden-turn-notice">
            The Game Master is resolving a hidden combatant’s turn.
          </p>
        )}
      <div className="initiative-entry-list">
        {entries.length === 0 && (
          <p className="muted-copy">
            Add party characters or custom combatants to establish turn order.
          </p>
        )}
        {entries.map((entry, index) => {
          const character = characters.find(
            (item) => item.id === entry.character_id,
          )
          const name = character?.name ?? entry.combatant_name
          const active = encounter.active_entry_id === entry.id
          const canControl = isManager || character?.owner_id === actorId
          return (
            <article className={active ? 'active-turn' : ''} key={entry.id}>
              <button
                className="initiative-position"
                disabled={!isManager || turn.isPending}
                onClick={() =>
                  turn.mutate({
                    entryId: entry.id,
                    roundNumber: encounter.round_number,
                  })
                }
                title={isManager ? 'Jump to this turn' : undefined}
              >
                {index + 1}
              </button>
              <span className="initiative-name">
                <b>{name || 'Unknown combatant'}</b>
                <small>
                  {active ? 'Active turn · ' : ''}
                  {entry.combatant_kind}
                  {entry.is_hidden ? ' · GM hidden' : ''}
                </small>
              </span>
              <em className="initiative-score">{entry.initiative}</em>
              {entry.character_id === null && (
                <div className="custom-combatant-vitals">
                  <span>AC {entry.armor_class ?? '—'}</span>
                  <label>
                    HP
                    <input
                      disabled={!isManager || updateCustom.isPending}
                      min={0}
                      max={entry.max_hp ?? 999999}
                      type="number"
                      value={entry.current_hp ?? 0}
                      onChange={(event) =>
                        updateCustom.mutate({
                          entryId: entry.id,
                          updates: { current_hp: Number(event.target.value) },
                        })
                      }
                    />
                    / {entry.max_hp}
                  </label>
                  {isManager && (
                    <>
                      <button
                        className="icon-button"
                        onClick={() =>
                          updateCustom.mutate({
                            entryId: entry.id,
                            updates: { is_hidden: !entry.is_hidden },
                          })
                        }
                        title={
                          entry.is_hidden
                            ? 'Reveal to party'
                            : 'Hide from party'
                        }
                      >
                        {entry.is_hidden ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                      <button
                        className="icon-button danger-button"
                        onClick={() => remove.mutate(entry.id)}
                        title="Remove combatant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              )}
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
              <label className="play-field">
                Initiative result
                <input
                  type="number"
                  min={-100}
                  max={200}
                  placeholder="Auto roll"
                  value={manual[character.id] ?? ''}
                  onChange={(event) =>
                    setManual({ ...manual, [character.id]: event.target.value })
                  }
                />
              </label>
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
      {isManager && (
        <form
          className="custom-combatant-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            add.mutate()
          }}
        >
          <div>
            <p className="eyebrow">GM combatant</p>
            <h4>Add monster, NPC, or custom turn</h4>
          </div>
          <label className="play-field">
            Combatant type
            <select
              value={combatant.kind}
              onChange={(event) =>
                setCombatant({
                  ...combatant,
                  kind: event.target.value as typeof combatant.kind,
                })
              }
            >
              <option value="monster">Monster</option>
              <option value="npc">NPC</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="play-field">
            Combatant name
            <input
              required
              maxLength={120}
              placeholder="Drowned sentinel"
              value={combatant.name}
              onChange={(event) =>
                setCombatant({ ...combatant, name: event.target.value })
              }
            />
          </label>
          <label className="play-field">
            Initiative result
            <input
              required
              min={-100}
              max={200}
              type="number"
              value={combatant.initiative}
              onChange={(event) =>
                setCombatant({ ...combatant, initiative: event.target.value })
              }
            />
          </label>
          <label className="play-field">
            Armor class
            <input
              required
              min={0}
              max={99}
              type="number"
              value={combatant.armorClass}
              onChange={(event) =>
                setCombatant({ ...combatant, armorClass: event.target.value })
              }
            />
          </label>
          <label className="play-field">
            Maximum hit points
            <input
              required
              min={1}
              max={999999}
              type="number"
              value={combatant.hitPoints}
              onChange={(event) =>
                setCombatant({ ...combatant, hitPoints: event.target.value })
              }
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={combatant.isHidden}
              onChange={(event) =>
                setCombatant({ ...combatant, isHidden: event.target.checked })
              }
            />
            Hidden from players
          </label>
          <button disabled={add.isPending || !combatant.name.trim()}>
            <Plus /> {add.isPending ? 'Adding…' : 'Add combatant'}
          </button>
        </form>
      )}
      {(initiative.error ||
        roll.error ||
        add.error ||
        turn.error ||
        finish.error ||
        updateCustom.error ||
        resources.error ||
        remove.error) && (
        <p className="form-error">
          {
            (
              initiative.error ??
              roll.error ??
              add.error ??
              turn.error ??
              finish.error ??
              updateCustom.error ??
              resources.error ??
              remove.error
            )?.message
          }
        </p>
      )}
    </section>
  )
}
