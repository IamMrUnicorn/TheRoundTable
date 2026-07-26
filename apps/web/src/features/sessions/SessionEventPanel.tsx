import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { supabase } from '../../lib/supabase'
import { ActionProposalPanel } from '../actions/ActionProposalPanel'
import { AttackResolutionPanel } from '../actions/AttackResolutionPanel'
import { ReactionPromptPanel } from '../actions/ReactionPromptPanel'
import { CombatHealthPanel } from '../combat/CombatHealthPanel'
import { CombatStatusPanel } from '../combat/CombatStatusPanel'
import { InitiativePanel } from '../combat/InitiativePanel'
import { TurnOrderStrip } from '../combat/TurnOrderStrip'
import { DiceRollerPanel } from '../dice/DiceRollerPanel'
import { updateSession } from '../scheduling/scheduling'
import { createSessionEvent, listSessionEvents } from './session-events'

const eventKinds = [
  'narration',
  'dialogue',
  'action',
  'roll',
  'damage',
  'healing',
  'condition',
  'item',
  'discovery',
  'location',
  'objective',
  'rest',
  'note',
] as const

type WorkspaceView = 'actions' | 'combat' | 'log'

export function SessionEventPanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
  sessionStatus,
}: {
  actorId: string
  campaignId: number
  characters: {
    ancestry: string
    armor_class: number
    charisma: number
    class_name: string
    combat_state: string
    concentration: string
    conditions: string[]
    constitution: number
    current_hp: number
    death_save_failures: number
    death_save_successes: number
    dexterity: number
    id: number
    intelligence: number
    level: number
    max_hp: number
    name: string
    owner_id: string
    saving_throw_proficiencies: string[]
    speed: number
    skill_expertise: string[]
    skill_proficiencies: string[]
    strength: number
    temporary_hp: number
    wisdom: number
  }[]
  isManager: boolean
  sessionId: number
  sessionStatus: string
}) {
  const client = useQueryClient()
  const queryKey = ['session-events', sessionId]
  const events = useQuery({
    queryKey,
    queryFn: () => listSessionEvents(sessionId),
  })
  const [kind, setKind] = useState<(typeof eventKinds)[number]>('narration')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [characterId, setCharacterId] = useState('')
  const [visibility, setVisibility] = useState('party')
  const [inWorldTime, setInWorldTime] = useState('')
  const [location, setLocation] = useState('')
  const [filterKind, setFilterKind] = useState('all')
  const [filterCharacter, setFilterCharacter] = useState('all')
  const [search, setSearch] = useState('')
  const [connection, setConnection] = useState('connecting')
  const [activeView, setActiveView] = useState<WorkspaceView>(() => {
    const saved = window.localStorage.getItem('round-table:play-workspace')
    return saved === 'combat' || saved === 'log' ? saved : 'actions'
  })
  const availableCharacters = isManager
    ? characters
    : characters.filter((character) => character.owner_id === actorId)
  const create = useMutation({
    mutationFn: () =>
      createSessionEvent({
        actor_id: actorId,
        campaign_id: campaignId,
        session_id: sessionId,
        character_id: characterId ? Number(characterId) : null,
        kind,
        visibility,
        title: title.trim(),
        body: body.trim(),
        in_world_time: inWorldTime.trim(),
        location: location.trim(),
      }),
    onSuccess: async () => {
      setTitle('')
      setBody('')
      await Promise.all([
        client.invalidateQueries({ queryKey }),
        characterId
          ? client.invalidateQueries({
              queryKey: ['character-memories', Number(characterId)],
            })
          : Promise.resolve(),
      ])
    },
  })
  const lifecycle = useMutation({
    mutationFn: (status: string) => updateSession(sessionId, { status }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['next-campaign-session', campaignId],
        }),
        client.invalidateQueries({
          queryKey: ['campaign-session-history', campaignId],
        }),
        client.invalidateQueries({ queryKey: ['session', sessionId] }),
        client.invalidateQueries({ queryKey: ['upcoming-sessions'] }),
      ])
    },
  })
  useEffect(() => {
    window.localStorage.setItem('round-table:play-workspace', activeView)
  }, [activeView])
  useEffect(() => {
    const channel = supabase
      .channel(`session-events:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_events',
          filter: `session_id=eq.${sessionId}`,
        },
        () =>
          void client.invalidateQueries({
            queryKey: ['session-events', sessionId],
          }),
      )
      .subscribe((status) =>
        setConnection(status === 'SUBSCRIBED' ? 'live' : status.toLowerCase()),
      )
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [client, sessionId])
  const shownEvents = events.data?.filter(
    (event) =>
      (filterKind === 'all' || event.kind === filterKind) &&
      (filterCharacter === 'all' ||
        String(event.character_id ?? 'none') === filterCharacter) &&
      `${event.title} ${event.body} ${event.actor?.display_name ?? ''} ${event.character?.name ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )

  return (
    <section className="workspace-panel session-event-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live record</p>
          <h2>
            {activeView === 'actions'
              ? 'Action workspace'
              : activeView === 'combat'
                ? 'Party and combat'
                : 'Session event log'}
          </h2>
        </div>
        <div className="session-log-status">
          <span className={`connection-status ${connection}`}>
            {connection}
          </span>
          <span>{events.data?.length ?? 0} events</span>
          {isManager &&
            sessionStatus !== 'active' &&
            sessionStatus !== 'completed' && (
              <button
                type="button"
                disabled={lifecycle.isPending}
                onClick={() => lifecycle.mutate('active')}
              >
                Start session
              </button>
            )}
          {isManager && sessionStatus === 'active' && (
            <>
              <button
                type="button"
                className="secondary-button"
                disabled={lifecycle.isPending}
                onClick={() => lifecycle.mutate('paused')}
              >
                Pause
              </button>
              <button
                type="button"
                disabled={lifecycle.isPending}
                onClick={() => lifecycle.mutate('completed')}
              >
                End session
              </button>
            </>
          )}
          {isManager && sessionStatus === 'paused' && (
            <>
              <button
                type="button"
                disabled={lifecycle.isPending}
                onClick={() => lifecycle.mutate('active')}
              >
                Resume
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={lifecycle.isPending}
                onClick={() => lifecycle.mutate('completed')}
              >
                End session
              </button>
            </>
          )}
        </div>
      </div>
      <TurnOrderStrip characters={characters} sessionId={sessionId} />
      <div className="play-table-layout">
        <aside className="table-notebook-panel">
          <div>
            <p className="eyebrow">Table notebook</p>
            <h3>Notes & whiteboard</h3>
          </div>
          <div
            className="table-wip-canvas"
            aria-label="Shared whiteboard planned"
          >
            <span>Shared whiteboard</span>
            <small>WIP · table notes remain available in the campaign</small>
          </div>
          <div className="notebook-shortcuts">
            <span>Session notes</span>
            <span>Weapons</span>
            <span>Inventory</span>
            <span>New page</span>
          </div>
        </aside>
        <nav className="play-workspace-tabs" aria-label="Live session tools">
          {(['actions', 'combat', 'log'] as WorkspaceView[]).map((view) => (
            <button
              type="button"
              key={view}
              className={activeView === view ? 'active' : ''}
              aria-pressed={activeView === view}
              onClick={() => setActiveView(view)}
            >
              {view === 'actions'
                ? 'Actions & dice'
                : view === 'combat'
                  ? 'Party & combat'
                  : `Session log (${events.data?.length ?? 0})`}
            </button>
          ))}
        </nav>
        <aside className="live-party-rail" aria-label="Party status">
          <header>
            <p className="eyebrow">At the table</p>
            <h3>Party status</h3>
          </header>
          {characters.map((character) => (
            <Link key={character.id} to={`/characters/${character.id}`}>
              <span className="member-avatar">
                {character.name.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{character.name}</strong>
                <small>
                  Level {character.level} {character.ancestry}{' '}
                  {character.class_name} · AC {character.armor_class} · Speed{' '}
                  {character.speed} ft
                </small>
                <small>
                  {character.current_hp}/{character.max_hp} HP
                  {character.temporary_hp > 0 &&
                    ` · ${character.temporary_hp} temp`}
                </small>
                {(character.conditions.length > 0 ||
                  character.concentration) && (
                  <small className="party-card-status">
                    {character.conditions.join(', ') || 'healthy'}
                    {character.concentration &&
                      ` · concentrating: ${character.concentration}`}
                  </small>
                )}
              </span>
              <progress
                aria-label={`${character.name} hit points`}
                max={character.max_hp || 1}
                value={character.current_hp}
              />
            </Link>
          ))}
        </aside>
        {activeView === 'actions' && (
          <div className="play-workspace-view">
            <DiceRollerPanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
            <AttackResolutionPanel
              actorId={actorId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
            <ActionProposalPanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
            <ReactionPromptPanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
          </div>
        )}
        {activeView === 'combat' && (
          <div className="play-workspace-view">
            <InitiativePanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
            <CombatHealthPanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
              sessionStatus={sessionStatus}
            />
            <CombatStatusPanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
              sessionStatus={sessionStatus}
            />
          </div>
        )}
        {activeView === 'log' && (
          <div className="play-workspace-view">
            <form
              className="session-event-form"
              onSubmit={(event: FormEvent) => {
                event.preventDefault()
                create.mutate()
              }}
            >
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value as typeof kind)}
              >
                {eventKinds.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                value={characterId}
                onChange={(event) => setCharacterId(event.target.value)}
              >
                <option value="">No linked character</option>
                {availableCharacters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
              >
                <option value="party">Party visible</option>
                {isManager && <option value="gm_only">GM only</option>}
              </select>
              <input
                required
                maxLength={160}
                placeholder="Concise event summary"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <input
                maxLength={160}
                placeholder="In-world time"
                value={inWorldTime}
                onChange={(event) => setInWorldTime(event.target.value)}
              />
              <input
                maxLength={160}
                placeholder="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
              <textarea
                rows={3}
                maxLength={10000}
                placeholder="Details, outcome, dialogue, or context"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
              <button disabled={create.isPending || !title.trim()}>
                {create.isPending ? 'Recording…' : 'Record event'}
              </button>
            </form>
            {create.isError && (
              <p className="form-error">The event could not be recorded.</p>
            )}
            {events.isLoading && (
              <p className="muted-copy">Opening the session record…</p>
            )}
            {events.data?.length === 0 && (
              <p className="muted-copy">Nothing has happened yet.</p>
            )}
            <div className="session-event-filters">
              <input
                aria-label="Search session events"
                placeholder="Search the log…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                aria-label="Filter event type"
                value={filterKind}
                onChange={(event) => setFilterKind(event.target.value)}
              >
                <option value="all">All event types</option>
                {eventKinds.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                aria-label="Filter event character"
                value={filterCharacter}
                onChange={(event) => setFilterCharacter(event.target.value)}
              >
                <option value="all">All participants</option>
                <option value="none">No character</option>
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="session-event-list">
              {shownEvents?.length === 0 &&
                events.data &&
                events.data.length > 0 && (
                  <p className="muted-copy">No events match these filters.</p>
                )}
              {shownEvents?.map((event) => (
                <article key={event.id}>
                  <div>
                    <span>
                      {event.kind} · {event.visibility}
                    </span>
                    <h3>{event.title}</h3>
                    {event.body && <p>{event.body}</p>}
                  </div>
                  <footer>
                    <span>
                      {new Date(event.occurred_at).toLocaleTimeString()}
                    </span>
                    <span>By {event.actor?.display_name ?? 'Unknown'}</span>
                    {event.character?.name && (
                      <span>For {event.character.name}</span>
                    )}
                    {event.in_world_time && (
                      <span>In-world: {event.in_world_time}</span>
                    )}
                    {event.location && <span>At {event.location}</span>}
                  </footer>
                </article>
              ))}
            </div>
          </div>
        )}
        <aside className="table-media-panel">
          <div>
            <p className="eyebrow">Shared atmosphere</p>
            <h3>Media player</h3>
          </div>
          <div className="media-player-wip">
            <span aria-hidden="true">♪</span>
            <div>
              <strong>No shared track</strong>
              <small>WIP · synchronized campaign audio</small>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
