import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, HelpCircle, Pencil, Save, Send, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import {
  createActionProposal,
  editActionProposal,
  listActionProposals,
  reviewActionProposal,
} from './actions'

const kinds = ['attack', 'magic', 'item', 'movement', 'speech', 'custom']
type ActionCharacter = { id: number; name: string; owner_id: string }

export function ActionProposalPanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
}: {
  actorId: string
  campaignId: number
  characters: ActionCharacter[]
  isManager: boolean
  sessionId: number
}) {
  const client = useQueryClient()
  const key = ['action-proposals', sessionId]
  const proposals = useQuery({
    queryKey: key,
    queryFn: () => listActionProposals(sessionId),
    refetchInterval: 3_000,
  })
  const [kind, setKind] = useState('attack')
  const [characterId, setCharacterId] = useState('')
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDetails, setEditDetails] = useState('')
  const [editKind, setEditKind] = useState('custom')
  const availableCharacters = isManager
    ? characters
    : characters.filter((character) => character.owner_id === actorId)
  const create = useMutation({
    mutationFn: () =>
      createActionProposal({
        approvalMode: requiresApproval ? 'hard' : 'soft',
        campaignId,
        characterId: characterId ? Number(characterId) : null,
        details,
        kind,
        sessionId,
        title,
        userId: actorId,
      }),
    onSuccess: async () => {
      setTitle('')
      setDetails('')
      await client.invalidateQueries({ queryKey: key })
    },
  })
  const review = useMutation({
    mutationFn: ({
      proposalId,
      status,
    }: {
      proposalId: number
      status: 'approved' | 'denied' | 'clarification'
    }) =>
      reviewActionProposal({
        proposalId,
        reviewerId: actorId,
        reviewerNote: reviewNotes[proposalId] ?? '',
        status,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  })
  const edit = useMutation({
    mutationFn: () =>
      editActionProposal({
        details: editDetails,
        kind: editKind,
        proposalId: editingId!,
        title: editTitle,
      }),
    onSuccess: async () => {
      setEditingId(null)
      await client.invalidateQueries({ queryKey: key })
    },
  })

  return (
    <section className="action-proposal-panel">
      <header>
        <div>
          <p className="eyebrow">Declare intent</p>
          <h3>Player actions</h3>
        </div>
        <span>
          {proposals.data?.filter((proposal) => proposal.status === 'pending')
            .length ?? 0}{' '}
          awaiting GM
        </span>
      </header>
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          create.mutate()
        }}
      >
        <select value={kind} onChange={(event) => setKind(event.target.value)}>
          {kinds.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          value={characterId}
          onChange={(event) => setCharacterId(event.target.value)}
        >
          <option value="">No character</option>
          {availableCharacters.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>
        <input
          required
          maxLength={160}
          placeholder="What do you want to do?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          rows={2}
          maxLength={5000}
          placeholder="Target, method, item, spell, or other useful details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={requiresApproval}
            onChange={(event) => setRequiresApproval(event.target.checked)}
          />{' '}
          Ask the GM before resolving
        </label>
        <button disabled={create.isPending || !title.trim()}>
          <Send /> {requiresApproval ? 'Request approval' : 'Declare action'}
        </button>
      </form>
      <div className="action-proposal-list">
        {proposals.data?.map((proposal) => {
          const character = characters.find(
            (item) => item.id === proposal.character_id,
          )
          return (
            <article
              key={proposal.id}
              className={`proposal-${proposal.status}`}
            >
              <header>
                <span>
                  {proposal.kind} · {proposal.status}
                </span>
                <time>
                  {new Date(proposal.created_at).toLocaleTimeString()}
                </time>
              </header>
              <h4>{proposal.title}</h4>
              {proposal.details && <p>{proposal.details}</p>}
              <small>
                {character?.name ?? 'Player intent'} ·{' '}
                {proposal.approval_mode === 'hard'
                  ? 'GM decision required'
                  : 'soft approval'}
              </small>
              {proposal.reviewer_note && (
                <blockquote>GM: {proposal.reviewer_note}</blockquote>
              )}
              {isManager && proposal.status === 'pending' && (
                <>
                  {editingId === proposal.id ? (
                    <div className="proposal-edit">
                      <select
                        value={editKind}
                        onChange={(event) => setEditKind(event.target.value)}
                      >
                        {kinds.map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                      <input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                      />
                      <textarea
                        rows={2}
                        value={editDetails}
                        onChange={(event) => setEditDetails(event.target.value)}
                      />
                      <button
                        disabled={!editTitle.trim() || edit.isPending}
                        onClick={() => edit.mutate()}
                      >
                        <Save /> Save edit
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="proposal-edit-trigger secondary-button"
                      onClick={() => {
                        setEditingId(proposal.id)
                        setEditKind(proposal.kind)
                        setEditTitle(proposal.title)
                        setEditDetails(proposal.details)
                      }}
                    >
                      <Pencil /> Edit before ruling
                    </button>
                  )}
                  <div className="proposal-review">
                    <input
                      placeholder="Optional ruling or clarification"
                      value={reviewNotes[proposal.id] ?? ''}
                      onChange={(event) =>
                        setReviewNotes({
                          ...reviewNotes,
                          [proposal.id]: event.target.value,
                        })
                      }
                    />
                    <button
                      onClick={() =>
                        review.mutate({
                          proposalId: proposal.id,
                          status: 'approved',
                        })
                      }
                    >
                      <Check /> Approve
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() =>
                        review.mutate({
                          proposalId: proposal.id,
                          status: 'clarification',
                        })
                      }
                    >
                      <HelpCircle /> Clarify
                    </button>
                    <button
                      className="danger-button"
                      onClick={() =>
                        review.mutate({
                          proposalId: proposal.id,
                          status: 'denied',
                        })
                      }
                    >
                      <X /> Deny
                    </button>
                  </div>
                </>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
