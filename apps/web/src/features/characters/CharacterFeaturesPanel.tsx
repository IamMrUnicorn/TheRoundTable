import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import {
  createCharacterFeature,
  deleteCharacterFeature,
  listCharacterFeatures,
  updateCharacterFeature,
} from './character-features'

const featureKinds = [
  ['class_feature', 'Class feature'],
  ['subclass_feature', 'Subclass feature'],
  ['ancestry_feature', 'Ancestry feature'],
  ['background_feature', 'Background feature'],
  ['feat', 'Feat'],
  ['passive', 'Passive'],
  ['resource', 'Resource'],
  ['other', 'Other'],
] as const

type FeatureKind = (typeof featureKinds)[number][0]

export function CharacterFeaturesPanel({
  canEdit,
  characterId,
}: {
  canEdit: boolean
  characterId: number
}) {
  const queryClient = useQueryClient()
  const features = useQuery({
    queryKey: ['character-features', characterId],
    queryFn: () => listCharacterFeatures(characterId),
  })
  const [kind, setKind] = useState<FeatureKind>('class_feature')
  const [name, setName] = useState('')
  const [source, setSource] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [recovery, setRecovery] = useState('')

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['character-features', characterId],
    })
  const create = useMutation({
    mutationFn: () => {
      const uses = maxUses === '' ? null : Number(maxUses)
      return createCharacterFeature({
        character_id: characterId,
        kind,
        name: name.trim(),
        source: source.trim(),
        description: description.trim(),
        level_acquired: level === '' ? null : Number(level),
        max_uses: uses,
        uses_remaining: uses,
        recovery: uses === null || recovery === '' ? null : recovery,
      })
    },
    onSuccess: async () => {
      setName('')
      setSource('')
      setDescription('')
      setLevel('')
      setMaxUses('')
      setRecovery('')
      await refresh()
    },
  })
  const update = useMutation({
    mutationFn: ({ id, uses }: { id: number; uses: number }) =>
      updateCharacterFeature(id, { uses_remaining: uses }),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: deleteCharacterFeature,
    onSuccess: refresh,
  })

  return (
    <section className="character-features-panel">
      <div>
        <p className="eyebrow">Adaptive character tools</p>
        <h2>Abilities & features</h2>
        <p className="muted-copy">
          Class, subclass, ancestry, background, feat, passive, and limited-use
          abilities live here. Spellcasting will join this view when applicable.
        </p>
      </div>

      {canEdit && (
        <form
          className="feature-create-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            create.mutate()
          }}
        >
          <label>
            Type
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as FeatureKind)}
            >
              {featureKinds.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Source
            <input
              maxLength={120}
              placeholder="Fighter 2, Human, background…"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </label>
          <label>
            Level acquired
            <input
              type="number"
              min="1"
              max="20"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            />
          </label>
          <label>
            Maximum uses
            <input
              type="number"
              min="1"
              max="999"
              placeholder="Unlimited"
              value={maxUses}
              onChange={(event) => setMaxUses(event.target.value)}
            />
          </label>
          <label>
            Recovers
            <select
              disabled={maxUses === ''}
              value={recovery}
              onChange={(event) => setRecovery(event.target.value)}
            >
              <option value="">Not specified</option>
              <option value="short_rest">Short rest</option>
              <option value="long_rest">Long rest</option>
              <option value="dawn">At dawn</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="feature-description-field">
            Description
            <textarea
              rows={4}
              maxLength={10000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <button disabled={create.isPending || name.trim() === ''}>
            {create.isPending ? 'Adding…' : 'Add ability'}
          </button>
          {create.isError && (
            <p className="form-error" role="alert">
              This ability could not be added. Check its values and try again.
            </p>
          )}
        </form>
      )}

      {features.isLoading && <p className="muted-copy">Loading abilities…</p>}
      {features.isError && (
        <p className="form-error" role="alert">
          The character's abilities could not be loaded.
        </p>
      )}
      {features.data?.length === 0 && (
        <p className="empty-feature-copy">
          No abilities or feats have been recorded yet.
        </p>
      )}
      <div className="character-feature-grid">
        {features.data?.map((feature) => (
          <article
            key={feature.id}
            className={!feature.is_active ? 'inactive' : ''}
          >
            <header>
              <div>
                <span>{feature.kind.replaceAll('_', ' ')}</span>
                <h3>{feature.name}</h3>
              </div>
              {canEdit && (
                <button
                  type="button"
                  className="danger-button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(feature.id)}
                >
                  Remove
                </button>
              )}
            </header>
            {(feature.source || feature.level_acquired) && (
              <p className="feature-source">
                {[
                  feature.source,
                  feature.level_acquired && `Level ${feature.level_acquired}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
            {feature.description && <p>{feature.description}</p>}
            {feature.max_uses !== null && feature.uses_remaining !== null && (
              <div className="feature-resource">
                <strong>
                  {feature.uses_remaining} / {feature.max_uses} uses
                </strong>
                {feature.recovery && (
                  <span>Recovers: {feature.recovery.replaceAll('_', ' ')}</span>
                )}
                {canEdit && (
                  <div>
                    <button
                      type="button"
                      disabled={feature.uses_remaining <= 0 || update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: feature.id,
                          uses: feature.uses_remaining! - 1,
                        })
                      }
                    >
                      Use
                    </button>
                    <button
                      type="button"
                      disabled={
                        feature.uses_remaining >= feature.max_uses ||
                        update.isPending
                      }
                      onClick={() =>
                        update.mutate({
                          id: feature.id,
                          uses: feature.uses_remaining! + 1,
                        })
                      }
                    >
                      Restore
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
