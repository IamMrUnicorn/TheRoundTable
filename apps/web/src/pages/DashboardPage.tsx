import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  Dices,
  KeyRound,
  Plus,
  Shield,
  Users,
  X,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  createCampaign,
  joinCampaign,
  listCampaigns,
} from '../features/campaigns/campaigns'
import { useAuth } from '../features/auth/auth-context'

type Panel = 'create' | 'join' | null

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export function DashboardPage() {
  const { identity, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [panel, setPanel] = useState<Panel>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const campaigns = useQuery({
    queryKey: ['campaigns', identity?.id],
    queryFn: () => listCampaigns(identity!.id),
    enabled: Boolean(identity),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createCampaign({
        description,
        name,
        ownerId: identity!.id,
      }),
    onSuccess: async (campaign) => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      navigate(`/campaigns/${campaign.id}`)
    },
  })

  const joinMutation = useMutation({
    mutationFn: () => joinCampaign(inviteCode),
    onSuccess: async (campaignId) => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      navigate(`/campaigns/${campaignId}`)
    },
  })

  function submitCreate(event: FormEvent) {
    event.preventDefault()
    if (name.trim()) createMutation.mutate()
  }

  function submitJoin(event: FormEvent) {
    event.preventDefault()
    if (inviteCode.trim()) joinMutation.mutate()
  }

  return (
    <main className="dashboard-page">
      <header className="app-header">
        <Link to="/" className="brand-mark">
          <Dices aria-hidden="true" />
          <span>The Round Table</span>
        </Link>
        <button className="secondary-button" onClick={() => void signOut()}>
          Sign out
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-heading compact-heading">
          <div>
            <p className="eyebrow">Campaign hub</p>
            <h1>Choose your next adventure.</h1>
            <p>
              Create a table as Game Master or join your party with an invite
              code.
            </p>
          </div>
          <div className="heading-actions">
            <button
              className="secondary-button"
              onClick={() => setPanel('join')}
            >
              <KeyRound aria-hidden="true" size={18} /> Join campaign
            </button>
            <button onClick={() => setPanel('create')}>
              <Plus aria-hidden="true" size={18} /> Create campaign
            </button>
          </div>
        </div>

        {panel && (
          <section className="action-panel" aria-label={`${panel} campaign`}>
            <button
              className="icon-button"
              aria-label="Close"
              onClick={() => setPanel(null)}
            >
              <X aria-hidden="true" size={18} />
            </button>
            {panel === 'create' ? (
              <form onSubmit={submitCreate}>
                <div>
                  <p className="eyebrow">New table</p>
                  <h2>Create a campaign</h2>
                </div>
                <label htmlFor="campaign-name">Campaign name</label>
                <input
                  id="campaign-name"
                  maxLength={100}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="The Ember Crown"
                />
                <label htmlFor="campaign-description">
                  Description <span>(optional)</span>
                </label>
                <textarea
                  id="campaign-description"
                  maxLength={2000}
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="A short introduction for your players…"
                />
                {createMutation.isError && (
                  <p className="form-message error">
                    {errorMessage(createMutation.error)}
                  </p>
                )}
                <button disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating…' : 'Create campaign'}
                </button>
              </form>
            ) : (
              <form onSubmit={submitJoin}>
                <div>
                  <p className="eyebrow">Find your party</p>
                  <h2>Join a campaign</h2>
                </div>
                <label htmlFor="invite-code">Eight-character invite code</label>
                <input
                  id="invite-code"
                  autoCapitalize="characters"
                  maxLength={8}
                  minLength={8}
                  pattern="[A-Fa-f0-9]{8}"
                  required
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value)}
                  placeholder="A1B2C3D4"
                />
                {joinMutation.isError && (
                  <p className="form-message error">
                    {errorMessage(joinMutation.error)}
                  </p>
                )}
                <button disabled={joinMutation.isPending}>
                  {joinMutation.isPending ? 'Joining…' : 'Join the table'}
                </button>
              </form>
            )}
          </section>
        )}

        <section className="campaign-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your tables</p>
              <h2>Campaigns</h2>
            </div>
            <span>{campaigns.data?.length ?? 0} active memberships</span>
          </div>

          {campaigns.isLoading && (
            <p className="muted-copy">Gathering your campaigns…</p>
          )}
          {campaigns.isError && (
            <p className="form-message error">
              {errorMessage(campaigns.error)}
            </p>
          )}
          {campaigns.data?.length === 0 && (
            <div className="empty-state">
              <Users aria-hidden="true" />
              <h3>Your table is waiting.</h3>
              <p>Create a campaign or enter an invite code to begin.</p>
            </div>
          )}
          <div className="campaign-grid">
            {campaigns.data?.map((campaign) => (
              <Link
                className="campaign-card"
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
              >
                <div className="campaign-card-meta">
                  <span>
                    {campaign.membershipRole === 'owner' ? (
                      <Shield aria-hidden="true" size={15} />
                    ) : (
                      <Users aria-hidden="true" size={15} />
                    )}
                    {campaign.membershipRole.replace('_', ' ')}
                  </span>
                  <span>{campaign.status}</span>
                </div>
                <h3>{campaign.name}</h3>
                <p>{campaign.description || 'No campaign description yet.'}</p>
                <span className="card-link">
                  Enter campaign <ArrowRight aria-hidden="true" size={17} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
