import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Shield, Swords } from 'lucide-react'
import { useEffect } from 'react'

import { supabase } from '../../lib/supabase'
import { abilityModifier } from '../dice/dice'
import { getSessionInitiative } from './initiative'

type TurnCharacter = {
  dexterity: number
  id: number
  name: string
}

export function TurnOrderStrip({
  characters,
  sessionId,
}: {
  characters: TurnCharacter[]
  sessionId: number
}) {
  const client = useQueryClient()
  const key = ['session-initiative', sessionId]
  const initiative = useQuery({
    queryKey: key,
    queryFn: () => getSessionInitiative(sessionId),
    refetchInterval: 5_000,
  })

  useEffect(() => {
    const refresh = () =>
      void client.invalidateQueries({
        queryKey: ['session-initiative', sessionId],
      })
    const channel = supabase
      .channel(`turn-strip:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `session_id=eq.${sessionId}`,
          schema: 'public',
          table: 'session_encounters',
        },
        refresh,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `session_id=eq.${sessionId}`,
          schema: 'public',
          table: 'session_initiative_entries',
        },
        refresh,
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [client, sessionId])

  const encounter = initiative.data?.encounter
  const inCombat = encounter?.status === 'active'
  const order = inCombat
    ? (initiative.data?.entries ?? []).map((entry) => {
        const character = characters.find(
          (candidate) => candidate.id === entry.character_id,
        )
        return {
          active: entry.id === encounter.active_entry_id,
          id: `entry-${entry.id}`,
          label:
            character?.name ||
            entry.combatant_name ||
            (entry.is_hidden ? 'Hidden turn' : 'Unknown'),
          score: entry.initiative,
          subtitle: entry.character_id ? 'initiative' : entry.combatant_kind,
        }
      })
    : [...characters]
        .sort(
          (left, right) =>
            right.dexterity - left.dexterity ||
            left.name.localeCompare(right.name),
        )
        .map((character) => ({
          active: false,
          id: `character-${character.id}`,
          label: character.name,
          score: character.dexterity,
          subtitle: `DEX ${character.dexterity} (${abilityModifier(character.dexterity) >= 0 ? '+' : ''}${abilityModifier(character.dexterity)})`,
        }))

  return (
    <section className="turn-order-strip" aria-label="Turn order">
      <div className="turn-order-label">
        {inCombat ? (
          <Swords aria-hidden="true" />
        ) : (
          <Shield aria-hidden="true" />
        )}
        <span>
          <small>
            {inCombat ? `Round ${encounter.round_number}` : 'Party order'}
          </small>
          <strong>{inCombat ? encounter.name : 'Ranked by Dexterity'}</strong>
        </span>
      </div>
      <ol>
        {order.map((participant, index) => (
          <li
            className={participant.active ? 'active' : ''}
            key={participant.id}
          >
            <span>{index + 1}</span>
            <b>{participant.label}</b>
            <small>
              {participant.subtitle} · {participant.score}
            </small>
          </li>
        ))}
        {order.length === 0 && (
          <li className="empty-turn-order">No campaign characters yet</li>
        )}
      </ol>
    </section>
  )
}
