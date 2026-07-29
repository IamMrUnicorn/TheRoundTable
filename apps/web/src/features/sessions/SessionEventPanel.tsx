import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Crosshair,
  Dices,
  MessageSquare,
  ScrollText,
  Skull,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'
import { ActionProposalPanel } from '../actions/ActionProposalPanel'
import { AttackResolutionPanel } from '../actions/AttackResolutionPanel'
import { ReactionPromptPanel } from '../actions/ReactionPromptPanel'
import { CombatHealthPanel } from '../combat/CombatHealthPanel'
import { CombatStatusPanel } from '../combat/CombatStatusPanel'
import { InitiativePanel } from '../combat/InitiativePanel'
import { MonsterCombatDrawer } from '../combat/MonsterCombatDrawer'
import { TurnActionBar } from '../combat/TurnActionBar'
import { TurnOrderStrip } from '../combat/TurnOrderStrip'
import { type Character } from '../characters/characters'
import { PlayCharacterDrawer } from '../characters/PlayCharacterDrawer'
import { DiceRollerPanel } from '../dice/DiceRollerPanel'
import { updateSession } from '../scheduling/scheduling'
import { PlayToolDrawer } from './PlayToolDrawer'
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
type ActionTool = 'attack' | 'dice' | 'monsters' | 'proposal'

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
  characters: Character[]
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
  const [sheetCharacterId, setSheetCharacterId] = useState<number | null>(null)
  const [actionTool, setActionTool] = useState<ActionTool | null>(null)
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
  const sheetCharacter = characters.find(
    (character) => character.id === sheetCharacterId,
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
            <button
              type="button"
              className="live-party-card"
              key={character.id}
              onClick={() => setSheetCharacterId(character.id)}
            >
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
            </button>
          ))}
        </aside>
        {activeView === 'actions' && (
          <div className="play-workspace-view">
            <section className="action-palette">
              <header>
                <div>
                  <p className="eyebrow">Action bar</p>
                  <h3>What do you want to do?</h3>
                </div>
                <span>Focused tools open beside the table</span>
              </header>
              <div>
                <button type="button" onClick={() => setActionTool('attack')}>
                  <Crosshair />
                  <span>
                    <strong>Attack</strong>
                    <small>Equipped weapon or custom strike</small>
                  </span>
                </button>
                <button type="button" onClick={() => setActionTool('dice')}>
                  <Dices />
                  <span>
                    <strong>Roll</strong>
                    <small>Checks, saves, skills, or any formula</small>
                  </span>
                </button>
                <button type="button" onClick={() => setActionTool('proposal')}>
                  <MessageSquare />
                  <span>
                    <strong>Other action</strong>
                    <small>Magic, items, movement, speech, or intent</small>
                  </span>
                </button>
                <button type="button" onClick={() => setActiveView('log')}>
                  <ScrollText />
                  <span>
                    <strong>Full log</strong>
                    <small>Search, filter, and record events</small>
                  </span>
                </button>
                {isManager && (
                  <button
                    type="button"
                    onClick={() => setActionTool('monsters')}
                  >
                    <Skull />
                    <span>
                      <strong>Monsters</strong>
                      <small>HP, visibility, and turn resources</small>
                    </span>
                  </button>
                )}
              </div>
            </section>
            <ReactionPromptPanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
            <section className="central-activity-feed">
              <header>
                <div>
                  <p className="eyebrow">Shared stage</p>
                  <h3>Recent activity</h3>
                </div>
                <button type="button" onClick={() => setActiveView('log')}>
                  Open complete log
                </button>
              </header>
              <div>
                {events.data?.slice(0, 6).map((event) => (
                  <article key={event.id}>
                    <span>{event.kind}</span>
                    <div>
                      <strong>{event.title}</strong>
                      <small>
                        {event.character?.name ||
                          event.actor?.display_name ||
                          'The table'}{' '}
                        · {new Date(event.occurred_at).toLocaleTimeString()}
                      </small>
                    </div>
                  </article>
                ))}
                {events.data?.length === 0 && (
                  <p className="muted-copy">
                    The shared stage is quiet. Choose an action to begin.
                  </p>
                )}
              </div>
            </section>
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
              <label className="play-field">
                Event type
                <select
                  value={kind}
                  onChange={(event) =>
                    setKind(event.target.value as typeof kind)
                  }
                >
                  {eventKinds.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="play-field">
                Related character
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
              </label>
              <label className="play-field">
                Visibility
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                >
                  <option value="party">Entire party</option>
                  {isManager && (
                    <option value="gm_only">Game Master only</option>
                  )}
                </select>
              </label>
              <label className="play-field">
                Event summary
                <input
                  required
                  maxLength={160}
                  placeholder="The bridge collapsed"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label className="play-field">
                In-world time
                <input
                  maxLength={160}
                  placeholder="14 Emberfall, midnight"
                  value={inWorldTime}
                  onChange={(event) => setInWorldTime(event.target.value)}
                />
              </label>
              <label className="play-field">
                Location
                <input
                  maxLength={160}
                  placeholder="The Sunken Library"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </label>
              <label className="play-field session-event-details-field">
                Details, outcome, dialogue, or context
                <textarea
                  rows={3}
                  maxLength={10000}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </label>
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
              <label className="play-field">
                Search events
                <input
                  placeholder="Title, detail, actor, or character"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label className="play-field">
                Event type filter
                <select
                  value={filterKind}
                  onChange={(event) => setFilterKind(event.target.value)}
                >
                  <option value="all">All event types</option>
                  {eventKinds.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="play-field">
                Character filter
                <select
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
              </label>
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
        <TurnActionBar
          actorId={actorId}
          characters={characters}
          isManager={isManager}
          onOpenTool={setActiveView}
          sessionId={sessionId}
        />
      </div>
      {sheetCharacter && (
        <PlayCharacterDrawer
          actorId={actorId}
          character={sheetCharacter}
          onClose={() => setSheetCharacterId(null)}
        />
      )}
      {actionTool && (
        <PlayToolDrawer
          title={
            actionTool === 'attack'
              ? 'Resolve an attack'
              : actionTool === 'dice'
                ? 'Roll dice'
                : actionTool === 'monsters'
                  ? 'Monster combat console'
                  : 'Declare an action'
          }
          description={
            actionTool === 'attack'
              ? 'Choose a character, equipped weapon, and encounter target.'
              : actionTool === 'dice'
                ? 'Use character shortcuts or enter a custom dice formula.'
                : actionTool === 'monsters'
                  ? 'Control non-player combatants without leaving the shared stage.'
                  : 'Send ordinary or exceptional intent to the shared table.'
          }
          onClose={() => setActionTool(null)}
        >
          {actionTool === 'dice' && (
            <DiceRollerPanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
          )}
          {actionTool === 'attack' && (
            <AttackResolutionPanel
              actorId={actorId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
          )}
          {actionTool === 'proposal' && (
            <ActionProposalPanel
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              isManager={isManager}
              sessionId={sessionId}
            />
          )}
          {actionTool === 'monsters' && (
            <MonsterCombatDrawer
              actorId={actorId}
              campaignId={campaignId}
              characters={characters}
              sessionId={sessionId}
            />
          )}
        </PlayToolDrawer>
      )}
    </section>
  )
}
