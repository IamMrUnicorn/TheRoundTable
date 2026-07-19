import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, FlaskConical, Plus, Shield, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import {
  createSampleCampaign,
  listCampaigns,
} from '../features/campaigns/campaigns'

export function PartiesPage() {
  const { identity } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const campaigns = useQuery({
    queryKey: ['campaigns', identity?.id],
    queryFn: () => listCampaigns(identity!.id),
    enabled: Boolean(identity),
  })
  const sample = useMutation({
    mutationFn: () => createSampleCampaign(identity!.id),
    onSuccess: async (campaign) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
        queryClient.invalidateQueries({ queryKey: ['characters'] }),
        queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
      navigate(`/campaigns/${campaign.id}`)
    },
  })

  return (
    <main className="dashboard-page simple-hub-page">
      <section className="dashboard-content">
        <header className="hub-heading">
          <div>
            <p className="eyebrow">Your tables</p>
            <h1>Parties and campaigns</h1>
            <p>
              Enter a campaign workspace, create a new story, or generate a
              populated testing campaign.
            </p>
          </div>
          <Link className="primary-flow-action" to="/campaigns/new">
            <Plus size={18} /> Create campaign
          </Link>
        </header>

        {campaigns.isLoading && (
          <p className="muted-copy">Gathering your parties…</p>
        )}
        {campaigns.isError && (
          <p className="form-message error">
            Your campaigns could not be loaded.
          </p>
        )}
        <div className="campaign-grid parties-grid">
          {campaigns.data?.map((campaign) => (
            <Link
              className="campaign-card"
              key={campaign.id}
              to={`/campaigns/${campaign.id}`}
            >
              <div className="campaign-card-meta">
                <span>
                  {campaign.membershipRole === 'owner' ? (
                    <Shield size={15} />
                  ) : (
                    <Users size={15} />
                  )}
                  {campaign.membershipRole.replace('_', ' ')}
                </span>
                <span>{campaign.status}</span>
              </div>
              <h2>{campaign.name}</h2>
              <p>{campaign.description || 'The story is waiting to begin.'}</p>
              <small>
                {campaign.ruleset} · {campaign.cadence}
              </small>
              <span className="card-link">
                Enter campaign <ArrowRight size={17} />
              </span>
            </Link>
          ))}
        </div>

        {!campaigns.isLoading && !campaigns.data?.length && (
          <div className="empty-state">
            <Users aria-hidden="true" />
            <h2>No parties yet</h2>
            <p>Create a campaign, join from Home, or generate sample data.</p>
          </div>
        )}

        <section className="sample-data-panel">
          <FlaskConical aria-hidden="true" />
          <div>
            <p className="eyebrow">Testing shortcut</p>
            <h2>Generate a populated sample campaign</h2>
            <p>
              Creates a campaign owned by you with a character, announcements,
              shared and GM notes, world state, quests, NPCs, a faction,
              locations, party inventory, session history, and an upcoming
              session.
            </p>
            <small>
              This uses the same permissions and application APIs as ordinary
              data. It does not create fake login accounts or bypass RLS.
            </small>
          </div>
          <button
            disabled={sample.isPending}
            onClick={() => {
              if (
                window.confirm(
                  'Create a populated sample campaign in your account?',
                )
              )
                sample.mutate()
            }}
          >
            {sample.isPending ? 'Generating…' : 'Generate sample campaign'}
          </button>
          {sample.isError && (
            <p className="form-message error sample-data-message">
              {sample.error instanceof Error
                ? sample.error.message
                : 'Sample data could not be created.'}
            </p>
          )}
        </section>
      </section>
    </main>
  )
}
