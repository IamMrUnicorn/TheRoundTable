import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
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
  const create = useMutation({
    mutationFn: () => {
      const character = characters.find((c) => c.id === Number(characterId))!
      return createReactionPrompt({
        campaignId,
        characterId: character.id,
        createdBy: actorId,
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
          <input
            required
            maxLength={1000}
            placeholder="Would you like to use your reaction?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <input
            aria-label="Reaction seconds"
            type="number"
            min={5}
            max={300}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
          <button disabled={!characterId || !prompt.trim() || create.isPending}>
            Prompt
          </button>
        </form>
      )}
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
    </section>
  )
}
