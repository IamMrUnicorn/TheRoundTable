import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Dices, Plus, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import { getCampaign } from '../features/campaigns/campaigns'
import {
  addAvailabilityException,
  addAvailabilityRule,
  createSession,
  deleteAvailabilityException,
  deleteAvailabilityRule,
  getSchedule,
  respondToSession,
  updateSession,
} from '../features/scheduling/scheduling'

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const minutes = (value: string) => {
  const [hours, mins] = value.split(':').map(Number)
  return hours * 60 + mins
}
const clock = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`

type RuleShape = {
  end_minute: number
  preference: string
  start_minute: number
  user_id: string
  weekday: number
}

function findRecommendations(
  rules: RuleShape[],
  memberIds: string[],
  duration: number,
) {
  const matches: {
    end: number
    preferred: number
    start: number
    weekday: number
  }[] = []
  if (!memberIds.length) return matches
  for (let weekday = 0; weekday < 7; weekday += 1) {
    for (let start = 0; start + duration <= 1440; start += 30) {
      const covering = memberIds.map((userId) =>
        rules.find(
          (item) =>
            item.user_id === userId &&
            item.weekday === weekday &&
            item.start_minute <= start &&
            item.end_minute >= start + duration,
        ),
      )
      if (covering.every(Boolean))
        matches.push({
          weekday,
          start,
          end: start + duration,
          preferred: covering.filter((item) => item?.preference === 'preferred')
            .length,
        })
    }
  }
  return matches
    .sort(
      (a, b) =>
        b.preferred - a.preferred || a.weekday - b.weekday || a.start - b.start,
    )
    .slice(0, 6)
}

function nextOccurrence(weekday: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7 || 7))
  date.setHours(Math.floor(minute / 60), minute % 60, 0, 0)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function localDateTime(value: string) {
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)
}

export function SchedulePage() {
  const campaignId = Number(useParams().campaignId)
  const { identity } = useAuth()
  const queryClient = useQueryClient()
  const [rule, setRule] = useState({
    weekday: 6,
    start: '18:00',
    end: '22:00',
    preference: 'available',
  })
  const [exception, setException] = useState({
    starts: '',
    ends: '',
    availability: 'unavailable',
    note: '',
  })
  const [session, setSession] = useState({
    title: '',
    starts: '',
    ends: '',
    agenda: '',
  })
  const campaign = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaign(campaignId),
    enabled: campaignId > 0,
  })
  const schedule = useQuery({
    queryKey: ['schedule', campaignId],
    queryFn: () => getSchedule(campaignId),
    enabled: campaignId > 0,
  })
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['schedule', campaignId] })
  const addRule = useMutation({
    mutationFn: () =>
      addAvailabilityRule({
        campaignId,
        userId: identity!.id,
        weekday: rule.weekday,
        startMinute: minutes(rule.start),
        endMinute: minutes(rule.end),
        preference: rule.preference,
      }),
    onSuccess: refresh,
  })
  const removeRule = useMutation({
    mutationFn: deleteAvailabilityRule,
    onSuccess: refresh,
  })
  const addException = useMutation({
    mutationFn: () =>
      addAvailabilityException({
        campaignId,
        userId: identity!.id,
        startsAt: new Date(exception.starts).toISOString(),
        endsAt: new Date(exception.ends).toISOString(),
        availability: exception.availability,
        note: exception.note,
      }),
    onSuccess: refresh,
  })
  const addSession = useMutation({
    mutationFn: () =>
      createSession({
        campaignId,
        userId: identity!.id,
        title: session.title,
        agenda: session.agenda,
        startsAt: new Date(session.starts).toISOString(),
        endsAt: new Date(session.ends).toISOString(),
      }),
    onSuccess: refresh,
  })
  const removeException = useMutation({
    mutationFn: deleteAvailabilityException,
    onSuccess: refresh,
  })
  const manageSession = useMutation({
    mutationFn: ({
      sessionId,
      updates,
    }: {
      sessionId: number
      updates: { ends_at?: string; starts_at?: string; status?: string }
    }) => updateSession(sessionId, updates),
    onSuccess: refresh,
  })
  const respond = useMutation({
    mutationFn: ({
      sessionId,
      response,
    }: {
      sessionId: number
      response: string
    }) => respondToSession(sessionId, identity!.id, response),
    onSuccess: refresh,
  })
  if (!Number.isSafeInteger(campaignId) || campaignId < 1)
    return <Navigate to="/" replace />
  const membership = campaign.data?.campaign_members.find(
    (member) => member.user_id === identity?.id,
  )
  const isManager =
    campaign.data?.owner_id === identity?.id ||
    membership?.role === 'game_master'
  const recommendations = findRecommendations(
    schedule.data?.rules ?? [],
    campaign.data?.campaign_members.map((member) => member.user_id) ?? [],
    campaign.data?.preferred_session_minutes ?? 180,
  )

  return (
    <main className="dashboard-page">
      <header className="app-header">
        <Link to="/" className="brand-mark">
          <Dices />
          <span>The Round Table</span>
        </Link>
        <Link className="text-link" to={`/campaigns/${campaignId}`}>
          <ArrowLeft size={17} /> Campaign
        </Link>
      </header>
      <section className="schedule-page">
        <div className="dashboard-heading compact-heading">
          <div>
            <p className="eyebrow">Campaign calendar</p>
            <h1>Find time to play.</h1>
            <p>
              {campaign.data?.name} · Times display in your browser timezone.
            </p>
          </div>
        </div>
        <div className="schedule-grid">
          <section className="workspace-panel">
            <h2>Weekly availability</h2>
            <form
              onSubmit={(event: FormEvent) => {
                event.preventDefault()
                addRule.mutate()
              }}
            >
              <label>
                Day
                <select
                  value={rule.weekday}
                  onChange={(e) =>
                    setRule({ ...rule, weekday: Number(e.target.value) })
                  }
                >
                  {days.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                From
                <input
                  type="time"
                  required
                  value={rule.start}
                  onChange={(e) => setRule({ ...rule, start: e.target.value })}
                />
              </label>
              <label>
                Until
                <input
                  type="time"
                  required
                  value={rule.end}
                  onChange={(e) => setRule({ ...rule, end: e.target.value })}
                />
              </label>
              <label>
                Preference
                <select
                  value={rule.preference}
                  onChange={(e) =>
                    setRule({ ...rule, preference: e.target.value })
                  }
                >
                  <option value="available">Available</option>
                  <option value="preferred">Preferred</option>
                </select>
              </label>
              <button>
                <Plus size={16} /> Add weekly time
              </button>
            </form>
            <div className="schedule-list">
              {schedule.data?.rules.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.profiles?.display_name}</strong>
                    <span>
                      {days[item.weekday]} · {clock(item.start_minute)}–
                      {clock(item.end_minute)} · {item.preference}
                    </span>
                  </div>
                  {item.user_id === identity?.id && (
                    <button
                      className="icon-button-static"
                      onClick={() => removeRule.mutate(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
          <section className="workspace-panel">
            <h2>Date exception</h2>
            <form
              onSubmit={(event: FormEvent) => {
                event.preventDefault()
                addException.mutate()
              }}
            >
              <label>
                Starts
                <input
                  type="datetime-local"
                  required
                  value={exception.starts}
                  onChange={(e) =>
                    setException({ ...exception, starts: e.target.value })
                  }
                />
              </label>
              <label>
                Ends
                <input
                  type="datetime-local"
                  required
                  value={exception.ends}
                  onChange={(e) =>
                    setException({ ...exception, ends: e.target.value })
                  }
                />
              </label>
              <label>
                Availability
                <select
                  value={exception.availability}
                  onChange={(e) =>
                    setException({ ...exception, availability: e.target.value })
                  }
                >
                  <option value="unavailable">Unavailable</option>
                  <option value="available">Available</option>
                  <option value="preferred">Preferred</option>
                </select>
              </label>
              <label>
                Note
                <input
                  maxLength={500}
                  value={exception.note}
                  onChange={(e) =>
                    setException({ ...exception, note: e.target.value })
                  }
                />
              </label>
              <button>Add exception</button>
            </form>
            <div className="schedule-list">
              {schedule.data?.exceptions.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>
                      {item.profiles?.display_name} · {item.availability}
                    </strong>
                    <span>
                      {new Date(item.starts_at).toLocaleString()}–
                      {new Date(item.ends_at).toLocaleString()}
                    </span>
                  </div>
                  {item.user_id === identity?.id && (
                    <button
                      className="icon-button-static"
                      aria-label="Delete exception"
                      onClick={() => removeException.mutate(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
        <section className="workspace-panel recommendations-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Automatic matching</p>
              <h2>Best recurring times</h2>
            </div>
            <span>
              {campaign.data?.preferred_session_minutes ?? 180} minute sessions
            </span>
          </div>
          {recommendations.length === 0 ? (
            <p className="muted-copy">
              Add availability for every campaign member to generate matches.
            </p>
          ) : (
            <div className="recommendation-grid">
              {recommendations.map((match) => (
                <article key={`${match.weekday}-${match.start}`}>
                  <strong>{days[match.weekday]}</strong>
                  <span>
                    {clock(match.start)}–{clock(match.end)}
                  </span>
                  <small>
                    {match.preferred} preferred vote
                    {match.preferred === 1 ? '' : 's'}
                  </small>
                  {isManager && (
                    <button
                      className="secondary-button"
                      onClick={() => {
                        const starts = nextOccurrence(
                          match.weekday,
                          match.start,
                        )
                        const endDate = new Date(starts)
                        endDate.setMinutes(
                          endDate.getMinutes() +
                            (campaign.data?.preferred_session_minutes ?? 180),
                        )
                        const localEnd = new Date(
                          endDate.getTime() -
                            endDate.getTimezoneOffset() * 60_000,
                        )
                          .toISOString()
                          .slice(0, 16)
                        setSession({
                          ...session,
                          title:
                            session.title ||
                            `${campaign.data?.name ?? 'Campaign'} session`,
                          starts,
                          ends: localEnd,
                        })
                      }}
                    >
                      Use this time
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
        {isManager && (
          <section className="workspace-panel session-proposal">
            <h2>Propose a session</h2>
            <form
              onSubmit={(event: FormEvent) => {
                event.preventDefault()
                addSession.mutate()
              }}
            >
              <label>
                Title
                <input
                  required
                  maxLength={120}
                  value={session.title}
                  onChange={(e) =>
                    setSession({ ...session, title: e.target.value })
                  }
                />
              </label>
              <label>
                Starts
                <input
                  type="datetime-local"
                  required
                  value={session.starts}
                  onChange={(e) =>
                    setSession({ ...session, starts: e.target.value })
                  }
                />
              </label>
              <label>
                Ends
                <input
                  type="datetime-local"
                  required
                  value={session.ends}
                  onChange={(e) =>
                    setSession({ ...session, ends: e.target.value })
                  }
                />
              </label>
              <label>
                Agenda
                <textarea
                  rows={3}
                  value={session.agenda}
                  onChange={(e) =>
                    setSession({ ...session, agenda: e.target.value })
                  }
                />
              </label>
              <button>Propose session</button>
            </form>
          </section>
        )}
        <section className="campaign-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Upcoming</p>
              <h2>Session proposals</h2>
            </div>
            <CalendarDays />
          </div>
          <div className="campaign-grid">
            {schedule.data?.sessions.map((item) => {
              const answer =
                schedule.data.attendance.find(
                  (entry) =>
                    entry.session_id === item.id &&
                    entry.user_id === identity?.id,
                )?.response ?? 'unanswered'
              const responses = schedule.data.attendance.filter(
                (entry) => entry.session_id === item.id,
              )
              return (
                <article className="campaign-card" key={item.id}>
                  <div className="campaign-card-meta">
                    <span>{item.status}</span>
                    <span>{answer}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>
                    {new Date(item.starts_at).toLocaleString()}–
                    {new Date(item.ends_at).toLocaleTimeString()}
                  </p>
                  <div className="attendance-summary">
                    <span>
                      {
                        responses.filter(
                          (entry) => entry.response === 'attending',
                        ).length
                      }{' '}
                      attending
                    </span>
                    <span>
                      {
                        responses.filter(
                          (entry) => entry.response === 'tentative',
                        ).length
                      }{' '}
                      tentative
                    </span>
                    <span>
                      {
                        responses.filter((entry) => entry.response === 'absent')
                          .length
                      }{' '}
                      absent
                    </span>
                  </div>
                  <div className="response-buttons">
                    {['attending', 'tentative', 'absent'].map((response) => (
                      <button
                        className={
                          answer === response ? '' : 'secondary-button'
                        }
                        key={response}
                        onClick={() =>
                          respond.mutate({ sessionId: item.id, response })
                        }
                      >
                        {response}
                      </button>
                    ))}
                  </div>
                  {isManager && (
                    <div className="manager-session-actions">
                      {item.status !== 'scheduled' && (
                        <button
                          onClick={() =>
                            manageSession.mutate({
                              sessionId: item.id,
                              updates: { status: 'scheduled' },
                            })
                          }
                        >
                          Confirm
                        </button>
                      )}
                      {item.status !== 'completed' && (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            manageSession.mutate({
                              sessionId: item.id,
                              updates: { status: 'completed' },
                            })
                          }
                        >
                          Complete
                        </button>
                      )}
                      {item.status !== 'cancelled' && (
                        <button
                          className="danger-button"
                          onClick={() =>
                            manageSession.mutate({
                              sessionId: item.id,
                              updates: { status: 'cancelled' },
                            })
                          }
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                  {isManager && (
                    <details className="reschedule-panel">
                      <summary>Reschedule</summary>
                      <form
                        onSubmit={(event) => {
                          event.preventDefault()
                          const data = new FormData(event.currentTarget)
                          manageSession.mutate({
                            sessionId: item.id,
                            updates: {
                              starts_at: new Date(
                                String(data.get('starts')),
                              ).toISOString(),
                              ends_at: new Date(
                                String(data.get('ends')),
                              ).toISOString(),
                              status: 'proposed',
                            },
                          })
                        }}
                      >
                        <label>
                          New start
                          <input
                            name="starts"
                            type="datetime-local"
                            required
                            defaultValue={localDateTime(item.starts_at)}
                          />
                        </label>
                        <label>
                          New end
                          <input
                            name="ends"
                            type="datetime-local"
                            required
                            defaultValue={localDateTime(item.ends_at)}
                          />
                        </label>
                        <button>Save new time</button>
                      </form>
                    </details>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      </section>
    </main>
  )
}
