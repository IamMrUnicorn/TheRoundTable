import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, ExternalLink, LockKeyhole, Pin, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import {
  createCampaignDocument,
  deleteCampaignDocument,
  listCampaignDocuments,
  updateCampaignDocument,
} from './documents'

const emptyDraft = {
  body: '',
  isPinned: false,
  kind: 'note',
  title: '',
  url: '',
  visibility: 'shared',
}

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export function CampaignKnowledgePanel({
  campaignId,
  isManager,
  userId,
}: {
  campaignId: number
  isManager: boolean
  userId: string
}) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(emptyDraft)
  const [editingId, setEditingId] = useState<number | null>(null)
  const documents = useQuery({
    queryKey: ['campaign-documents', campaignId],
    queryFn: () => listCampaignDocuments(campaignId),
  })
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['campaign-documents', campaignId],
    })
  const createDocument = useMutation({
    mutationFn: () =>
      createCampaignDocument({
        ...draft,
        authorId: userId,
        campaignId,
      }),
    onSuccess: async () => {
      setDraft(emptyDraft)
      await refresh()
    },
  })
  const saveDocument = useMutation({
    mutationFn: () => updateCampaignDocument(editingId!, draft),
    onSuccess: async () => {
      setEditingId(null)
      setDraft(emptyDraft)
      await refresh()
    },
  })
  const removeDocument = useMutation({
    mutationFn: deleteCampaignDocument,
    onSuccess: refresh,
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (editingId) saveDocument.mutate()
    else createDocument.mutate()
  }

  function beginEdit(item: NonNullable<typeof documents.data>[number]) {
    setEditingId(item.id)
    setDraft({
      body: item.body,
      isPinned: item.is_pinned,
      kind: item.kind,
      title: item.title,
      url: item.url,
      visibility: item.visibility,
    })
  }

  const mutationError =
    createDocument.error ?? saveDocument.error ?? removeDocument.error

  return (
    <section className="knowledge-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Campaign library</p>
          <h2>Notes and resources</h2>
        </div>
        <BookOpen aria-hidden="true" />
      </div>
      <form className="knowledge-form" onSubmit={submit}>
        <label>
          Type
          <select
            disabled={editingId !== null}
            value={draft.kind}
            onChange={(event) =>
              setDraft({ ...draft, kind: event.target.value })
            }
          >
            <option value="note">Note</option>
            <option value="resource">Linked resource</option>
          </select>
        </label>
        <label>
          Visibility
          <select
            disabled={editingId !== null}
            value={draft.visibility}
            onChange={(event) =>
              setDraft({ ...draft, visibility: event.target.value })
            }
          >
            <option value="shared">Entire party</option>
            {isManager && (
              <option value="game_master">Game Masters only</option>
            )}
          </select>
        </label>
        <label className="knowledge-title-field">
          Title
          <input
            required
            maxLength={160}
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
          />
        </label>
        {draft.kind === 'resource' && (
          <label className="knowledge-wide-field">
            URL
            <input
              required
              type="url"
              maxLength={2000}
              placeholder="https://…"
              value={draft.url}
              onChange={(event) =>
                setDraft({ ...draft, url: event.target.value })
              }
            />
          </label>
        )}
        <label className="knowledge-wide-field">
          {draft.kind === 'note' ? 'Note' : 'Description'}
          <textarea
            rows={4}
            maxLength={10000}
            value={draft.body}
            onChange={(event) =>
              setDraft({ ...draft, body: event.target.value })
            }
          />
        </label>
        {isManager && (
          <label className="knowledge-pin-field">
            <input
              type="checkbox"
              checked={draft.isPinned}
              onChange={(event) =>
                setDraft({ ...draft, isPinned: event.target.checked })
              }
            />{' '}
            Pin for the party
          </label>
        )}
        <div className="heading-actions knowledge-form-actions">
          <button disabled={createDocument.isPending || saveDocument.isPending}>
            {editingId ? 'Save changes' : 'Add to campaign'}
          </button>
          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setEditingId(null)
                setDraft(emptyDraft)
              }}
            >
              Cancel editing
            </button>
          )}
        </div>
      </form>
      {mutationError && (
        <p className="form-message error">{message(mutationError)}</p>
      )}
      {documents.isLoading && (
        <p className="muted-copy">Opening the campaign library…</p>
      )}
      {documents.data?.length === 0 && (
        <p className="muted-copy">
          No notes or resources yet. Add the first piece of campaign knowledge.
        </p>
      )}
      <div className="knowledge-list">
        {documents.data?.map((item) => {
          const canEdit = isManager || item.author_id === userId
          return (
            <article key={item.id}>
              <div className="knowledge-meta">
                <span>{item.kind}</span>
                {item.visibility === 'game_master' && (
                  <span>
                    <LockKeyhole size={13} /> Game Masters
                  </span>
                )}
                {item.is_pinned && (
                  <span>
                    <Pin size={13} /> Pinned
                  </span>
                )}
              </div>
              <h3>{item.title}</h3>
              {item.body && <p>{item.body}</p>}
              {item.kind === 'resource' && (
                <a href={item.url} target="_blank" rel="noreferrer">
                  Open resource <ExternalLink size={14} />
                </a>
              )}
              <small>
                {item.profiles?.display_name ?? 'Campaign member'} · updated{' '}
                {new Date(item.updated_at).toLocaleString()}
              </small>
              {canEdit && (
                <div className="heading-actions">
                  <button
                    className="secondary-button"
                    onClick={() => beginEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="danger-button"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => removeDocument.mutate(item.id)}
                  >
                    <Trash2 aria-hidden="true" size={15} /> Delete
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
