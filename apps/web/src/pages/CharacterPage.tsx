import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Dices, Heart, Shield, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import { CharacterFeaturesPanel } from '../features/characters/CharacterFeaturesPanel'
import { CharacterSpellcastingPanel } from '../features/characters/CharacterSpellcastingPanel'
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

const conditions = [
  'blinded',
  'charmed',
  'deafened',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
] as const

type CharacterDraft = Pick<
  Character,
  | 'age'
  | 'alignment'
  | 'allies_organizations'
  | 'ancestry'
  | 'appearance'
  | 'armor_class'
  | 'background'
  | 'biography'
  | 'bonds'
  | 'charisma'
  | 'class_name'
  | 'constitution'
  | 'conditions'
  | 'current_hp'
  | 'death_save_failures'
  | 'death_save_successes'
  | 'dexterity'
  | 'exhaustion'
  | 'eyes'
  | 'flaws'
  | 'hair'
  | 'height'
  | 'hit_dice_remaining'
  | 'hit_dice_total'
  | 'hit_die_size'
  | 'ideals'
  | 'inspiration'
  | 'intelligence'
  | 'languages'
  | 'level'
  | 'max_hp'
  | 'name'
  | 'notes'
  | 'personality_traits'
  | 'pronouns'
  | 'senses'
  | 'size'
  | 'skin'
  | 'strength'
  | 'speed'
  | 'subclass'
  | 'wisdom'
  | 'saving_throw_proficiencies'
  | 'skill_proficiencies'
  | 'skill_expertise'
  | 'temporary_hp'
  | 'weight_lbs'
>

function editableFields(character: Character): CharacterDraft {
  const {
    age,
    alignment,
    allies_organizations,
    ancestry,
    appearance,
    armor_class,
    background,
    biography,
    bonds,
    charisma,
    class_name,
    constitution,
    conditions,
    current_hp,
    death_save_failures,
    death_save_successes,
    dexterity,
    exhaustion,
    eyes,
    flaws,
    hair,
    height,
    hit_dice_remaining,
    hit_dice_total,
    hit_die_size,
    ideals,
    inspiration,
    intelligence,
    languages,
    level,
    max_hp,
    name,
    notes,
    personality_traits,
    pronouns,
    senses,
    size,
    skin,
    strength,
    speed,
    subclass,
    wisdom,
    saving_throw_proficiencies,
    skill_proficiencies,
    skill_expertise,
    temporary_hp,
    weight_lbs,
  } = character
  return {
    age,
    alignment,
    allies_organizations,
    ancestry,
    appearance,
    armor_class,
    background,
    biography,
    bonds,
    charisma,
    class_name,
    constitution,
    conditions,
    current_hp,
    death_save_failures,
    death_save_successes,
    dexterity,
    exhaustion,
    eyes,
    flaws,
    hair,
    height,
    hit_dice_remaining,
    hit_dice_total,
    hit_die_size,
    ideals,
    inspiration,
    intelligence,
    languages,
    level,
    max_hp,
    name,
    notes,
    personality_traits,
    pronouns,
    senses,
    size,
    skin,
    strength,
    speed,
    subclass,
    wisdom,
    saving_throw_proficiencies,
    skill_proficiencies,
    skill_expertise,
    temporary_hp,
    weight_lbs,
  }
}

