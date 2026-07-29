import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, HeartPulse, Skull } from 'lucide-react'
import { useState } from 'react'

import { MonsterLibraryPanel } from '../compendium/MonsterLibraryPanel'
import type { Open5eAction, Open5eMonster } from '../compendium/open5e'
import { createSessionEvent } from '../sessions/session-events'
import {
  getSessionInitiative,
  updateCustomCombatant,
  updateTurnResources,
} from './initiative'
import {
  type MonsterAttackResolution,
  resolveMonsterAttack,
} from './monster-attacks'

export function MonsterCombatDrawer({
  actorId,
  campaignId,
  characters,
  sessionId,
}: {
  actorId: string
  campaignId: number
  characters: {
    armor_class: number
    current_hp: number
    id: number
    max_hp: number
    name: string
  }[]
  sessionId: number
}) {
  const client = useQueryClient()
  const key = ['session-initiative', sessionId]
  const initiative = useQuery({
    queryKey: key,
    queryFn: () => getSessionInitiative(sessionId),
    refetchInterval: 2_000,
  })
  const [amounts, setAmounts] = useState<Record<number, string>>({})
  const [attackTargets, setAttackTargets] = useState<Record<string, string>>({})
  const [rollModes, setRollModes] = useState<
    Record<string, 'advantage' | 'disadvantage' | 'normal'>
  >({})
  const [attackResult, setAttackResult] =
    useState<MonsterAttackResolution | null>(null)
  const refresh = () => client.invalidateQueries({ queryKey: key })
  const update = useMutation({
    mutationFn: ({
      entryId,
      updates,
    }: {
      entryId: number
      updates: Parameters<typeof updateCustomCombatant>[1]
    }) => updateCustomCombatant(entryId, updates),
    onSuccess: refresh,
  })
  const resource = useMutation({
    mutationFn: ({
      entryId,
      updates,
    }: {
      entryId: number
      updates: Parameters<typeof updateTurnResources>[1]
    }) => updateTurnResources(entryId, updates),
    onSuccess: refresh,
  })
  const useMonsterAction = useMutation({
    mutationFn: async ({
      action,
      entryId,
      monsterName,
      sourceReference,
    }: {
      action: Open5eAction
      entryId: number
      monsterName: string
      sourceReference: string
    }) => {
      await createSessionEvent({
        actor_id: actorId,
        campaign_id: campaignId,
        kind: 'action',
        metadata: {
          action_type: action.action_type,
          combatant_entry_id: entryId,
          monster_action: action.name,
          source_reference: sourceReference,
        },
        session_id: sessionId,
        title: `${monsterName} uses ${action.name}`,
        body: action.desc,
        visibility: 'party',
      })
      if (action.action_type === 'ACTION')
        await updateTurnResources(entryId, { action_used: true })
      if (action.action_type === 'REACTION')
        await updateTurnResources(entryId, { reaction_used: true })
    },
    onSuccess: async () => {
      await Promise.all([
        refresh(),
        client.invalidateQueries({ queryKey: ['session-events', sessionId] }),
      ])
    },
  })
  const monsterAttack = useMutation({
    mutationFn: ({
      action,
      entryId,
      key,
    }: {
      action: Open5eAction
      entryId: number
      key: string
    }) => {
      const targetCharacterId = Number(attackTargets[key])
      if (!Number.isSafeInteger(targetCharacterId))
        throw new Error('Choose a target character.')
      return resolveMonsterAttack({
        actionName: action.name,
        attackerEntryId: entryId,
        rollMode: rollModes[key] ?? 'normal',
        sessionId,
        targetCharacterId,
      })
    },
    onMutate: () => setAttackResult(null),
    onSuccess: async (result) => {
      setAttackResult(result)
      await Promise.all([
        refresh(),
        client.invalidateQueries({
          queryKey: ['campaign-characters', campaignId],
        }),
        client.invalidateQueries({ queryKey: ['session-events', sessionId] }),
      ])
    },
  })
  const combatants =
    initiative.data?.entries.filter(
      (entry) => entry.combatant_kind !== 'character',
    ) ?? []

  const changeHealth = (
    entry: (typeof combatants)[number],
    direction: -1 | 1,
  ) => {
    const amount = Number(amounts[entry.id] ?? '')
    if (!Number.isSafeInteger(amount) || amount < 1) return
    const current = entry.current_hp ?? 0
    const maximum = entry.max_hp ?? current
    update.mutate({
      entryId: entry.id,
      updates: {
        current_hp: Math.max(
          0,
          Math.min(maximum, current + amount * direction),
        ),
      },
    })
  }

  return (
    <section className="monster-combat-drawer">
      <header>
        <div>
          <p className="eyebrow">GM combat console</p>
          <h3>Monsters and NPCs</h3>
        </div>
        <span>{initiative.data?.encounter?.name || 'No active encounter'}</span>
      </header>
      {initiative.isLoading && <p>Loading combatants…</p>}
      {initiative.error && (
        <p className="form-error">{initiative.error.message}</p>
      )}
      {!initiative.isLoading && combatants.length === 0 && (
        <div className="monster-console-empty">
          <Skull />
          <strong>No monsters in initiative</strong>
          <p>
            Open the Combat workspace to start an encounter and add a monster,
            NPC, or custom combatant.
          </p>
        </div>
      )}
      <div className="monster-console-list">
        {combatants.map((entry) => (
          <article key={entry.id}>
            <header>
              <div>
                <span>{entry.combatant_kind}</span>
                <h4>{entry.combatant_name}</h4>
              </div>
              <button
                type="button"
                aria-label={
                  entry.is_hidden
                    ? `Reveal ${entry.combatant_name}`
                    : `Hide ${entry.combatant_name}`
                }
                onClick={() =>
                  update.mutate({
                    entryId: entry.id,
                    updates: { is_hidden: !entry.is_hidden },
                  })
                }
              >
                {entry.is_hidden ? <EyeOff /> : <Eye />}
              </button>
            </header>
            <dl>
              <div>
                <dt>Initiative</dt>
                <dd>{entry.initiative}</dd>
              </div>
              <div>
                <dt>Armor class</dt>
                <dd>{entry.armor_class ?? '—'}</dd>
              </div>
              <div>
                <dt>Hit points</dt>
                <dd>
                  {entry.current_hp ?? '—'} / {entry.max_hp ?? '—'}
                </dd>
              </div>
              <div>
                <dt>Movement</dt>
                <dd>{entry.movement_used} ft used</dd>
              </div>
            </dl>
            <div className="monster-health-controls">
              <label className="play-field">
                Hit-point amount
                <input
                  min={1}
                  type="number"
                  value={amounts[entry.id] ?? ''}
                  onChange={(event) =>
                    setAmounts((current) => ({
                      ...current,
                      [entry.id]: event.target.value,
                    }))
                  }
                />
              </label>
              <button type="button" onClick={() => changeHealth(entry, -1)}>
                Damage
              </button>
              <button type="button" onClick={() => changeHealth(entry, 1)}>
                <HeartPulse /> Heal
              </button>
            </div>
            <div className="monster-resource-controls">
              <button
                type="button"
                className={entry.action_used ? 'spent' : ''}
                onClick={() =>
                  resource.mutate({
                    entryId: entry.id,
                    updates: { action_used: !entry.action_used },
                  })
                }
              >
                Action {entry.action_used ? 'spent' : 'ready'}
              </button>
              <button
                type="button"
                className={entry.bonus_action_used ? 'spent' : ''}
                onClick={() =>
                  resource.mutate({
                    entryId: entry.id,
                    updates: { bonus_action_used: !entry.bonus_action_used },
                  })
                }
              >
                Bonus {entry.bonus_action_used ? 'spent' : 'ready'}
              </button>
              <button
                type="button"
                className={entry.reaction_used ? 'spent' : ''}
                onClick={() =>
                  resource.mutate({
                    entryId: entry.id,
                    updates: { reaction_used: !entry.reaction_used },
                  })
                }
              >
                Reaction {entry.reaction_used ? 'spent' : 'ready'}
              </button>
            </div>
            {entry.source_reference && (
              <small className="monster-source-reference">
                {entry.source_reference}
              </small>
            )}
            {Array.isArray(
              (entry.stat_block as unknown as Partial<Open5eMonster>).actions,
            ) && (
              <details className="monster-saved-actions">
                <summary>Stat-block actions</summary>
                {(
                  (entry.stat_block as unknown as Partial<Open5eMonster>)
                    .actions ?? []
                ).map((action) => (
                  <article key={`${action.action_type}-${action.name}`}>
                    <header>
                      <strong>{action.name}</strong>
                      <span>{action.action_type.replaceAll('_', ' ')}</span>
                    </header>
                    <p>{action.desc}</p>
                    {action.automation ? (
                      <div className="monster-attack-controls">
                        <span>
                          {action.automation.attack_bonus >= 0 ? '+' : ''}
                          {action.automation.attack_bonus} to hit ·{' '}
                          {action.automation.damage_dice_count}d
                          {action.automation.damage_die_size}
                          {action.automation.damage_bonus >= 0 ? '+' : ''}
                          {action.automation.damage_bonus}{' '}
                          {action.automation.damage_type}
                        </span>
                        <label className="play-field">
                          Target character
                          <select
                            value={
                              attackTargets[`${entry.id}:${action.name}`] ?? ''
                            }
                            onChange={(event) =>
                              setAttackTargets((current) => ({
                                ...current,
                                [`${entry.id}:${action.name}`]:
                                  event.target.value,
                              }))
                            }
                          >
                            <option value="">Choose target</option>
                            {characters.map((character) => (
                              <option key={character.id} value={character.id}>
                                {character.name} · AC {character.armor_class} ·{' '}
                                {character.current_hp}/{character.max_hp} HP
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="play-field">
                          Attack roll
                          <select
                            value={
                              rollModes[`${entry.id}:${action.name}`] ??
                              'normal'
                            }
                            onChange={(event) =>
                              setRollModes((current) => ({
                                ...current,
                                [`${entry.id}:${action.name}`]: event.target
                                  .value as
                                  'advantage' | 'disadvantage' | 'normal',
                              }))
                            }
                          >
                            <option value="normal">Normal</option>
                            <option value="advantage">Advantage</option>
                            <option value="disadvantage">Disadvantage</option>
                          </select>
                        </label>
                        <button
                          type="button"
                          disabled={
                            monsterAttack.isPending ||
                            (action.action_type === 'ACTION' &&
                              initiative.data?.encounter?.active_entry_id !==
                                entry.id)
                          }
                          onClick={() =>
                            monsterAttack.mutate({
                              action,
                              entryId: entry.id,
                              key: `${entry.id}:${action.name}`,
                            })
                          }
                        >
                          {action.action_type === 'ACTION' &&
                          initiative.data?.encounter?.active_entry_id !==
                            entry.id
                            ? 'Available on this combatant’s turn'
                            : 'Roll attack and damage'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={useMonsterAction.isPending}
                        onClick={() =>
                          useMonsterAction.mutate({
                            action,
                            entryId: entry.id,
                            monsterName: entry.combatant_name,
                            sourceReference: entry.source_reference,
                          })
                        }
                      >
                        Send action to the table
                      </button>
                    )}
                  </article>
                ))}
              </details>
            )}
          </article>
        ))}
      </div>
      {attackResult && (
        <p className="monster-attack-result">
          <strong>
            {attackResult.hit
              ? attackResult.critical
                ? 'Critical hit'
                : 'Hit'
              : 'Miss'}
          </strong>{' '}
          · attack {attackResult.attack_total}
          {attackResult.hit &&
            ` · ${attackResult.damage} ${attackResult.damage_type} damage · ${attackResult.target_name} ${attackResult.target_hp}/${attackResult.target_max_hp} HP`}
          {attackResult.concentration_check_dc &&
            ` · concentration save DC ${attackResult.concentration_check_dc}`}
        </p>
      )}
      {(update.error ||
        resource.error ||
        useMonsterAction.error ||
        monsterAttack.error) && (
        <p className="form-error">
          {
            (
              update.error ||
              resource.error ||
              useMonsterAction.error ||
              monsterAttack.error
            )?.message
          }
        </p>
      )}
      <MonsterLibraryPanel
        actorId={actorId}
        campaignId={campaignId}
        sessionId={sessionId}
      />
    </section>
  )
}
