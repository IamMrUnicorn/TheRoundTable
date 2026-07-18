import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Dices, Heart, Shield, Sparkles } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import {
  type Character,
  getCharacter,
  updateCharacter,
} from '../features/characters/characters'

const abilities = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const

const skills = [
  ['acrobatics', 'dexterity'],
  ['animal_handling', 'wisdom'],
  ['arcana', 'intelligence'],
  ['athletics', 'strength'],
  ['deception', 'charisma'],
  ['history', 'intelligence'],
  ['insight', 'wisdom'],
  ['intimidation', 'charisma'],
  ['investigation', 'intelligence'],
  ['medicine', 'wisdom'],
  ['nature', 'intelligence'],
  ['perception', 'wisdom'],
  ['performance', 'charisma'],
  ['persuasion', 'charisma'],
  ['religion', 'intelligence'],
  ['sleight_of_hand', 'dexterity'],
  ['stealth', 'dexterity'],
  ['survival', 'wisdom'],
] as const

type CharacterDraft = Pick<
  Character,
  | 'ancestry'
  | 'armor_class'
  | 'background'
  | 'charisma'
  | 'class_name'
  | 'constitution'
  | 'current_hp'
  | 'dexterity'
  | 'intelligence'
  | 'level'
  | 'max_hp'
  | 'name'
  | 'notes'
  | 'strength'
  | 'speed'
  | 'subclass'
  | 'wisdom'
  | 'saving_throw_proficiencies'
  | 'skill_proficiencies'
  | 'skill_expertise'
>

function editableFields(character: Character): CharacterDraft {
  const {
    ancestry,
    armor_class,
    background,
    charisma,
    class_name,
    constitution,
    current_hp,
    dexterity,
    intelligence,
    level,
    max_hp,
    name,
    notes,
    strength,
    speed,
    subclass,
    wisdom,
    saving_throw_proficiencies,
    skill_proficiencies,
    skill_expertise,
  } = character
  return {
    ancestry,
    armor_class,
    background,
    charisma,
    class_name,
    constitution,
    current_hp,
    dexterity,
    intelligence,
    level,
    max_hp,
    name,
    notes,
    strength,
    speed,
    subclass,
    wisdom,
    saving_throw_proficiencies,
    skill_proficiencies,
    skill_expertise,
  }
}

