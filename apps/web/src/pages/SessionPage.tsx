import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Play, Shield, Users } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import { getCampaign } from '../features/campaigns/campaigns'
import { listCampaignCharacters } from '../features/characters/characters'
import { getSession, updateSession } from '../features/scheduling/scheduling'
import { SessionEventPanel } from '../features/sessions/SessionEventPanel'

export function SessionPage() {
  const params = useParams()
  const campaignId = Number(params.campaignId)
  const sessionId = Number(params.sessionId)
  const { identity } = useAuth()
  const client = useQueryClient()
  const campaign = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaign(campaignId),
    enabled: campaignId > 0,
  })
  const session = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: sessionId > 0,
    refetchInterval: 5_000,
  })
  const characters = useQuery({
    queryKey: ['campaign-characters', campaignId],
    queryFn: () => listCampaignCharacters(campaignId),
    enabled: campaignId > 0,
  })
  const start = useMutation({
    mutationFn: () => updateSession(sessionId, { status: 'active' }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['session', sessionId] }),
        client.invalidateQueries({ queryKey: ['upcoming-sessions'] }),
        client.invalidateQueries({
          queryKey: ['next-campaign-session', campaignId],
        }),
      ])
    },
  })
  if (!Number.isSafeInteger(campaignId) || !Number.isSafeInteger(sessionId))
    return <Navigate to="/parties" replace />
  if (campaign.isLoading || session.isLoading)
    return (
      <main className="loading-screen">
        <p>Preparing the table…</p>
      </main>
    )
  if (
    !campaign.data ||
    !session.data ||
    session.data.campaign_id !== campaignId
  )
    return <Navigate to="/parties" replace />

  const membership = campaign.data.campaign_members.find(
    (member) => member.user_id === identity?.id,
  )
  const isManager =
    campaign.data.owner_id === identity?.id ||
    membership?.role === 'game_master'
  const isActive = session.data.status === 'active'
  const begins = new Date(session.data.starts_at)

  if (isActive)
    return (
      <main className="dashboard-page session-page">
        <section className="session-route-heading">
          <div>
            <p className="eyebrow">Live play · {campaign.data.name}</p>
            <h1>{session.data.title}</h1>
          </div>
          <Link className="text-link" to={`/campaigns/${campaignId}`}>
            Campaign home
          </Link>
        </section>
        <SessionEventPanel
          actorId={identity!.id}
          campaignId={campaignId}
          characters={characters.data ?? []}
          isManager={isManager}
          sessionId={sessionId}
          sessionStatus={session.data.status}
        />
      </main>
    )

  return (
    <main className="dashboard-page session-page">
      <section className="session-lobby-card">
        <div className="lobby-icon">{isManager ? <Shield /> : <Users />}</div>
        <p className="eyebrow">
          {isManager ? 'DM preparation room' : 'Player waiting room'}
        </p>
        <h1>{session.data.title}</h1>
        <h2>{campaign.data.name}</h2>
        <div className="session-lobby-facts">
          <span>
            <CalendarClock /> {begins.toLocaleString()}
          </span>
          <span>{session.data.status}</span>
        </div>
        {session.data.agenda && (
          <div className="lobby-agenda">
            <strong>Session agenda</strong>
            <p>{session.data.agenda}</p>
          </div>
        )}
        {isManager ? (
          <>
            <p>
              Review the campaign, agenda, and party sheets. Start play when
              everyone is ready.
            </p>
            <div className="heading-actions">
              <Link
                className="secondary-button"
                to={`/campaigns/${campaignId}`}
              >
                Review campaign
              </Link>
              <button disabled={start.isPending} onClick={() => start.mutate()}>
                <Play size={17} /> Start session
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              You are in the right place. The live play screen will open here
              when the Game Master starts the session.
            </p>
            <Link className="secondary-button" to={`/campaigns/${campaignId}`}>
              Review campaign while waiting
            </Link>
          </>
        )}
      </section>
    </main>
  )
}
