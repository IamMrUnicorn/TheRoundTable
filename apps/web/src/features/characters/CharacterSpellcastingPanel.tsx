import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import {
  createCharacterSpell,
  createSpellcastingProfile,
  deleteCharacterSpell,
  listSpellcastingProfiles,
  saveSpellSlot,
  updateCharacterSpell,
} from './spellcasting'

export function CharacterSpellcastingPanel({
  canEdit,
  characterId,
}: {
  canEdit: boolean
  characterId: number
}) {
  const client = useQueryClient()
  const queryKey = ['character-spellcasting', characterId]
  const profiles = useQuery({
    queryKey,
    queryFn: () => listSpellcastingProfiles(characterId),
  })
  const [profileName, setProfileName] = useState('')
  const [ability, setAbility] = useState('intelligence')
  const [spellName, setSpellName] = useState('')
  const [spellLevel, setSpellLevel] = useState('0')
  const [selectedProfile, setSelectedProfile] = useState('')
  const refresh = () => client.invalidateQueries({ queryKey })
  const createProfile = useMutation({
    mutationFn: () =>
      createSpellcastingProfile({
        character_id: characterId,
        name: profileName.trim(),
        spellcasting_ability: ability,
      }),
    onSuccess: async (profile) => {
      setProfileName('')
      setSelectedProfile(String(profile.id))
      await refresh()
    },
  })
  const createSpell = useMutation({
    mutationFn: () =>
      createCharacterSpell({
        profile_id: Number(selectedProfile),
        name: spellName.trim(),
        spell_level: Number(spellLevel),
      }),
    onSuccess: async () => {
      setSpellName('')
      await refresh()
    },
  })
  const mutateSpell = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number
      updates: Record<string, boolean>
    }) => updateCharacterSpell(id, updates),
    onSuccess: refresh,
  })
  const removeSpell = useMutation({
    mutationFn: deleteCharacterSpell,
    onSuccess: refresh,
  })
  const slot = useMutation({ mutationFn: saveSpellSlot, onSuccess: refresh })

  return (
    <section className="spellcasting-panel">
      <div>
        <p className="eyebrow">When applicable</p>
        <h2>Spellcasting</h2>
      </div>
      {profiles.data?.length === 0 && !canEdit && (
        <p className="muted-copy">
          This character has no spellcasting profile.
        </p>
      )}
      {canEdit && (
        <form
          className="spell-profile-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            createProfile.mutate()
          }}
        >
          <input
            required
            maxLength={120}
            placeholder="Spellcasting source (Wizard, Cleric…)"
            value={profileName}
            onChange={(event) => setProfileName(event.target.value)}
          />
          <select
            value={ability}
            onChange={(event) => setAbility(event.target.value)}
          >
            <option value="intelligence">Intelligence</option>
            <option value="wisdom">Wisdom</option>
            <option value="charisma">Charisma</option>
          </select>
          <button disabled={createProfile.isPending}>Add spellcasting</button>
        </form>
      )}
      {profiles.data?.map((profile) => (
        <article className="spell-profile" key={profile.id}>
          <header>
            <div>
              <h3>{profile.name}</h3>
              <span>
                {profile.spellcasting_ability} · {profile.preparation_mode}
              </span>
            </div>
            <div>
              <strong>Save DC {profile.spell_save_dc ?? '—'}</strong>
              <strong>
                Attack{' '}
                {profile.spell_attack_bonus === null
                  ? '—'
                  : `${profile.spell_attack_bonus >= 0 ? '+' : ''}${profile.spell_attack_bonus}`}
              </strong>
            </div>
          </header>
          <div className="spell-slot-grid">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((level) => {
              const current = profile.character_spell_slots.find(
                (item) => item.spell_level === level,
              )
              if (!canEdit && !current) return null
              return (
                <label key={level}>
                  Level {level}
                  <span>
                    <input
                      disabled={!canEdit}
                      type="number"
                      min="0"
                      max="99"
                      value={current?.remaining ?? 0}
                      onChange={(event) =>
                        slot.mutate({
                          profile_id: profile.id,
                          spell_level: level,
                          remaining: Math.min(
                            Number(event.target.value),
                            current?.maximum ?? Number(event.target.value),
                          ),
                          maximum:
                            current?.maximum ?? Number(event.target.value),
                        })
                      }
                    />{' '}
                    /{' '}
                    <input
                      disabled={!canEdit}
                      type="number"
                      min="0"
                      max="99"
                      value={current?.maximum ?? 0}
                      onChange={(event) =>
                        slot.mutate({
                          profile_id: profile.id,
                          spell_level: level,
                          maximum: Number(event.target.value),
                          remaining: Math.min(
                            current?.remaining ?? Number(event.target.value),
                            Number(event.target.value),
                          ),
                        })
                      }
                    />
                  </span>
                </label>
              )
            })}
          </div>
          {canEdit && (
            <form
              className="spell-create-form"
              onSubmit={(event: FormEvent) => {
                event.preventDefault()
                createSpell.mutate()
              }}
            >
              <input
                required
                placeholder="Spell name"
                value={selectedProfile === String(profile.id) ? spellName : ''}
                onFocus={() => setSelectedProfile(String(profile.id))}
                onChange={(event) => {
                  setSelectedProfile(String(profile.id))
                  setSpellName(event.target.value)
                }}
              />
              <select
                value={
                  selectedProfile === String(profile.id) ? spellLevel : '0'
                }
                onChange={(event) => {
                  setSelectedProfile(String(profile.id))
                  setSpellLevel(event.target.value)
                }}
              >
                <option value="0">Cantrip</option>
                {Array.from({ length: 9 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Level {index + 1}
                  </option>
                ))}
              </select>
              <button
                disabled={
                  createSpell.isPending ||
                  selectedProfile !== String(profile.id)
                }
              >
                Add spell
              </button>
            </form>
          )}
          <div className="spell-level-groups">
            {Array.from({ length: 10 }, (_, level) => level).map((level) => {
              const spells = profile.character_spells.filter(
                (spell) => spell.spell_level === level,
              )
              if (!spells.length) return null
              return (
                <section key={level}>
                  <h4>{level === 0 ? 'Cantrips' : `Level ${level}`}</h4>
                  {spells.map((spell) => (
                    <div className="spell-row" key={spell.id}>
                      <div>
                        <strong>
                          {spell.is_favorite ? '★ ' : ''}
                          {spell.name}
                        </strong>
                        <small>
                          {[
                            spell.school,
                            spell.is_ritual && 'ritual',
                            spell.requires_concentration && 'concentration',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </small>
                      </div>
                      {canEdit && (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              mutateSpell.mutate({
                                id: spell.id,
                                updates: { is_prepared: !spell.is_prepared },
                              })
                            }
                          >
                            {spell.is_prepared ? 'Prepared' : 'Prepare'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              mutateSpell.mutate({
                                id: spell.id,
                                updates: { is_favorite: !spell.is_favorite },
                              })
                            }
                          >
                            ★
                          </button>
                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => removeSpell.mutate(spell.id)}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )
            })}
          </div>
        </article>
      ))}
    </section>
  )
}