export function CharacterPage() {
  const { characterId: param } = useParams()
  const characterId = Number(param)
  const { identity } = useAuth()
  const queryClient = useQueryClient()
  const character = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => getCharacter(characterId),
    enabled: Number.isSafeInteger(characterId) && characterId > 0,
  })
  const [draft, setDraft] = useState<Partial<CharacterDraft>>({})
  useEffect(() => {
    if (character.data) setDraft(editableFields(character.data))
  }, [character.data])
  const canEdit = character.data?.owner_id === identity?.id
  const save = useMutation({
    mutationFn: () => updateCharacter(characterId, draft),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['character', characterId],
      })
      await queryClient.invalidateQueries({ queryKey: ['characters'] })
    },
  })
  if (!Number.isSafeInteger(characterId) || characterId < 1)
    return <Navigate to="/" replace />
  if (character.isError) return <Navigate to="/" replace />

  function field(name: keyof CharacterDraft, value: string | number) {
    setDraft((current) => ({ ...current, [name]: value }))
  }

  const modifier = (ability: (typeof abilities)[number]) =>
    Math.floor((Number(draft[ability] ?? 10) - 10) / 2)
  const proficiency = 2 + Math.floor((Number(draft.level ?? 1) - 1) / 4)
  const signed = (value: number) => `${value >= 0 ? '+' : ''}${value}`
  function toggleList(
    fieldName:
      'saving_throw_proficiencies' | 'skill_proficiencies' | 'skill_expertise',
    value: string,
  ) {
    const values = [...(draft[fieldName] ?? [])]
    const next = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value]
    setDraft((current) => ({
      ...current,
      [fieldName]: next,
      ...(fieldName === 'skill_proficiencies' && !next.includes(value)
        ? {
            skill_expertise: (current.skill_expertise ?? []).filter(
              (item) => item !== value,
            ),
          }
        : {}),
    }))
  }

  return (
    <main className="dashboard-page">
      <header className="app-header">
        <Link to="/" className="brand-mark">
          <Dices />
          <span>The Round Table</span>
        </Link>
        <Link className="text-link" to="/">
          <ArrowLeft size={17} /> Collection
        </Link>
      </header>
      <section className="character-sheet">
        {character.isLoading && (
          <p className="muted-copy">Opening character sheet…</p>
        )}
        {character.data && (
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              save.mutate()
            }}
          >
            <div className="sheet-heading">
              <div>
                <p className="eyebrow">Level {draft.level} character</p>
                <input
                  aria-label="Character name"
                  disabled={!canEdit}
                  value={String(draft.name ?? '')}
                  onChange={(e) => field('name', e.target.value)}
                />
                <p>
                  {[draft.ancestry, draft.class_name, draft.subclass]
                    .filter(Boolean)
                    .join(' · ') || 'An adventurer finding their path'}
                </p>
              </div>
              {canEdit && (
                <button disabled={save.isPending}>
                  {save.isPending ? 'Saving…' : 'Save sheet'}
                </button>
              )}
            </div>
            <div className="vitals-grid">
              <label>
                <Heart /> Hit points{' '}
                <span>
                  <input
                    disabled={!canEdit}
                    type="number"
                    min="0"
                    max={Number(draft.max_hp)}
                    value={Number(draft.current_hp ?? 0)}
                    onChange={(e) =>
                      field('current_hp', Number(e.target.value))
                    }
                  />{' '}
                  /{' '}
                  <input
                    disabled={!canEdit}
                    type="number"
                    min="1"
                    max="9999"
                    value={Number(draft.max_hp ?? 1)}
                    onChange={(e) => field('max_hp', Number(e.target.value))}
                  />
                </span>
              </label>
              <label>
                <Shield /> Armor class{' '}
                <input
                  disabled={!canEdit}
                  type="number"
                  min="0"
                  max="99"
                  value={Number(draft.armor_class ?? 10)}
                  onChange={(e) => field('armor_class', Number(e.target.value))}
                />
              </label>
              <label>
                <Sparkles /> Level{' '}
                <input
                  disabled={!canEdit}
                  type="number"
                  min="1"
                  max="20"
                  value={Number(draft.level ?? 1)}
                  onChange={(e) => field('level', Number(e.target.value))}
                />
              </label>
            </div>
            <div className="ability-grid">
              {abilities.map((ability) => (
                <label key={ability}>
                  {ability}
                  <input
                    disabled={!canEdit}
                    type="number"
                    min="1"
                    max="30"
                    value={Number(draft[ability] ?? 10)}
                    onChange={(e) => field(ability, Number(e.target.value))}
                  />
                  <strong>
                    {Math.floor((Number(draft[ability] ?? 10) - 10) / 2) >= 0
                      ? '+'
                      : ''}
                    {Math.floor((Number(draft[ability] ?? 10) - 10) / 2)}
                  </strong>
                </label>
              ))}
            </div>
            <div className="derived-grid">
              <div>
                <span>Proficiency</span>
                <strong>{signed(proficiency)}</strong>
              </div>
              <div>
                <span>Initiative</span>
                <strong>{signed(modifier('dexterity'))}</strong>
              </div>
              <label>
                <span>Speed</span>
                <input
                  disabled={!canEdit}
                  type="number"
                  min="0"
                  max="999"
                  value={Number(draft.speed ?? 30)}
                  onChange={(event) =>
                    field('speed', Number(event.target.value))
                  }
                />
              </label>
              <div>
                <span>Passive Perception</span>
                <strong>
                  {10 +
                    modifier('wisdom') +
                    ((draft.skill_proficiencies ?? []).includes('perception')
                      ? proficiency *
                        ((draft.skill_expertise ?? []).includes('perception')
                          ? 2
                          : 1)
                      : 0)}
                </strong>
              </div>
              <div>
                <span>Passive Investigation</span>
                <strong>
                  {10 +
                    modifier('intelligence') +
                    ((draft.skill_proficiencies ?? []).includes('investigation')
                      ? proficiency *
                        ((draft.skill_expertise ?? []).includes('investigation')
                          ? 2
                          : 1)
                      : 0)}
                </strong>
              </div>
              <div>
                <span>Passive Insight</span>
                <strong>
                  {10 +
                    modifier('wisdom') +
                    ((draft.skill_proficiencies ?? []).includes('insight')
                      ? proficiency *
                        ((draft.skill_expertise ?? []).includes('insight')
                          ? 2
                          : 1)
                      : 0)}
                </strong>
              </div>
            </div>
            <section className="proficiency-section">
              <h2>Saving throws</h2>
              <div className="save-grid">
                {abilities.map((ability) => {
                  const proficient = (
                    draft.saving_throw_proficiencies ?? []
                  ).includes(ability)
                  return (
                    <label key={ability}>
                      <input
                        disabled={!canEdit}
                        type="checkbox"
                        checked={proficient}
                        onChange={() =>
                          toggleList('saving_throw_proficiencies', ability)
                        }
                      />
                      <span>{ability}</span>
                      <strong>
                        {signed(
                          modifier(ability) + (proficient ? proficiency : 0),
                        )}
                      </strong>
                    </label>
                  )
                })}
              </div>
              <h2>Skills</h2>
              <div className="skill-grid">
                {skills.map(([skill, ability]) => {
                  const proficient = (draft.skill_proficiencies ?? []).includes(
                    skill,
                  )
                  const expert = (draft.skill_expertise ?? []).includes(skill)
                  return (
                    <div key={skill}>
                      <label>
                        <input
                          disabled={!canEdit}
                          type="checkbox"
                          checked={proficient}
                          onChange={() =>
                            toggleList('skill_proficiencies', skill)
                          }
                        />
                        <span>{skill.replaceAll('_', ' ')}</span>
                        <small>{ability.slice(0, 3)}</small>
                        <strong>
                          {signed(
                            modifier(ability) +
                              (proficient ? proficiency * (expert ? 2 : 1) : 0),
                          )}
                        </strong>
                      </label>
                      {proficient && (
                        <label className="expertise-toggle">
                          <input
                            disabled={!canEdit}
                            type="checkbox"
                            checked={expert}
                            onChange={() =>
                              toggleList('skill_expertise', skill)
                            }
                          />{' '}
                          expertise
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
            <div className="sheet-details">
              {(
                ['ancestry', 'class_name', 'subclass', 'background'] as const
              ).map((name) => (
                <label key={name}>
                  {name.replace('_', ' ')}
                  <input
                    disabled={!canEdit}
                    value={String(draft[name] ?? '')}
                    onChange={(e) => field(name, e.target.value)}
                  />
                </label>
              ))}
              <label className="notes-field">
                Notes
                <textarea
                  disabled={!canEdit}
                  rows={8}
                  value={String(draft.notes ?? '')}
                  onChange={(e) => field('notes', e.target.value)}
                />
              </label>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}
