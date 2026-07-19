import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  Bell,
  CalendarClock,
  KeyRound,
  UserRound,
  Users,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'
import { joinCampaign, listCampaigns } from '../features/campaigns/campaigns'
import {
  listMyInvitations,
  respondCampaignInvitation,
} from '../features/invitations/invitations'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../features/notifications/notifications'
import { listUpcomingSessions } from '../features/scheduling/scheduling'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export function DashboardPage() {
  const { identity } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [inviteCode, setInviteCode] = useState('')
  const campaigns = useQuery({
    queryKey: ['campaigns', identity?.id],
    queryFn: () => listCampaigns(identity!.id),
    enabled: Boolean(identity),
  })
  const notifications = useQuery({
    queryKey: ['notifications', identity?.id],
    queryFn: () => listNotifications(identity!.id),
    enabled: Boolean(identity),
  })
  const invitations = useQuery({
    queryKey: ['invitations', identity?.id],
    queryFn: listMyInvitations,
    enabled: Boolean(identity),
  })
  const upcomingSessions = useQuery({
    queryKey: ['upcoming-sessions', identity?.id],
    queryFn: () => listUpcomingSessions(identity!.id),
    enabled: Boolean(identity),
  })
  const join = useMutation({
    mutationFn: () => joinCampaign(inviteCode),
    onSuccess: async (campaignId) => {
      setInviteCode('')
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      navigate(`/campaigns/${campaignId}`)
    },
  })
  const readNotification = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const readAllNotifications = useMutation({
    mutationFn: () => markAllNotificationsRead(identity!.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const respondInvitation = useMutation({
    mutationFn: ({ token, accept }: { token: string; accept: boolean }) =>
      respondCampaignInvitation(token, accept),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invitations'] }),
        queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
      ])
    },
  })

  const nextSession = upcomingSessions.data?.[0]
  const currentSession = upcomingSessions.data?.find((session) => {
    const opensAt = Date.parse(session.starts_at) - 18 * 60 * 60 * 1000
    return (
      ['active', 'paused'].includes(session.status) || Date.now() >= opensAt
    )
  })
  const currentCampaign = campaigns.data?.find(
    (campaign) => campaign.id === currentSession?.campaign_id,
  )
  const isCurrentSessionManager =
    currentCampaign?.membershipRole === 'owner' ||
    currentCampaign?.membershipRole === 'game_master'
  const unread = notifications.data?.filter((item) => !item.read_at) ?? []

  return (
    <main className="dashboard-page home-launchpad-page">
      <section className="dashboard-content">
        <header className="launchpad-heading">
          <div>
            <p className="eyebrow">Your round table</p>
            <h1>Welcome back, adventurer.</h1>
            <p>Everything requiring your attention is gathered here.</p>
          </div>
        </header>

        <div className="launchpad-grid">
          <section className="launchpad-card launchpad-sessions">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Coming up</p>
                <h2>Upcoming sessions</h2>
              </div>
              <CalendarClock aria-hidden="true" />
            </div>
            {upcomingSessions.isLoading && (
              <p className="muted-copy">Checking your calendar…</p>
            )}
            {upcomingSessions.isError && (
              <p className="form-message error">
                {errorMessage(upcomingSessions.error)}
              </p>
            )}
            {!upcomingSessions.isLoading && !nextSession && (
              <div className="launchpad-empty">
                <strong>No sessions scheduled</strong>
                <span>Open a campaign to coordinate your next gathering.</span>
                <Link to="/calendar">Open calendar</Link>
              </div>
            )}
            <div className="launchpad-session-list">
              {upcomingSessions.data?.slice(0, 3).map((session) => {
                const roomOpen = session.id === currentSession?.id
                return (
                  <Link
                    key={session.id}
                    to={
                      roomOpen
                        ? `/campaigns/${session.campaign_id}/sessions/${session.id}`
                        : `/campaigns/${session.campaign_id}/schedule`
                    }
                  >
                    <time dateTime={session.starts_at}>
                      <strong>
                        {new Date(session.starts_at).toLocaleDateString(
                          undefined,
                          { day: 'numeric' },
                        )}
                      </strong>
                      <span>
                        {new Date(session.starts_at).toLocaleDateString(
                          undefined,
                          { month: 'short' },
                        )}
                      </span>
                    </time>
                    <div>
                      <span>{session.campaigns?.name ?? 'Campaign'}</span>
                      <strong>{session.title}</strong>
                      <small>
                        {new Date(session.starts_at).toLocaleTimeString(
                          undefined,
                          { hour: 'numeric', minute: '2-digit' },
                        )}{' '}
                        · {session.attendanceResponse}
                      </small>
                    </div>
                    <span className={roomOpen ? 'room-open' : ''}>
                      {roomOpen
                        ? isCurrentSessionManager
                          ? 'DM prep'
                          : 'Waiting room'
                        : session.status}
                    </span>
                  </Link>
                )
              })}
            </div>
            {upcomingSessions.data && upcomingSessions.data.length > 3 && (
              <Link className="text-link" to="/calendar">
                View all sessions <ArrowRight size={16} />
              </Link>
            )}
            <div className="launchpad-notifications-inline">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">What changed</p>
                  <h2>Notifications</h2>
                </div>
                <span className="notification-count">{unread.length}</span>
              </div>
              {notifications.isLoading && (
                <p className="muted-copy">Gathering notifications…</p>
              )}
              {notifications.data?.length === 0 && (
                <div className="launchpad-empty inline-empty">
                  <Bell aria-hidden="true" />
                  <strong>You are all caught up.</strong>
                </div>
              )}
              <div className="launchpad-notification-list">
                {notifications.data?.slice(0, 4).map((item) => (
                  <article
                    className={item.read_at ? 'is-read' : ''}
                    key={item.id}
                  >
                    <button
                      disabled={Boolean(item.read_at)}
                      onClick={() => readNotification.mutate(item.id)}
                    >
                      <span>{item.kind.replaceAll('_', ' ')}</span>
                      <strong>{item.title}</strong>
                      <small>
                        {new Date(item.created_at).toLocaleString()}
                      </small>
                    </button>
                  </article>
                ))}
              </div>
              {unread.length > 0 && (
                <button
                  className="text-button"
                  onClick={() => readAllNotifications.mutate()}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </section>

          <section className="launchpad-card join-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Have an invitation?</p>
                <h2>Join a campaign</h2>
              </div>
              <KeyRound aria-hidden="true" />
            </div>
            <form
              onSubmit={(event: FormEvent) => {
                event.preventDefault()
                join.mutate()
              }}
            >
              <label htmlFor="dashboard-invite-code">Invite code</label>
              <input
                id="dashboard-invite-code"
                required
                maxLength={20}
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="Enter eight-character code"
              />
              {join.isError && (
                <p className="form-message error">{errorMessage(join.error)}</p>
              )}
              {join.isSuccess && (
                <p className="form-message success">Campaign joined.</p>
              )}
              <button disabled={join.isPending || !inviteCode.trim()}>
                Join campaign <ArrowRight size={17} />
              </button>
            </form>
          </section>

          <section className="launchpad-card quick-start-card">
            <p className="eyebrow">Quick start</p>
            <h2>Build your next adventure</h2>
            <div>
              <Link to="/campaigns/new">
                <Users aria-hidden="true" />
                <span>
                  <strong>Create a campaign</strong>
                  <small>Start a new table as Game Master</small>
                </span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/characters/new">
                <UserRound aria-hidden="true" />
                <span>
                  <strong>Create a character</strong>
                  <small>Choose manual entry or the guided wizard</small>
                </span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </div>

        {Boolean(invitations.data?.length) && (
          <section className="campaign-section invitation-inbox">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Action required</p>
                <h2>Campaign invitations</h2>
              </div>
            </div>
            <div className="invitation-list">
              {invitations.data?.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>
                      {item.campaigns?.name ?? 'Campaign invitation'}
                    </strong>
                    <span>
                      Invited as {item.role.replace('_', ' ')} · expires{' '}
                      {new Date(item.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="heading-actions">
                    <button
                      onClick={() =>
                        respondInvitation.mutate({
                          token: item.token,
                          accept: true,
                        })
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() =>
                        respondInvitation.mutate({
                          token: item.token,
                          accept: false,
                        })
                      }
                    >
                      Decline
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
