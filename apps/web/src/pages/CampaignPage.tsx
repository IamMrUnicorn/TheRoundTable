import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarDays,
  Copy,
  Dices,
  Shield,
  Users,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../features/auth/auth-context'
import {
  getCampaign,
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  removeCampaignMember,
  rotateInviteCode,
  updateCampaignSettings,
  updateMemberRole,
} from '../features/campaigns/campaigns'
import { listCampaignCharacters } from '../features/characters/characters'
import {
  cancelCampaignInvitation,
  createCampaignInvitation,
  listCampaignInvitations,
} from '../features/invitations/invitations'

export function CampaignPage() {
  const { campaignId: campaignIdParam } = useParams()
  const campaignId = Number(campaignIdParam)
  const { identity } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState({
    name: '',
    description: '',
    timezone: 'UTC',
    cadence: 'weekly',
    preferredSessionMinutes: 180,
    status: 'forming',
  })
  const [announcement, setAnnouncement] = useState({
    title: '',
    body: '',
    isPinned: false,
  })
  const [invitation, setInvitation] = useState({ email: '', role: 'player' })
  const campaign = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaign(campaignId),
    enabled: Number.isSafeInteger(campaignId) && campaignId > 0,
  })
  const characters = useQuery({
    queryKey: ['campaign-characters', campaignId],
    queryFn: () => listCampaignCharacters(campaignId),
    enabled: Number.isSafeInteger(campaignId) && campaignId > 0,
  })
  const announcements = useQuery({
    queryKey: ['announcements', campaignId],
    queryFn: () => listAnnouncements(campaignId),
    enabled: campaignId > 0,
  })
  const invitations = useQuery({
    queryKey: ['campaign-invitations', campaignId],
    queryFn: () => listCampaignInvitations(campaignId),
    enabled: campaignId > 0,
  })
  useEffect(() => {
    if (campaign.data)
      setSettings({
        name: campaign.data.name,
        description: campaign.data.description,
        timezone: campaign.data.timezone,
        cadence: campaign.data.cadence,
        preferredSessionMinutes: campaign.data.preferred_session_minutes,
        status: campaign.data.status,
      })
  }, [campaign.data])
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
  const saveSettings = useMutation({
    mutationFn: () => updateCampaignSettings(campaignId, settings),
    onSuccess: refresh,
  })
  const rotateCode = useMutation({
    mutationFn: () => rotateInviteCode(campaignId),
    onSuccess: refresh,
  })
  const changeRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateMemberRole(campaignId, userId, role),
    onSuccess: refresh,
  })
  const removeMember = useMutation({
    mutationFn: (userId: string) => removeCampaignMember(campaignId, userId),
    onSuccess: refresh,
  })
  const leaveCampaign = useMutation({
    mutationFn: () => removeCampaignMember(campaignId, identity!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      navigate('/')
    },
  })
  const publishAnnouncement = useMutation({
    mutationFn: () =>
      createAnnouncement({
        authorId: identity!.id,
        body: announcement.body,
        campaignId,
        isPinned: announcement.isPinned,
        title: announcement.title,
      }),
    onSuccess: async () => {
      setAnnouncement({ title: '', body: '', isPinned: false })
      await queryClient.invalidateQueries({
        queryKey: ['announcements', campaignId],
      })
    },
  })
  const removeAnnouncement = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['announcements', campaignId],
      }),
  })
  const sendInvitation = useMutation({
    mutationFn: () =>
      createCampaignInvitation({
        campaignId,
        email: invitation.email,
        invitedBy: identity!.id,
        role: invitation.role,
      }),
    onSuccess: async () => {
      setInvitation({ email: '', role: 'player' })
      await queryClient.invalidateQueries({
        queryKey: ['campaign-invitations', campaignId],
      })
    },
  })
  const cancelInvitation = useMutation({
    mutationFn: cancelCampaignInvitation,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['campaign-invitations', campaignId],
      }),
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
        {campaign.data &&
          (() => {
            const isOwner = campaign.data.owner_id === identity?.id
            const currentMembership = campaign.data.campaign_members.find(
              (member) => member.user_id === identity?.id,
            )
            const isManager =
              isOwner || currentMembership?.role === 'game_master'
            return (
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
                    {isOwner && (
                      <button
                        className="secondary-button"
                        disabled={rotateCode.isPending}
                        onClick={() => rotateCode.mutate()}
                      >
                        Rotate code
                      </button>
                    )}
                  </div>
                </section>

                <section className="announcements-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Campaign news</p>
                      <h2>Announcements</h2>
                    </div>
                  </div>
                  {isManager && (
                    <form
                      className="announcement-form"
                      onSubmit={(event: FormEvent) => {
                        event.preventDefault()
                        publishAnnouncement.mutate()
                      }}
                    >
                      <input
                        required
                        maxLength={160}
                        placeholder="Announcement title"
                        value={announcement.title}
                        onChange={(event) =>
                          setAnnouncement({
                            ...announcement,
                            title: event.target.value,
                          })
                        }
                      />
                      <textarea
                        required
                        maxLength={5000}
                        rows={3}
                        placeholder="What should the party know?"
                        value={announcement.body}
                        onChange={(event) =>
                          setAnnouncement({
                            ...announcement,
                            body: event.target.value,
                          })
                        }
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={announcement.isPinned}
                          onChange={(event) =>
                            setAnnouncement({
                              ...announcement,
                              isPinned: event.target.checked,
                            })
                          }
                        />{' '}
                        Pin this announcement
                      </label>
                      <button disabled={publishAnnouncement.isPending}>
                        Publish
                      </button>
                    </form>
                  )}
                  <div className="announcement-list">
                    {announcements.data?.map((item) => (
                      <article key={item.id}>
                        <div className="campaign-card-meta">
                          <span>
                            {item.is_pinned ? 'Pinned' : 'Announcement'}
                          </span>
                          <span>
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                        <small>
                          Posted by{' '}
                          {item.profiles?.display_name ?? 'Game Master'}
                        </small>
                        {isManager && (
                          <button
                            className="danger-button"
                            onClick={() => removeAnnouncement.mutate(item.id)}
                          >
                            Delete
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                </section>

                {isManager && (
                  <section className="workspace-panel invitation-admin">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">Grow the party</p>
                        <h2>Direct invitations</h2>
                      </div>
                    </div>
                    <form
                      onSubmit={(event: FormEvent) => {
                        event.preventDefault()
                        sendInvitation.mutate()
                      }}
                    >
                      <label>
                        Email address
                        <input
                          type="email"
                          required
                          maxLength={320}
                          value={invitation.email}
                          onChange={(event) =>
                            setInvitation({
                              ...invitation,
                              email: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Role
                        <select
                          value={invitation.role}
                          onChange={(event) =>
                            setInvitation({
                              ...invitation,
                              role: event.target.value,
                            })
                          }
                        >
                          <option value="player">Player</option>
                          <option value="game_master">Game Master</option>
                          <option value="observer">Observer</option>
                        </select>
                      </label>
                      <button disabled={sendInvitation.isPending}>
                        Create invitation
                      </button>
                    </form>
                    {sendInvitation.isSuccess && (
                      <p className="form-message success">
                        Invitation created. It will appear when that email signs
                        in.
                      </p>
                    )}
                    <div className="invitation-list">
                      {invitations.data?.map((item) => (
                        <article key={item.id}>
                          <div>
                            <strong>{item.invited_email}</strong>
                            <span>
                              {item.role.replace('_', ' ')} · {item.status}
                            </span>
                          </div>
                          {item.status === 'pending' && (
                            <button
                              className="danger-button"
                              onClick={() => cancelInvitation.mutate(item.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                )}

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
                          {isOwner &&
                            member.user_id !== campaign.data.owner_id && (
                              <div className="member-admin">
                                <select
                                  aria-label={`Role for ${member.profiles?.display_name ?? 'member'}`}
                                  value={member.role}
                                  onChange={(event) =>
                                    changeRole.mutate({
                                      userId: member.user_id,
                                      role: event.target.value,
                                    })
                                  }
                                >
                                  <option value="game_master">
                                    Game Master
                                  </option>
                                  <option value="player">Player</option>
                                  <option value="observer">Observer</option>
                                </select>
                                <button
                                  className="danger-button"
                                  onClick={() =>
                                    removeMember.mutate(member.user_id)
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="workspace-panel">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">Ready to adventure</p>
                        <h2>Party characters</h2>
                      </div>
                    </div>
                    <div className="member-list">
                      {characters.data?.length === 0 && (
                        <p className="muted-copy">
                          No characters have joined this campaign yet.
                        </p>
                      )}
                      {characters.data?.map((character) => (
                        <Link
                          className="party-character"
                          key={character.id}
                          to={`/characters/${character.id}`}
                        >
                          <div className="member-avatar">
                            {character.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <strong>{character.name}</strong>
                            <span>
                              Level {character.level}{' '}
                              {character.class_name || 'adventurer'} ·{' '}
                              {character.current_hp}/{character.max_hp} HP
                            </span>
                          </div>
                        </Link>
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
                    <Link
                      className="card-link"
                      to={`/campaigns/${campaignId}/schedule`}
                    >
                      Open scheduling <CalendarDays size={17} />
                    </Link>
                  </section>

                  {isOwner ? (
                    <section className="workspace-panel campaign-settings">
                      <div className="section-heading">
                        <div>
                          <p className="eyebrow">Administration</p>
                          <h2>Campaign settings</h2>
                        </div>
                      </div>
                      <form
                        onSubmit={(event: FormEvent) => {
                          event.preventDefault()
                          saveSettings.mutate()
                        }}
                      >
                        <label>
                          Name
                          <input
                            required
                            maxLength={100}
                            value={settings.name}
                            onChange={(event) =>
                              setSettings({
                                ...settings,
                                name: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Description
                          <textarea
                            rows={4}
                            maxLength={2000}
                            value={settings.description}
                            onChange={(event) =>
                              setSettings({
                                ...settings,
                                description: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Timezone
                          <input
                            required
                            maxLength={100}
                            value={settings.timezone}
                            onChange={(event) =>
                              setSettings({
                                ...settings,
                                timezone: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Cadence
                          <select
                            value={settings.cadence}
                            onChange={(event) =>
                              setSettings({
                                ...settings,
                                cadence: event.target.value,
                              })
                            }
                          >
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Biweekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="irregular">Irregular</option>
                          </select>
                        </label>
                        <label>
                          Preferred session length (minutes)
                          <input
                            type="number"
                            min="30"
                            max="720"
                            step="15"
                            value={settings.preferredSessionMinutes}
                            onChange={(event) =>
                              setSettings({
                                ...settings,
                                preferredSessionMinutes: Number(
                                  event.target.value,
                                ),
                              })
                            }
                          />
                        </label>
                        <label>
                          Status
                          <select
                            value={settings.status}
                            onChange={(event) =>
                              setSettings({
                                ...settings,
                                status: event.target.value,
                              })
                            }
                          >
                            <option value="forming">Forming</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                          </select>
                        </label>
                        {saveSettings.isSuccess && (
                          <p className="form-message success">
                            Campaign settings saved.
                          </p>
                        )}
                        <button disabled={saveSettings.isPending}>
                          {saveSettings.isPending ? 'Saving…' : 'Save settings'}
                        </button>
                      </form>
                    </section>
                  ) : (
                    <section className="workspace-panel">
                      <p className="eyebrow">Membership</p>
                      <h2>Leave campaign</h2>
                      <p className="muted-copy">
                        Your characters remain yours but will no longer be
                        visible to this party.
                      </p>
                      <button
                        className="danger-button"
                        disabled={leaveCampaign.isPending}
                        onClick={() => leaveCampaign.mutate()}
                      >
                        Leave campaign
                      </button>
                    </section>
                  )}
                </div>
              </>
            )
          })()}
      </section>
    </main>
  )
}