type SheetTab = 'quick' | 'details' | 'abilities' | 'memory'

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
  const [activeTab, setActiveTab] = useState<SheetTab>('quick')
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

  function field(
    name: keyof CharacterDraft,
    value: string | number | boolean | null,
  ) {
    setDraft((current) => ({ ...current, [name]: value }))
  }

  const modifier = (ability: (typeof abilities)[number]) =>
    Math.floor((Number(draft[ability] ?? 10) - 10) / 2)
  const proficiency = 2 + Math.floor((Number(draft.level ?? 1) - 1) / 4)
  const signed = (value: number) => `${value >= 0 ? '+' : ''}${value}`
  const sizeMultiplier =
    draft.size === 'tiny'
      ? 0.5
      : draft.size === 'large'
        ? 2
        : draft.size === 'huge'
          ? 4
          : draft.size === 'gargantuan'
            ? 8
            : 1
  const carryingCapacity = Number(draft.strength ?? 10) * 15 * sizeMultiplier
  function textList(fieldName: 'languages' | 'senses', value: string) {
    setDraft((current) => ({
      ...current,
      [fieldName]: value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    }))
  }
  function toggleList(
    fieldName:
      | 'saving_throw_proficiencies'
      | 'skill_proficiencies'
      | 'skill_expertise'
      | 'conditions',
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
          <div className="character-sheet-editor">
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
                <button
                  type="button"
                  disabled={save.isPending}
                  onClick={() => save.mutate()}
                >
                  {save.isPending ? 'Saving…' : 'Save sheet'}
                </button>
              )}
            </div>
            <nav
              className="character-tabs"
              aria-label="Character sheet sections"
            >
              {(
                [
                  ['quick', 'Quick view'],
                  ['details', 'Extra details'],
                  ['abilities', 'Abilities & spells'],
                  ['memory', 'Memory'],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  className={activeTab === tab ? 'active' : ''}
                  aria-pressed={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {label}
                </button>
              ))}
            </nav>
            {activeTab === 'quick' && (
              <div className="character-tab-panel quick-view-panel">
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
                        onChange={(e) =>
                          field('max_hp', Number(e.target.value))
                        }
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
                      onChange={(e) =>
                        field('armor_class', Number(e.target.value))
                      }
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
                  <label>
                    Temporary HP
                    <input
                      disabled={!canEdit}
                      type="number"
                      min="0"
                      max="9999"
                      value={Number(draft.temporary_hp ?? 0)}
                      onChange={(event) =>
                        field('temporary_hp', Number(event.target.value))
                      }
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
                        {Math.floor((Number(draft[ability] ?? 10) - 10) / 2) >=
                        0
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
                        ((draft.skill_proficiencies ?? []).includes(
                          'perception',
                        )
                          ? proficiency *
                            ((draft.skill_expertise ?? []).includes(
                              'perception',
                            )
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
                        ((draft.skill_proficiencies ?? []).includes(
                          'investigation',
                        )
                          ? proficiency *
                            ((draft.skill_expertise ?? []).includes(
                              'investigation',
                            )
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
                              modifier(ability) +
                                (proficient ? proficiency : 0),
                            )}
                          </strong>
                        </label>
                      )
                    })}
                  </div>
                  <h2>Skills</h2>
                  <div className="skill-grid">
                    {skills.map(([skill, ability]) => {
                      const proficient = (
                        draft.skill_proficiencies ?? []
                      ).includes(skill)
                      const expert = (draft.skill_expertise ?? []).includes(
                        skill,
                      )
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
                                  (proficient
                                    ? proficiency * (expert ? 2 : 1)
                                    : 0),
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
                <section className="survival-section">
                  <div className="survival-heading">
                    <div>
                      <p className="eyebrow">Rest and recovery</p>
                      <h2>Survivability</h2>
                    </div>
                    <label className="inspiration-toggle">
                      <input
                        disabled={!canEdit}
                        type="checkbox"
                        checked={Boolean(draft.inspiration)}
                        onChange={(event) =>
                          field('inspiration', event.target.checked)
                        }
                      />
                      Inspiration
                    </label>
                  </div>
                  <div className="survival-grid">
                    <fieldset>
                      <legend>Hit dice</legend>
                      <label>
                        Remaining
                        <input
                          disabled={!canEdit}
                          type="number"
                          min="0"
                          max={Number(draft.hit_dice_total ?? 1)}
                          value={Number(draft.hit_dice_remaining ?? 1)}
                          onChange={(event) =>
                            field(
                              'hit_dice_remaining',
                              Number(event.target.value),
                            )
                          }
                        />
                      </label>
                      <span>/</span>
                      <label>
                        Total
                        <input
                          disabled={!canEdit}
                          type="number"
                          min="1"
                          max="20"
                          value={Number(draft.hit_dice_total ?? 1)}
                          onChange={(event) =>
                            field('hit_dice_total', Number(event.target.value))
                          }
                        />
                      </label>
                      <label>
                        Die
                        <select
                          disabled={!canEdit}
                          value={Number(draft.hit_die_size ?? 8)}
                          onChange={(event) =>
                            field('hit_die_size', Number(event.target.value))
                          }
                        >
                          {[4, 6, 8, 10, 12].map((size) => (
                            <option key={size} value={size}>
                              d{size}
                            </option>
                          ))}
                        </select>
                      </label>
                    </fieldset>
                    <fieldset>
                      <legend>Death saves</legend>
                      <label>
                        Successes
                        <input
                          disabled={!canEdit}
                          type="number"
                          min="0"
                          max="3"
                          value={Number(draft.death_save_successes ?? 0)}
                          onChange={(event) =>
                            field(
                              'death_save_successes',
                              Number(event.target.value),
                            )
                          }
                        />
                      </label>
                      <label>
                        Failures
                        <input
                          disabled={!canEdit}
                          type="number"
                          min="0"
                          max="3"
                          value={Number(draft.death_save_failures ?? 0)}
                          onChange={(event) =>
                            field(
                              'death_save_failures',
                              Number(event.target.value),
                            )
                          }
                        />
                      </label>
                    </fieldset>
                    <label className="exhaustion-control">
                      Exhaustion level
                      <input
                        disabled={!canEdit}
                        type="range"
                        min="0"
                        max="6"
                        value={Number(draft.exhaustion ?? 0)}
                        onChange={(event) =>
                          field('exhaustion', Number(event.target.value))
                        }
                      />
                      <strong>{Number(draft.exhaustion ?? 0)} / 6</strong>
                    </label>
                  </div>
                  <fieldset className="condition-picker">
                    <legend>Conditions</legend>
                    {conditions.map((condition) => (
                      <label key={condition}>
                        <input
                          disabled={!canEdit}
                          type="checkbox"
                          checked={(draft.conditions ?? []).includes(condition)}
                          onChange={() => toggleList('conditions', condition)}
                        />
                        {condition}
                      </label>
                    ))}
                    {(draft.conditions ?? []).length === 0 && (
                      <span className="muted-copy">No active conditions</span>
                    )}
                  </fieldset>
                </section>
              </div>
            )}
            {save.isError && (
              <p className="form-error" role="alert">
                The sheet could not be saved. Check that remaining hit dice do
                not exceed the total and try again.
              </p>
            )}
            {save.isSuccess && (
              <p className="success-copy" role="status">
                Character sheet saved.
              </p>
            )}
            {activeTab === 'details' && (
              <div className="character-tab-panel details-panel">
                <section>
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Identity and appearance</p>
                      <h2>Extra details</h2>
                    </div>
                  </div>
                  <div className="sheet-details detail-fields">
                    {(
                      [
                        'ancestry',
                        'class_name',
                        'subclass',
                        'background',
                        'pronouns',
                        'alignment',
                        'age',
                        'height',
                        'eyes',
                        'hair',
                        'skin',
                      ] as const
                    ).map((name) => (
                      <label key={name}>
                        {name.replace('_', ' ')}
                        <input
                          disabled={!canEdit}
                          value={String(draft[name] ?? '')}
                          onChange={(event) => field(name, event.target.value)}
                        />
                      </label>
                    ))}
                    <label>
                      Size
                      <select
                        disabled={!canEdit}
                        value={String(draft.size ?? 'medium')}
                        onChange={(event) => field('size', event.target.value)}
                      >
                        {[
                          'tiny',
                          'small',
                          'medium',
                          'large',
                          'huge',
                          'gargantuan',
                        ].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Weight (lb.)
                      <input
                        disabled={!canEdit}
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.weight_lbs ?? ''}
                        onChange={(event) =>
                          field(
                            'weight_lbs',
                            event.target.value === ''
                              ? null
                              : Number(event.target.value),
                          )
                        }
                      />
                    </label>
                    <label>
                      Languages (comma separated)
                      <input
                        disabled={!canEdit}
                        value={(draft.languages ?? []).join(', ')}
                        onChange={(event) =>
                          textList('languages', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Senses (comma separated)
                      <input
                        disabled={!canEdit}
                        value={(draft.senses ?? []).join(', ')}
                        onChange={(event) =>
                          textList('senses', event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <div className="capacity-summary">
                    <strong>Physical capability</strong>
                    <p>
                      As a {draft.size ?? 'medium'} creature with Strength{' '}
                      {draft.strength ?? 10}, {draft.name || 'this character'}{' '}
                      can carry {carryingCapacity} lb. and push, drag, or lift
                      up to {carryingCapacity * 2} lb. under the standard rules.
                    </p>
                    <small>
                      Optional encumbrance and traits such as Powerful Build
                      will be applied when campaign rules and character features
                      are connected.
                    </small>
                  </div>
                </section>
                <section className="narrative-grid">
                  {(
                    [
                      ['appearance', 'Appearance', 5],
                      ['biography', 'Biography and backstory', 8],
                      ['personality_traits', 'Personality traits', 4],
                      ['ideals', 'Ideals', 4],
                      ['bonds', 'Bonds', 4],
                      ['flaws', 'Flaws', 4],
                      ['allies_organizations', 'Allies and organizations', 5],
                    ] as const
                  ).map(([name, label, rows]) => (
                    <label key={name}>
                      {label}
                      <textarea
                        disabled={!canEdit}
                        rows={rows}
                        value={String(draft[name] ?? '')}
                        onChange={(event) => field(name, event.target.value)}
                      />
                    </label>
                  ))}
                </section>
              </div>
            )}
            {activeTab === 'abilities' && (
              <div className="character-tab-panel">
                <CharacterFeaturesPanel
                  canEdit={Boolean(canEdit)}
                  characterId={characterId}
                />
                <CharacterSpellcastingPanel
                  canEdit={Boolean(canEdit)}
                  characterId={characterId}
                />
              </div>
            )}
            {activeTab === 'memory' && (
              <section className="character-tab-panel memory-panel">
                <p className="eyebrow">Character journal</p>
                <h2>Memory</h2>
                <label className="notes-field">
                  Player notes
                  <textarea
                    disabled={!canEdit}
                    rows={14}
                    value={String(draft.notes ?? '')}
                    onChange={(event) => field('notes', event.target.value)}
                  />
                </label>
                <p className="muted-copy">
                  Structured inventory history, discoveries, relationships, and
                  session memories will collect here as live-session events are
                  implemented.
                </p>
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
