import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, HeartPulse, Skull } from 'lucide-react'
import { useState } from 'react'

import {
  getSessionInitiative,
  updateCustomCombatant,
  updateTurnResources,
} from './initiative'

export function MonsterCombatDrawer({ sessionId }: { sessionId: number }) {
  const client = useQueryClient()
  const key = ['session-initiative', sessionId]
  const initiative = useQuery({
    queryKey: key,
    queryFn: () => getSessionInitiative(sessionId),
    refetchInterval: 2_000,
  })
  const [amounts, setAmounts] = useState<Record<number, string>>({})
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
          </article>
        ))}
      </div>
      {(update.error || resource.error) && (
        <p className="form-error">
          {(update.error || resource.error)?.message}
        </p>
      )}
    </section>
  )
}
