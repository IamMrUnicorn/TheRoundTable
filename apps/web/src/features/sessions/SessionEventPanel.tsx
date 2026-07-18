import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

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

export function SessionEventPanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
}: {
  actorId: string
  campaignId: number
  characters: { id: number; name: string; owner_id: string }[]
  isManager: boolean
  sessionId: number
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

  return (
    <section className="workspace-panel session-event-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live record</p>
          <h2>Session event log</h2>
        </div>
        <span>{events.data?.length ?? 0} events</span>
      </div>
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
      <div className="session-event-list">
        {events.data?.map((event) => (
          <article key={event.id}>
            <div>
              <span>
                {event.kind} · {event.visibility}
              </span>
              <h3>{event.title}</h3>
              {event.body && <p>{event.body}</p>}
            </div>
            <footer>
              <span>{new Date(event.occurred_at).toLocaleTimeString()}</span>
              <span>By {event.actor?.display_name ?? 'Unknown'}</span>
              {event.character?.name && <span>For {event.character.name}</span>}
              {event.in_world_time && (
                <span>In-world: {event.in_world_time}</span>
              )}
              {event.location && <span>At {event.location}</span>}
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
