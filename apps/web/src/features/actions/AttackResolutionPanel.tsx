import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Crosshair, Swords } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { getSessionInitiative } from '../combat/initiative'
import { criticalDamageFormula, type DiceMode, rollFormula } from '../dice/dice'
import { resolveSessionAttack } from './attack-resolution'

type AttackCharacter = { id: number; name: string; owner_id: string }

export function AttackResolutionPanel({
  actorId,
  characters,
  isManager,
  sessionId,
}: {
  actorId: string
  characters: AttackCharacter[]
  isManager: boolean
  sessionId: number
}) {
  const client = useQueryClient()
  const initiative = useQuery({
    queryKey: ['session-initiative', sessionId],
    queryFn: () => getSessionInitiative(sessionId),
    refetchInterval: 5_000,
  })
  const availableCharacters = isManager
    ? characters
    : characters.filter((character) => character.owner_id === actorId)
  const targets =
    initiative.data?.entries.filter(
      (entry) =>
        entry.character_id === null &&
        entry.armor_class !== null &&
        entry.current_hp !== null,
    ) ?? []
  const [attackerId, setAttackerId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [attackName, setAttackName] = useState('Weapon attack')
  const [attackBonus, setAttackBonus] = useState('5')
  const [damageFormula, setDamageFormula] = useState('1d8 + 3')
  const [mode, setMode] = useState<DiceMode>('normal')
  const [summary, setSummary] = useState('')
  const resolve = useMutation({
    mutationFn: async () => {
      const attackRoll = rollFormula('1d20', mode)
      const naturalRoll =
        attackRoll.terms[0].type === 'dice' ? attackRoll.terms[0].rolls[0] : 0
      const bonus = Number(attackBonus)
      if (!Number.isSafeInteger(bonus) || bonus < -100 || bonus > 100)
        throw new Error('Attack bonus must be a whole number from -100 to 100.')
      const target = targets.find((entry) => entry.id === Number(targetId))
      if (!target || target.armor_class === null)
        throw new Error('Choose an available encounter target.')
      const attackTotal = naturalRoll + bonus
      const critical = naturalRoll === 20
      const hit =
        critical || (naturalRoll !== 1 && attackTotal >= target.armor_class)
      const damage = hit
        ? rollFormula(
            critical ? criticalDamageFormula(damageFormula) : damageFormula,
          ).total
        : 0
      if (damage < 0)
        throw new Error('Damage formulas cannot produce a negative total.')
      return resolveSessionAttack({
        attackName,
        attackTotal,
        attackerCharacterId: Number(attackerId),
        damage,
        naturalRoll,
        sessionId,
        targetEntryId: Number(targetId),
      })
    },
    onMutate: () => setSummary(''),
    onSuccess: async (result) => {
      setSummary(
        result.hit
          ? `${result.critical ? 'Critical hit! ' : 'Hit. '}${result.damage} damage to ${result.target_name}; ${result.target_hp}/${result.target_max_hp} HP${result.defeated ? ' — defeated' : ''}.`
          : `Missed ${result.target_name}.`,
      )
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['session-initiative', sessionId],
        }),
        client.invalidateQueries({ queryKey: ['session-events', sessionId] }),
      ])
    },
  })

  return (
    <section className="attack-resolution-panel">
      <header>
        <div>
          <p className="eyebrow">Resolved action</p>
          <h3>Attack a combatant</h3>
        </div>
        <Crosshair aria-hidden="true" />
      </header>
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          resolve.mutate()
        }}
      >
        <select
          required
          value={attackerId}
          onChange={(event) => setAttackerId(event.target.value)}
        >
          <option value="">Attacking character</option>
          {availableCharacters.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>
        <select
          required
          value={targetId}
          onChange={(event) => setTargetId(event.target.value)}
        >
          <option value="">Encounter target</option>
          {targets.map((target) => (
            <option key={target.id} value={target.id}>
              {target.combatant_name} · AC {target.armor_class} ·{' '}
              {target.current_hp}/{target.max_hp} HP
            </option>
          ))}
        </select>
        <input
          required
          maxLength={160}
          value={attackName}
          onChange={(event) => setAttackName(event.target.value)}
        />
        <input
          required
          aria-label="Attack bonus"
          min={-100}
          max={100}
          type="number"
          value={attackBonus}
          onChange={(event) => setAttackBonus(event.target.value)}
        />
        <input
          required
          aria-label="Damage formula"
          maxLength={120}
          value={damageFormula}
          onChange={(event) => setDamageFormula(event.target.value)}
        />
        <select
          value={mode}
          onChange={(event) => setMode(event.target.value as DiceMode)}
        >
          <option value="normal">Normal</option>
          <option value="advantage">Advantage</option>
          <option value="disadvantage">Disadvantage</option>
        </select>
        <button
          disabled={
            resolve.isPending || !attackerId || !targetId || !attackName.trim()
          }
        >
          <Swords /> {resolve.isPending ? 'Resolving…' : 'Roll attack'}
        </button>
      </form>
      {targets.length === 0 && (
        <p className="muted-copy">
          Start an encounter and add a visible monster, NPC, or custom combatant
          before resolving attacks.
        </p>
      )}
      {summary && (
        <p className="attack-result" role="status">
          {summary}
        </p>
      )}
      {resolve.error && <p className="form-error">{resolve.error.message}</p>}
      <p className="muted-copy">
        Natural 20s double damage dice, natural 1s always miss, and every
        outcome updates encounter HP and the immutable session log together.
      </p>
    </section>
  )
}
