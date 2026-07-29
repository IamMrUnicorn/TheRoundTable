import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Plus, Search } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import type { Json } from '../../types/database'
import { addCustomCombatant } from '../combat/initiative'
import { monsterSpeed, type Open5eMonster, searchSrdMonsters } from './open5e'

export function MonsterLibraryPanel({
  actorId,
  campaignId,
  encounterActive,
  sessionId,
}: {
  actorId: string
  campaignId: number
  encounterActive: boolean
  sessionId: number
}) {
  const client = useQueryClient()
  const [draftSearch, setDraftSearch] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Open5eMonster | null>(null)
  const monsters = useQuery({
    queryKey: ['open5e-srd-monsters', search],
    queryFn: () => searchSrdMonsters(search),
    staleTime: 60 * 60 * 1000,
  })
  const add = useMutation({
    mutationFn: (monster: Open5eMonster) =>
      addCustomCombatant({
        actorId,
        armorClass: monster.armor_class,
        campaignId,
        hitPoints: monster.hit_points,
        initiative:
          Math.floor(Math.random() * 20) + 1 + monster.initiative_bonus,
        isHidden: false,
        kind: 'monster',
        name: monster.name,
        sessionId,
        sourceReference: `${monster.document.name} · Open5e:${monster.key}`,
        statBlock: JSON.parse(JSON.stringify(monster)) as Json,
      }),
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: ['session-initiative', sessionId],
      }),
  })

  return (
    <section className="monster-library-panel">
      <header>
        <div>
          <p className="eyebrow">Open rules compendium</p>
          <h3>SRD 5.1 monsters</h3>
        </div>
        <BookOpen />
      </header>
      <form
        className="monster-library-search"
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          setSearch(draftSearch)
        }}
      >
        <label className="play-field">
          Search by monster name
          <input
            placeholder="Goblin, dragon, wolf…"
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
          />
        </label>
        <button type="submit">
          <Search /> Search
        </button>
      </form>
      {monsters.isLoading && <p>Loading the SRD creature index…</p>}
      {monsters.error && <p className="form-error">{monsters.error.message}</p>}
      <div className="monster-library-results">
        {monsters.data?.results.map((monster) => (
          <article key={monster.key}>
            <button
              type="button"
              className="monster-result-summary"
              aria-expanded={selected?.key === monster.key}
              onClick={() =>
                setSelected((current) =>
                  current?.key === monster.key ? null : monster,
                )
              }
            >
              <span>
                <strong>{monster.name}</strong>
                <small>
                  {monster.size.name} {monster.type.name} · CR{' '}
                  {monster.challenge_rating}
                </small>
              </span>
              <span>
                AC {monster.armor_class} · HP {monster.hit_points}
              </span>
            </button>
            {selected?.key === monster.key && (
              <div className="monster-stat-block">
                <p>
                  <em>
                    {monster.size.name} {monster.type.name}, {monster.alignment}
                  </em>
                </p>
                <dl>
                  <div>
                    <dt>Armor Class</dt>
                    <dd>
                      {monster.armor_class}{' '}
                      {monster.armor_detail &&
                        `(${monster.armor_detail.toLowerCase()})`}
                    </dd>
                  </div>
                  <div>
                    <dt>Hit Points</dt>
                    <dd>
                      {monster.hit_points} ({monster.hit_dice})
                    </dd>
                  </div>
                  <div>
                    <dt>Speed</dt>
                    <dd>{monsterSpeed(monster)}</dd>
                  </div>
                </dl>
                <div className="monster-abilities">
                  {Object.entries(monster.ability_scores).map(
                    ([ability, score]) => (
                      <span key={ability}>
                        <strong>{ability.slice(0, 3).toUpperCase()}</strong>
                        {score}
                      </span>
                    ),
                  )}
                </div>
                {monster.traits.map((trait) => (
                  <p key={trait.name}>
                    <strong>{trait.name}.</strong> {trait.desc}
                  </p>
                ))}
                <h4>Actions</h4>
                {monster.actions
                  .filter((action) => action.action_type === 'ACTION')
                  .map((action) => (
                    <p key={`${action.name}-${action.desc}`}>
                      <strong>{action.name}.</strong> {action.desc}
                    </p>
                  ))}
                <button
                  type="button"
                  disabled={!encounterActive || add.isPending}
                  onClick={() => add.mutate(monster)}
                >
                  <Plus />
                  {encounterActive
                    ? `Add ${monster.name} to initiative`
                    : 'Start an encounter before adding'}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {monsters.data?.results.length === 0 && (
        <p className="muted-copy">No SRD monsters match that name.</p>
      )}
      {add.error && <p className="form-error">{add.error.message}</p>}
      <footer>
        This work includes material taken from the System Reference Document 5.1
        (“SRD 5.1”) by Wizards of the Coast LLC and available at{' '}
        <a
          href="https://dnd.wizards.com/resources/systems-reference-document"
          rel="noreferrer"
          target="_blank"
        >
          the official SRD page
        </a>
        . The SRD 5.1 is licensed under the{' '}
        <a
          href="https://creativecommons.org/licenses/by/4.0/legalcode"
          rel="noreferrer"
          target="_blank"
        >
          Creative Commons Attribution 4.0 International License
        </a>
        . Creature data is retrieved through Open5e.
      </footer>
    </section>
  )
}
