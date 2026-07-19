import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, FilePenLine, WandSparkles } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { listCampaigns } from '../features/campaigns/campaigns'
import { createCharacter } from '../features/characters/characters'

export function CharacterCreatePage() {
  const [params] = useSearchParams()
  const mode = params.get('mode')
  const { identity } = useAuth()
  const navigate = useNavigate()
  const campaigns = useQuery({
    queryKey: ['campaigns', identity?.id],
    queryFn: () => listCampaigns(identity!.id),
    enabled: Boolean(identity),
  })
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    ancestry: '',
    className: '',
    campaignId: '',
    description: '',
    level: 1,
  })
  const create = useMutation({
    mutationFn: () =>
      createCharacter({
        ancestry: form.ancestry,
        appearance: form.description,
        campaignId: form.campaignId ? Number(form.campaignId) : null,
        className: form.className,
        level: form.level,
        name: form.name,
        ownerId: identity!.id,
      }),
    onSuccess: (character) => navigate(`/characters/${character.id}`),
  })
  if (!mode)
    return (
      <main className="dashboard-page creation-choice-page">
        <section>
          <p className="eyebrow">Create a character</p>
          <h1>How would you like to begin?</h1>
          <p>
            Both paths create the same complete character sheet. You can change
            anything later.
          </p>
          <div className="creation-choice-grid">
            <Link to="/characters/new?mode=manual">
              <FilePenLine />
              <h2>Create manually</h2>
              <p>
                Open a mostly blank sheet and add information in any order, with
                minimal validation.
              </p>
              <span>
                Start with a blank sheet <ArrowRight />
              </span>
            </Link>
            <Link to="/characters/new?mode=wizard">
              <WandSparkles />
              <h2>Use the guided wizard</h2>
              <p>
                Walk through identity, ancestry, class, level, and campaign
                assignment one step at a time.
              </p>
              <span>
                Start guided creation <ArrowRight />
              </span>
            </Link>
          </div>
        </section>
      </main>
    )
  if (mode !== 'manual' && mode !== 'wizard')
    return <Navigate to="/characters/new" replace />
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'wizard' && step < 3) setStep(step + 1)
    else create.mutate()
  }
  return (
    <main className="dashboard-page focused-create-page">
      <section>
        <Link className="text-link" to="/characters/new">
          ← Choose another method
        </Link>
        <div className="creation-heading">
          <div>
            <p className="eyebrow">
              {mode === 'wizard'
                ? `Guided creation · Step ${step} of 3`
                : 'Manual creation'}
            </p>
            <h1>
              {mode === 'wizard'
                ? [
                    'Who is your character?',
                    'Choose their path',
                    'Join a campaign',
                  ][step - 1]
                : 'Start a blank character sheet'}
            </h1>
          </div>
          <BookOpen />
        </div>
        {mode === 'wizard' && (
          <ol className="wizard-progress" aria-label="Character creation steps">
            {['Identity', 'Path', 'Campaign'].map((label, index) => (
              <li
                className={
                  index + 1 === step
                    ? 'current'
                    : index + 1 < step
                      ? 'complete'
                      : ''
                }
                key={label}
              >
                <span>{index + 1}</span> {label}
              </li>
            ))}
          </ol>
        )}
        <form className="focused-create-form" onSubmit={submit}>
          {(mode === 'manual' || step === 1) && (
            <>
              <label>
                Name
                <input
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Starting level
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: Number(e.target.value) })
                  }
                />
              </label>
              <label className="wide-field">
                Appearance or concept
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
            </>
          )}
          {(mode === 'manual' || step === 2) && (
            <>
              <label>
                Ancestry / species
                <input
                  required={mode === 'wizard'}
                  maxLength={80}
                  value={form.ancestry}
                  onChange={(e) =>
                    setForm({ ...form, ancestry: e.target.value })
                  }
                />
              </label>
              <label>
                Class
                <input
                  required={mode === 'wizard'}
                  maxLength={80}
                  value={form.className}
                  onChange={(e) =>
                    setForm({ ...form, className: e.target.value })
                  }
                />
              </label>
            </>
          )}
          {mode === 'wizard' && step === 3 && (
            <div className="wizard-summary wide-field">
              <p className="eyebrow">Character summary</p>
              <strong>{form.name}</strong>
              <span>
                Level {form.level} {form.ancestry} {form.className}
              </span>
              <small>
                The complete sheet opens next so you can assign abilities,
                equipment, features, spells, biography, and memories.
              </small>
            </div>
          )}
          {create.isError && (
            <p className="form-message error wide-field">
              {create.error instanceof Error
                ? create.error.message
                : 'The character could not be created.'}
            </p>
          )}
          {(mode === 'manual' || step === 3) && (
            <label>
              Campaign
              <select
                value={form.campaignId}
                onChange={(e) =>
                  setForm({ ...form, campaignId: e.target.value })
                }
              >
                <option value="">Keep unassigned</option>
                {campaigns.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="creation-actions">
            {mode === 'wizard' && step > 1 && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            <button disabled={create.isPending}>
              {mode === 'wizard' && step < 3
                ? 'Continue'
                : 'Create and open sheet'}{' '}
              <ArrowRight />
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
