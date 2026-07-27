import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  createReactionPrompt,
  listReactionPrompts,
  respondReactionPrompt,
} from './reactions'
type Character = { id: number; name: string; owner_id: string }
export function ReactionPromptPanel({
  actorId,
  campaignId,
  characters,
  isManager,
  sessionId,
}: {
  actorId: string
  campaignId: number
  characters: Character[]
  isManager: boolean
  sessionId: number
}) {
  const client = useQueryClient(),
    key = ['reaction-prompts', sessionId]
  const prompts = useQuery({
    queryKey: key,
    queryFn: () => listReactionPrompts(sessionId),
    refetchInterval: 1000,
  })
  const [characterId, setCharacterId] = useState(''),
    [prompt, setPrompt] = useState(''),
    [duration, setDuration] = useState(30)
  useEffect(() => {
    const refresh = () =>
      void client.invalidateQueries({
        queryKey: ['reaction-prompts', sessionId],
      })
    const channel = supabase
      .channel(`reaction-prompts:${sessionId}:${actorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `session_id=eq.${sessionId}`,
          schema: 'public',
          table: 'session_reaction_prompts',
        },
        refresh,
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [actorId, client, sessionId])
  const create = useMutation({
    mutationFn: () => {
      const character = characters.find((c) => c.id === Number(characterId))!
      return createReactionPrompt({
        campaignId,
        characterId: character.id,
        durationSeconds: duration,
        prompt,
        sessionId,
        targetUserId: character.owner_id,
      })
    },
    onSuccess: async () => {
      setPrompt('')
      await client.invalidateQueries({ queryKey: key })
    },
  })
  const respond = useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      respondReactionPrompt(id, accept),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  })
  const targetedPrompt = prompts.data?.find(
    (item) =>
      item.target_user_id === actorId &&
      item.status === 'pending' &&
      Date.parse(item.expires_at) > Date.now(),
  )
  const targetedRemaining = targetedPrompt
    ? Math.max(
        0,
        Math.ceil((Date.parse(targetedPrompt.expires_at) - Date.now()) / 1000),
      )
    : 0
  return (
    <section className="reaction-prompt-panel">
      <header>
        <div>
          <p className="eyebrow">Interrupt window</p>
          <h3>Reactions</h3>
        </div>
        <ShieldAlert />
      </header>
      {isManager && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate()
          }}
        >
          <label>
            Target character
            <select
              required
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
            >
              <option value="">Choose character</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Reaction question
            <input
              required
              maxLength={1000}
              placeholder="Would you like to use your reaction?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>
          <label>
            Response time (seconds)
            <input
              type="number"
              min={5}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>
          <button disabled={!characterId || !prompt.trim() || create.isPending}>
            {create.isPending ? 'Sending…' : 'Send prompt'}
          </button>
        </form>
      )}
      {create.error && <p className="form-error">{create.error.message}</p>}
      {respond.error && <p className="form-error">{respond.error.message}</p>}
      <div className="reaction-list">
        {prompts.data?.map((item) => {
          const remaining = Math.max(
              0,
              Math.ceil((Date.parse(item.expires_at) - Date.now()) / 1000),
            ),
            mine = item.target_user_id === actorId,
            pending = item.status === 'pending' && remaining > 0
          return (
            <article key={item.id}>
              <span>
                <Clock3 />{' '}
                {pending
                  ? `${remaining}s`
                  : item.status === 'pending'
                    ? 'expired'
                    : item.status}
              </span>
              <strong>
                {characters.find((c) => c.id === item.character_id)?.name}:{' '}
                {item.prompt}
              </strong>
              {mine && pending && (
                <div>
                  <button
                    disabled={respond.isPending}
                    onClick={() =>
                      respond.mutate({ id: item.id, accept: true })
                    }
                  >
                    Use reaction
                  </button>
                  <button
                    className="secondary-button"
                    disabled={respond.isPending}
                    onClick={() =>
                      respond.mutate({ id: item.id, accept: false })
                    }
                  >
                    Decline
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
      {targetedPrompt && (
        <div className="reaction-interrupt-backdrop" role="presentation">
          <section
            className="reaction-interrupt-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reaction-interrupt-title"
          >
            <ShieldAlert aria-hidden="true" />
            <p className="eyebrow">Reaction available</p>
            <h2 id="reaction-interrupt-title">
              {
                characters.find(
                  (character) => character.id === targetedPrompt.character_id,
                )?.name
              }
            </h2>
            <p>{targetedPrompt.prompt}</p>
            <strong>
              <Clock3 /> {targetedRemaining}s remaining
            </strong>
            <div>
              <button
                autoFocus
                disabled={respond.isPending}
                onClick={() =>
                  respond.mutate({ id: targetedPrompt.id, accept: true })
                }
              >
                Use reaction
              </button>
              <button
                className="secondary-button"
                disabled={respond.isPending}
                onClick={() =>
                  respond.mutate({ id: targetedPrompt.id, accept: false })
                }
              >
                Decline
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
