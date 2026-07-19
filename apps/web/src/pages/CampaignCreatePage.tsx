import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Map } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { createCampaign } from '../features/campaigns/campaigns'

export function CampaignCreatePage() {
  const { identity } = useAuth(),
    navigate = useNavigate()
  const [name, setName] = useState(''),
    [description, setDescription] = useState(''),
    [edition, setEdition] = useState('D&D 5e')
  const create = useMutation({
    mutationFn: () =>
      createCampaign({ description, name, ownerId: identity!.id }),
    onSuccess: (campaign) => navigate(`/campaigns/${campaign.id}`),
  })
  return (
    <main className="dashboard-page focused-create-page">
      <section>
        <Link className="text-link" to="/parties">
          ← Back to parties
        </Link>
        <div className="creation-heading">
          <div>
            <p className="eyebrow">New campaign</p>
            <h1>Campaign creation</h1>
            <p>
              Create the table now; maps, lore, scheduling, and players remain
              editable from its manager tabs.
            </p>
          </div>
          <Map />
        </div>
        <form
          className="campaign-create-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            create.mutate()
          }}
        >
          <label>
            Campaign name
            <input
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Game edition
            <select
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
            >
              <option>D&D 5e</option>
              <option>D&D 2024</option>
              <option>Pathfinder 2e</option>
              <option>System agnostic</option>
              <option>Custom / homebrew</option>
            </select>
          </label>
          <label className="wide-field">
            Campaign description, session zero notes, or opening lore
            <textarea
              rows={8}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="map-upload-placeholder">
            <Map />
            <strong>World map</strong>
            <span>
              Map uploads will live here; create the campaign first to open its
              shared library.
            </span>
          </div>
          <button disabled={create.isPending}>
            Create campaign <ArrowRight />
          </button>
        </form>
      </section>
    </main>
  )
}
