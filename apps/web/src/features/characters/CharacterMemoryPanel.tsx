import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import {
  createCharacterMemory,
  deleteCharacterMemory,
  listCharacterMemories,
  updateCharacterMemory,
} from './memories'
import { CharacterInventoryPanel } from './CharacterInventoryPanel'

const kinds = [
  'note',
  'item',
  'relationship',
  'location',
  'discovery',
  'objective',
  'damage',
  'healing',
  'rest',
  'condition',
  'roll',
  'action',
  'other',
] as const

export function CharacterMemoryPanel({
  canEdit,
  campaignId,
  characterId,
  userId,
}: {
  canEdit: boolean
  campaignId: number | null
  characterId: number
  userId: string
}) {
  const client = useQueryClient()
  const queryKey = ['character-memories', characterId]
  const memories = useQuery({
    queryKey,
    queryFn: () => listCharacterMemories(characterId),
  })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [kind, setKind] = useState<(typeof kinds)[number]>('note')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [inWorldTime, setInWorldTime] = useState('')
  const [location, setLocation] = useState('')
  const [source, setSource] = useState('')
  const [tags, setTags] = useState('')
  const refresh = () => client.invalidateQueries({ queryKey })
  const create = useMutation({
    mutationFn: () =>
      createCharacterMemory({
        character_id: characterId,
        created_by: userId,
        campaign_id: campaignId,
        kind,
        title: title.trim(),
        summary: summary.trim(),
        visibility,
        in_world_time: inWorldTime.trim(),
        location: location.trim(),
        source_name: source.trim(),
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    onSuccess: async () => {
      setTitle('')
      setSummary('')
      setInWorldTime('')
      setLocation('')
      setSource('')
      setTags('')
      await refresh()
    },
  })
  const update = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number
      updates: { is_pinned?: boolean; visibility?: string }
    }) => updateCharacterMemory(id, updates),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: deleteCharacterMemory,
    onSuccess: refresh,
  })
  const shown = memories.data?.filter(
    (memory) =>
      (filter === 'all' || memory.kind === filter) &&
      `${memory.title} ${memory.summary} ${memory.location} ${memory.source_name} ${memory.tags.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )

  return (
    <section className="structured-memory-panel">
      <CharacterInventoryPanel canEdit={canEdit} characterId={characterId} />
      <div className="memory-toolbar">
        <input
          aria-label="Search memories"
          placeholder="Search memories…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          aria-label="Filter memory type"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All types</option>
          {kinds.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      {canEdit && (
        <form
          className="memory-create-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            create.mutate()
          }}
        >
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as typeof kind)}
          >
            {kinds.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <input
            required
            maxLength={160}
            placeholder="What should be remembered?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
          >
            <option value="private">Private</option>
            <option value="shared">Shared with party</option>
          </select>
          <input
            maxLength={160}
            placeholder="In-world date/time"
            value={inWorldTime}
            onChange={(event) => setInWorldTime(event.target.value)}
          />
          <input
            maxLength={160}
            placeholder="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <input
            maxLength={160}
            placeholder="Source or person"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
          <input
            maxLength={2000}
            placeholder="Tags, comma separated"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
          <textarea
            className="memory-summary-field"
            rows={4}
            maxLength={5000}
            placeholder="Details and context"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
          <button disabled={create.isPending || !title.trim()}>
            {create.isPending ? 'Remembering…' : 'Add memory'}
          </button>
        </form>
      )}
      {memories.isLoading && <p className="muted-copy">Opening memories…</p>}
      {shown?.length === 0 && (
        <p className="empty-feature-copy">No memories match this view.</p>
      )}
      <div className="memory-timeline">
        {shown?.map((memory) => (
          <article key={memory.id} className={memory.is_pinned ? 'pinned' : ''}>
            <header>
              <div>
                <span>
                  {memory.kind} · {memory.visibility}
                </span>
                <h3>{memory.title}</h3>
              </div>
              {canEdit && (
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      update.mutate({
                        id: memory.id,
                        updates: { is_pinned: !memory.is_pinned },
                      })
                    }
                  >
                    {memory.is_pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      update.mutate({
                        id: memory.id,
                        updates: {
                          visibility:
                            memory.visibility === 'private'
                              ? 'shared'
                              : 'private',
                        },
                      })
                    }
                  >
                    {memory.visibility === 'private' ? 'Share' : 'Make private'}
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => remove.mutate(memory.id)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </header>
            {memory.summary && <p>{memory.summary}</p>}
            <footer>
              <span>{new Date(memory.occurred_at).toLocaleString()}</span>
              {memory.in_world_time && (
                <span>In-world: {memory.in_world_time}</span>
              )}
              {memory.location && <span>At {memory.location}</span>}
              {memory.source_name && <span>From {memory.source_name}</span>}
            </footer>
            {memory.tags.length > 0 && (
              <div className="memory-tags">
                {memory.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
