import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  LockKeyhole,
  Map,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import {
  createCampaignReference,
  deleteCampaignReference,
  listCampaignReferences,
  updateCampaignReference,
} from './references'

const blank = {
  details: '',
  isSecret: false,
  kind: 'npc',
  name: '',
  status: 'active',
  summary: '',
  tags: '',
}

export function CampaignReferencesPanel({
  campaignId,
  isManager,
  userId,
}: {
  campaignId: number
  isManager: boolean
  userId: string
}) {
  const client = useQueryClient()
  const [draft, setDraft] = useState(blank)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const references = useQuery({
    queryKey: ['campaign-references', campaignId],
    queryFn: () => listCampaignReferences(campaignId),
  })
  const refresh = () =>
    client.invalidateQueries({ queryKey: ['campaign-references', campaignId] })
  const create = useMutation({
    mutationFn: () =>
      createCampaignReference({ ...draft, campaignId, createdBy: userId }),
    onSuccess: async () => {
      setDraft(blank)
      await refresh()
    },
  })
  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateCampaignReference(id, { status }),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: deleteCampaignReference,
    onSuccess: refresh,
  })
  const visible = references.data?.filter(
    (item) =>
      (filter === 'all' || item.kind === filter) &&
      `${item.name} ${item.summary} ${item.tags.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
  const icon = (kind: string) =>
    kind === 'npc' ? (
      <UserRound size={17} />
    ) : kind === 'faction' ? (
      <Building2 size={17} />
    ) : (
      <Map size={17} />
    )

  return (
    <section className="references-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Campaign encyclopedia</p>
          <h2>People, factions, and places</h2>
        </div>
        <Map aria-hidden="true" />
      </div>
      {isManager && (
        <form
          className="reference-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            create.mutate()
          }}
        >
          <select
            value={draft.kind}
            onChange={(event) =>
              setDraft({ ...draft, kind: event.target.value })
            }
          >
            <option value="npc">NPC</option>
            <option value="faction">Faction</option>
            <option value="location">Location</option>
          </select>
          <input
            required
            maxLength={160}
            placeholder="Name"
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />
          <input
            required
            maxLength={80}
            placeholder="Status"
            value={draft.status}
            onChange={(event) =>
              setDraft({ ...draft, status: event.target.value })
            }
          />
          <input
            maxLength={1000}
            placeholder="Short summary"
            value={draft.summary}
            onChange={(event) =>
              setDraft({ ...draft, summary: event.target.value })
            }
          />
          <input
            placeholder="Tags, comma separated"
            value={draft.tags}
            onChange={(event) =>
              setDraft({ ...draft, tags: event.target.value })
            }
          />
          <textarea
            rows={3}
            maxLength={10000}
            placeholder="Full details"
            value={draft.details}
            onChange={(event) =>
              setDraft({ ...draft, details: event.target.value })
            }
          />
          <label>
            <input
              type="checkbox"
              checked={draft.isSecret}
              onChange={(event) =>
                setDraft({ ...draft, isSecret: event.target.checked })
              }
            />{' '}
            Game Masters only
          </label>
          <button disabled={create.isPending}>Add reference</button>
        </form>
      )}
      <div className="reference-tools">
        <label>
          <Search size={15} />
          <input
            aria-label="Search campaign references"
            placeholder="Search names, summaries, or tags"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Reference type"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All types</option>
          <option value="npc">NPCs</option>
          <option value="faction">Factions</option>
          <option value="location">Locations</option>
        </select>
      </div>
      <div className="reference-list">
        {visible?.length === 0 && (
          <p className="muted-copy">No matching references.</p>
        )}
        {visible?.map((item) => (
          <article key={item.id}>
            <div className="reference-meta">
              <span>
                {icon(item.kind)} {item.kind}
              </span>
              <span>{item.status}</span>
              {item.is_secret && (
                <span>
                  <LockKeyhole size={12} /> GM only
                </span>
              )}
            </div>
            <h3>{item.name}</h3>
            {item.summary && <strong>{item.summary}</strong>}
            {item.details && <p>{item.details}</p>}
            {item.tags.length > 0 && (
              <div className="reference-tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
            {isManager && (
              <div className="reference-actions">
                <input
                  aria-label={`Status for ${item.name}`}
                  maxLength={80}
                  defaultValue={item.status}
                  onBlur={(event) => {
                    if (
                      event.target.value.trim() &&
                      event.target.value !== item.status
                    )
                      update.mutate({
                        id: item.id,
                        status: event.target.value.trim(),
                      })
                  }}
                />
                <button
                  className="danger-button"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => remove.mutate(item.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
