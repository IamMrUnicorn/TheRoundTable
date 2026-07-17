import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarDays,
  Copy,
  Dices,
  Shield,
  Users,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { getCampaign } from '../features/campaigns/campaigns'

export function CampaignPage() {
  const { campaignId: campaignIdParam } = useParams()
  const campaignId = Number(campaignIdParam)
  const campaign = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaign(campaignId),
    enabled: Number.isSafeInteger(campaignId) && campaignId > 0,
  })

  if (!Number.isSafeInteger(campaignId) || campaignId < 1) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="dashboard-page">
      <header className="app-header">
        <Link to="/" className="brand-mark">
          <Dices aria-hidden="true" />
          <span>The Round Table</span>
        </Link>
        <Link className="text-link" to="/">
          <ArrowLeft aria-hidden="true" size={17} /> All campaigns
        </Link>
      </header>

      <section className="campaign-workspace">
        {campaign.isLoading && (
          <p className="muted-copy">Opening the campaign…</p>
        )}
        {campaign.isError && (
          <div className="empty-state">
            <Shield aria-hidden="true" />
            <h1>Campaign unavailable</h1>
            <p>You may not have access to this campaign.</p>
            <Link className="card-link" to="/">
              Return to your campaigns
            </Link>
          </div>
        )}
        {campaign.data && (
          <>
            <section className="campaign-hero">
              <div>
                <p className="eyebrow">{campaign.data.status} campaign</p>
                <h1>{campaign.data.name}</h1>
                <p>
                  {campaign.data.description ||
                    'The story has yet to be written.'}
                </p>
              </div>
              <div className="invite-card">
                <span>Invite code</span>
                <strong>{campaign.data.invite_code}</strong>
                <button
                  className="secondary-button"
                  onClick={() =>
                    void navigator.clipboard.writeText(
                      campaign.data.invite_code,
                    )
                  }
                >
                  <Copy aria-hidden="true" size={16} /> Copy code
                </button>
              </div>
            </section>

            <div className="workspace-grid">
              <section className="workspace-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">The party</p>
                    <h2>Members</h2>
                  </div>
                  <Users aria-hidden="true" />
                </div>
                <div className="member-list">
                  {campaign.data.campaign_members.map((member) => (
                    <article key={member.user_id}>
                      <div className="member-avatar">
                        {member.profiles?.display_name
                          .slice(0, 1)
                          .toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <strong>
                          {member.profiles?.display_name ?? 'Adventurer'}
                        </strong>
                        <span>{member.role.replace('_', ' ')}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="workspace-panel placeholder-panel">
                <CalendarDays aria-hidden="true" />
                <p className="eyebrow">Next foundation</p>
                <h2>Session planning</h2>
                <p>
                  This campaign now has a secure home. Sessions, characters,
                  notes, and the live tabletop can build on this membership
                  model.
                </p>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
