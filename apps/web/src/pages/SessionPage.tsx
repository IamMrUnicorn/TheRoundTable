import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Clock3, Play, Shield, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import { FlowBreadcrumbs } from '../components/FlowBreadcrumbs'
import { getCampaign } from '../features/campaigns/campaigns'
import { listCampaignCharacters } from '../features/characters/characters'
import {
  getActiveCampaignSession,
  getSession,
  listSessionReadiness,
  respondSessionOvertime,
  setSessionReady,
  startSession,
} from '../features/scheduling/scheduling'
import { SessionEventPanel } from '../features/sessions/SessionEventPanel'
import { SessionPresenceBar } from '../features/sessions/SessionPresenceBar'
import { supabase } from '../lib/supabase'

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
  const readiness = useQuery({
    queryKey: ['session-readiness', sessionId],
    queryFn: () => listSessionReadiness(sessionId),
    enabled: sessionId > 0,
    refetchInterval: 5_000,
  })
  const activeCampaignSession = useQuery({
    queryKey: ['active-campaign-session', campaignId, sessionId],
    queryFn: () => getActiveCampaignSession(campaignId, sessionId),
    enabled: campaignId > 0 && sessionId > 0,
    refetchInterval: 5_000,
  })
  useEffect(() => {
    if (sessionId <= 0) return
    const refreshRoom = () => {
      void Promise.all([
        client.invalidateQueries({
          queryKey: ['session-readiness', sessionId],
        }),
        client.invalidateQueries({ queryKey: ['session', sessionId] }),
        client.invalidateQueries({
          queryKey: ['active-campaign-session', campaignId, sessionId],
        }),
      ])
    }
    const channel = supabase
      .channel(`session-room:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `session_id=eq.${sessionId}`,
          schema: 'public',
          table: 'session_attendance',
        },
        refreshRoom,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          filter: `id=eq.${sessionId}`,
          schema: 'public',
          table: 'sessions',
        },
        refreshRoom,
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [campaignId, client, sessionId])
  const myReadiness = readiness.data?.find(
    (entry) => entry.user_id === identity?.id,
  )
  const ready = useMutation({
    mutationFn: (isReady: boolean) =>
      setSessionReady(sessionId, identity!.id, isReady),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ['session-readiness', sessionId] }),
  })
  const start = useMutation({
    mutationFn: (replaceExisting: boolean) =>
      startSession(sessionId, replaceExisting),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['session', sessionId] }),
        client.invalidateQueries({ queryKey: ['upcoming-sessions'] }),
        client.invalidateQueries({
          queryKey: ['next-campaign-session', campaignId],
        }),
        client.invalidateQueries({
          queryKey: ['active-campaign-session', campaignId, sessionId],
        }),
      ])
    },
  })
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])
  const overtime = useMutation({
    mutationFn: (continueSession: boolean) =>
      respondSessionOvertime(sessionId, continueSession),
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
  const isActive = ['active', 'paused'].includes(session.data.status)
  const begins = new Date(session.data.starts_at)
  const presenceMembers = campaign.data.campaign_members
    .filter((member) => member.status === 'active')
    .map((member) => ({
      displayName: member.profiles?.display_name ?? 'Party member',
      userId: member.user_id,
    }))
  const displayName =
    membership?.profiles?.display_name ?? identity?.email ?? 'Party member'

  if (isActive)
    return (
      <main className="dashboard-page session-page">
        <FlowBreadcrumbs campaignId={campaignId} current="play" />
        <section className="session-route-heading">
          <div>
            <p className="eyebrow">Live play · {campaign.data.name}</p>
            <h1>{session.data.title}</h1>
          </div>
          <Link className="text-link" to={`/campaigns/${campaignId}`}>
            Campaign home
          </Link>
        </section>
        <SessionPresenceBar
          displayName={displayName}
          members={presenceMembers}
          sessionId={sessionId}
          startsAt={session.data.starts_at}
          status={session.data.status}
          userId={identity!.id}
        />
        {session.data.status === 'paused' && (
          <div className="session-paused-banner">
            Session paused by the Game Master
          </div>
        )}
        <SessionEventPanel
          actorId={identity!.id}
          campaignId={campaignId}
          characters={characters.data ?? []}
          isManager={isManager}
          sessionId={sessionId}
          sessionStatus={session.data.status}
        />
        {isManager && session.data.overtime_expires_at && (
          <div className="session-overtime-backdrop" role="presentation">
            <section
              className="session-overtime-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="session-overtime-title"
            >
              <Clock3 aria-hidden="true" />
              <p className="eyebrow">Scheduled end time passed</p>
              <h2 id="session-overtime-title">Is the session still going?</h2>
              <p>
                Confirm to add one hour. If nobody responds, this session will
                be completed automatically.
              </p>
              <strong>
                {Math.max(
                  0,
                  Math.ceil(
                    (Date.parse(session.data.overtime_expires_at) -
                      currentTime) /
                      1000,
                  ),
                )}
                s remaining
              </strong>
              <div>
                <button
                  autoFocus
                  disabled={overtime.isPending}
                  onClick={() => overtime.mutate(true)}
                >
                  Still playing · add 1 hour
                </button>
                <button
                  className="secondary-button"
                  disabled={overtime.isPending}
                  onClick={() => overtime.mutate(false)}
                >
                  End session now
                </button>
              </div>
              {overtime.error && (
                <p className="form-error">{overtime.error.message}</p>
              )}
            </section>
          </div>
        )}
      </main>
    )

  return (
    <main className="dashboard-page session-page">
      <FlowBreadcrumbs campaignId={campaignId} current="room" />
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
        <SessionPresenceBar
          displayName={displayName}
          members={presenceMembers}
          sessionId={sessionId}
          startsAt={session.data.starts_at}
          status={session.data.status}
          userId={identity!.id}
        />
        {session.data.agenda && (
          <div className="lobby-agenda">
            <strong>Session agenda</strong>
            <p>{session.data.agenda}</p>
          </div>
        )}
        <div className="readiness-roster">
          <strong>Party readiness</strong>
          {campaign.data.campaign_members
            .filter((member) => member.status === 'active')
            .map((member) => {
              const entry = readiness.data?.find(
                (item) => item.user_id === member.user_id,
              )
              return (
                <span
                  key={member.user_id}
                  className={entry?.ready_at ? 'is-ready' : ''}
                >
                  {entry?.ready_at ? 'Ready' : 'Not ready'} ·{' '}
                  {member.profiles?.display_name ?? 'Party member'}
                </span>
              )
            })}
        </div>
        <div className="heading-actions lobby-ready-action">
          <button
            className="secondary-button"
            disabled={ready.isPending}
            onClick={() => ready.mutate(!myReadiness?.ready_at)}
          >
            {myReadiness?.ready_at ? 'I am no longer ready' : 'I am ready'}
          </button>
          <span>
            This readiness belongs to you and is visible to everyone in the
            room.
          </span>
        </div>
        {ready.error && <p className="form-error">{ready.error.message}</p>}
        {isManager ? (
          <>
            <p>
              Review the campaign, agenda, and party sheets. Start play when
              everyone is ready.
            </p>
            {activeCampaignSession.data && (
              <div className="session-conflict-notice">
                <strong>Another session is already in progress</strong>
                <p>
                  “{activeCampaignSession.data.title}” is currently{' '}
                  {activeCampaignSession.data.status}. Only one session can be
                  active for this campaign.
                </p>
                <div className="heading-actions">
                  <Link
                    className="secondary-button"
                    to={`/campaigns/${campaignId}/sessions/${activeCampaignSession.data.id}`}
                  >
                    Open active session
                  </Link>
                  <button
                    disabled={start.isPending}
                    onClick={() => start.mutate(true)}
                  >
                    Complete previous and start this session
                  </button>
                </div>
              </div>
            )}
            <div className="heading-actions">
              <Link
                className="secondary-button"
                to={`/campaigns/${campaignId}`}
              >
                Review campaign
              </Link>
              <button
                disabled={start.isPending || !!activeCampaignSession.data}
                onClick={() => start.mutate(false)}
              >
                <Play size={17} /> Start session
              </button>
            </div>
            {start.error && <p className="form-error">{start.error.message}</p>}
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
