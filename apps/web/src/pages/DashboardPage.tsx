import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  Dices,
  KeyRound,
  Plus,
  Shield,
  UserRound,
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
import {
  createCharacter,
  listOwnedCharacters,
} from '../features/characters/characters'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../features/notifications/notifications'
import {
  listMyInvitations,
  respondCampaignInvitation,
} from '../features/invitations/invitations'

type Panel = 'character' | 'create' | 'join' | null

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
  const [characterName, setCharacterName] = useState('')
  const [ancestry, setAncestry] = useState('')
  const [className, setClassName] = useState('')
  const [characterCampaign, setCharacterCampaign] = useState('')

  const campaigns = useQuery({
    queryKey: ['campaigns', identity?.id],
    queryFn: () => listCampaigns(identity!.id),
    enabled: Boolean(identity),
  })
  const characters = useQuery({
    queryKey: ['characters', identity?.id],
    queryFn: () => listOwnedCharacters(identity!.id),
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
  const characterMutation = useMutation({
    mutationFn: () =>
      createCharacter({
        ancestry,
        campaignId: characterCampaign ? Number(characterCampaign) : null,
        className,
        name: characterName,
        ownerId: identity!.id,
      }),
    onSuccess: async (character) => {
      await queryClient.invalidateQueries({ queryKey: ['characters'] })
      navigate(`/characters/${character.id}`)
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
      await queryClient.invalidateQueries({ queryKey: ['invitations'] })
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] })
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
        <div className="heading-actions">
          <Link className="text-link" to="/profile">
            Profile
          </Link>
          <button className="secondary-button" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
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
              onClick={() => setPanel('character')}
            >
              <UserRound aria-hidden="true" size={18} /> New character
            </button>
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
            ) : panel === 'join' ? (
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
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  if (characterName.trim()) characterMutation.mutate()
                }}
              >
                <div>
                  <p className="eyebrow">New hero</p>
                  <h2>Create a character</h2>
                </div>
                <label htmlFor="character-name">Character name</label>
                <input
                  id="character-name"
                  maxLength={80}
                  required
                  value={characterName}
                  onChange={(event) => setCharacterName(event.target.value)}
                  placeholder="Seraphina Dawn"
                />
                <label htmlFor="ancestry">Ancestry</label>
                <input
                  id="ancestry"
                  maxLength={80}
                  value={ancestry}
                  onChange={(event) => setAncestry(event.target.value)}
                  placeholder="Human, Elf, Dwarf…"
                />
                <label htmlFor="class-name">Class</label>
                <input
                  id="class-name"
                  maxLength={80}
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                  placeholder="Fighter, Wizard, Cleric…"
                />
                <label htmlFor="character-campaign">
                  Campaign <span>(optional)</span>
                </label>
                <select
                  id="character-campaign"
                  value={characterCampaign}
                  onChange={(event) => setCharacterCampaign(event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {campaigns.data?.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
                {characterMutation.isError && (
                  <p className="form-message error">
                    {errorMessage(characterMutation.error)}
                  </p>
                )}
                <button disabled={characterMutation.isPending}>
                  {characterMutation.isPending
                    ? 'Creating…'
                    : 'Create character'}
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

        <section className="campaign-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your heroes</p>
              <h2>Characters</h2>
            </div>
            <span>{characters.data?.length ?? 0} characters</span>
          </div>
          {characters.isLoading && (
            <p className="muted-copy">Gathering your characters…</p>
          )}
          {characters.data?.length === 0 && (
            <div className="empty-state">
              <UserRound aria-hidden="true" />
              <h3>No characters yet.</h3>
              <p>Create a hero and assign them to one of your campaigns.</p>
            </div>
          )}
          <div className="campaign-grid">
            {characters.data?.map((character) => (
              <Link
                className="campaign-card character-card"
                key={character.id}
                to={`/characters/${character.id}`}
              >
                <div className="campaign-card-meta">
                  <span>
                    <UserRound size={15} /> Level {character.level}
                  </span>
                  <span>{character.class_name || 'Unclassed'}</span>
                </div>
                <h3>{character.name}</h3>
                <p>
                  {character.ancestry || 'Unknown ancestry'} ·{' '}
                  {character.current_hp}/{character.max_hp} HP · AC{' '}
                  {character.armor_class}
                </p>
                <span className="card-link">
                  Open character sheet <ArrowRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="campaign-section notification-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">What changed</p>
              <h2>Notifications</h2>
            </div>
            {notifications.data?.some((item) => !item.read_at) && (
              <button
                className="secondary-button"
                onClick={() => readAllNotifications.mutate()}
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.data?.length === 0 && (
            <p className="muted-copy">You are all caught up.</p>
          )}
          <div className="notification-list">
            {notifications.data?.map((item) => (
              <article className={item.read_at ? 'is-read' : ''} key={item.id}>
                <div>
                  <span>{item.kind.replace('_', ' ')}</span>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <small>{new Date(item.created_at).toLocaleString()}</small>
                </div>
                {!item.read_at && (
                  <button
                    className="secondary-button"
                    onClick={() => readNotification.mutate(item.id)}
                  >
                    Mark read
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        {Boolean(invitations.data?.length) && (
          <section className="campaign-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Your invitations</p>
                <h2>Join a new table</h2>
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
