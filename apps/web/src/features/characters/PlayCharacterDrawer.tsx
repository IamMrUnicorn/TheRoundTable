import { ExternalLink, Heart, Shield, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { Character } from './characters'
import { CharacterFeaturesPanel } from './CharacterFeaturesPanel'
import { CharacterInventoryPanel } from './CharacterInventoryPanel'
import { CharacterSpellcastingPanel } from './CharacterSpellcastingPanel'
import {
  abilityModifier,
  abilityNames,
  proficiencyBonus,
  skillAbilities,
} from '../dice/dice'

type DrawerTab = 'quick' | 'inventory' | 'features' | 'spells'

const label = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const signed = (value: number) => `${value >= 0 ? '+' : ''}${value}`

export function PlayCharacterDrawer({
  actorId,
  character,
  onClose,
}: {
  actorId: string
  character: Character
  onClose: () => void
}) {
  const [tab, setTab] = useState<DrawerTab>('quick')
  const canEdit = character.owner_id === actorId
  const proficiency = proficiencyBonus(character.level)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('drawer-open')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('drawer-open')
    }
  }, [onClose])

  return (
    <div
      className="character-drawer-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside
        className="play-character-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="play-character-drawer-title"
      >
        <header className="character-drawer-header">
          <div className="member-avatar">
            {character.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="eyebrow">
              {canEdit ? 'Your character' : 'Party member'}
            </p>
            <h2 id="play-character-drawer-title">{character.name}</h2>
            <span>
              Level {character.level} {character.ancestry}{' '}
              {character.class_name}
              {character.subclass && ` · ${character.subclass}`}
            </span>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close character sheet"
            onClick={onClose}
          >
            <X />
          </button>
        </header>

        <nav
          className="character-drawer-tabs"
          aria-label="Character sheet sections"
        >
          {(
            [
              ['quick', 'Quick view'],
              ['inventory', 'Inventory'],
              ['features', 'Features'],
              ['spells', 'Spells'],
            ] as const
          ).map(([value, text]) => (
            <button
              type="button"
              key={value}
              className={tab === value ? 'active' : ''}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
            >
              {text}
            </button>
          ))}
        </nav>

        <div className="character-drawer-content">
          {tab === 'quick' && (
            <div className="drawer-quick-view">
              <div className="drawer-vitals">
                <article>
                  <Heart />
                  <span>
                    <small>Hit points</small>
                    <strong>
                      {character.current_hp}/{character.max_hp}
                    </strong>
                    {character.temporary_hp > 0 && (
                      <em>+{character.temporary_hp} temporary</em>
                    )}
                  </span>
                </article>
                <article>
                  <Shield />
                  <span>
                    <small>Armor class</small>
                    <strong>{character.armor_class}</strong>
                    <em>{character.speed} ft speed</em>
                  </span>
                </article>
                <article>
                  <Sparkles />
                  <span>
                    <small>Proficiency</small>
                    <strong>{signed(proficiency)}</strong>
                    <em>Level {character.level}</em>
                  </span>
                </article>
              </div>

              <section>
                <h3>Abilities</h3>
                <div className="drawer-ability-grid">
                  {abilityNames.map((ability) => (
                    <article key={ability}>
                      <small>{ability.slice(0, 3)}</small>
                      <strong>{character[ability]}</strong>
                      <span>{signed(abilityModifier(character[ability]))}</span>
                    </article>
                  ))}
                </div>
              </section>

              <div className="drawer-rules-grid">
                <section>
                  <h3>Saving throws</h3>
                  {abilityNames.map((ability) => {
                    const proficient =
                      character.saving_throw_proficiencies.includes(ability)
                    const modifier =
                      abilityModifier(character[ability]) +
                      (proficient ? proficiency : 0)
                    return (
                      <p key={ability}>
                        <span>{label(ability)}</span>
                        <strong>{signed(modifier)}</strong>
                        {proficient && <small>proficient</small>}
                      </p>
                    )
                  })}
                </section>
                <section>
                  <h3>Skills</h3>
                  {Object.entries(skillAbilities).map(([skill, ability]) => {
                    const expert = character.skill_expertise.includes(skill)
                    const proficient =
                      expert || character.skill_proficiencies.includes(skill)
                    const modifier =
                      abilityModifier(character[ability]) +
                      (expert ? proficiency * 2 : proficient ? proficiency : 0)
                    return (
                      <p key={skill}>
                        <span>{label(skill)}</span>
                        <strong>{signed(modifier)}</strong>
                        {(expert || proficient) && (
                          <small>{expert ? 'expertise' : 'proficient'}</small>
                        )}
                      </p>
                    )
                  })}
                </section>
              </div>

              <section className="drawer-status-section">
                <h3>Status & senses</h3>
                <div>
                  <span>{character.combat_state}</span>
                  {character.conditions.map((condition) => (
                    <span key={condition}>{condition}</span>
                  ))}
                  {character.concentration && (
                    <span>Concentrating: {character.concentration}</span>
                  )}
                  {character.exhaustion > 0 && (
                    <span>Exhaustion {character.exhaustion}</span>
                  )}
                  {character.inspiration && <span>Inspired</span>}
                </div>
                <p>
                  Passive Perception{' '}
                  <strong>
                    {10 +
                      abilityModifier(character.wisdom) +
                      (character.skill_expertise.includes('perception')
                        ? proficiency * 2
                        : character.skill_proficiencies.includes('perception')
                          ? proficiency
                          : 0)}
                  </strong>
                  {character.senses.length > 0 &&
                    ` · ${character.senses.join(', ')}`}
                </p>
              </section>

              <section className="drawer-proficiencies">
                <h3>Languages</h3>
                <p>
                  {character.languages.length > 0
                    ? character.languages.join(' · ')
                    : 'No languages recorded'}
                </p>
              </section>
            </div>
          )}
          {tab === 'inventory' && (
            <CharacterInventoryPanel
              canEdit={canEdit}
              characterId={character.id}
            />
          )}
          {tab === 'features' && (
            <CharacterFeaturesPanel
              canEdit={canEdit}
              characterId={character.id}
            />
          )}
          {tab === 'spells' && (
            <CharacterSpellcastingPanel
              canEdit={canEdit}
              characterId={character.id}
            />
          )}
        </div>

        <footer className="character-drawer-footer">
          <span>
            {canEdit
              ? 'Changes here use your normal character permissions.'
              : 'Read-only party view'}
          </span>
          <Link to={`/characters/${character.id}`}>
            Open full sheet <ExternalLink />
          </Link>
        </footer>
      </aside>
    </div>
  )
}
