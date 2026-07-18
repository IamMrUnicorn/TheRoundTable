import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CloudSun, Flag, LockKeyhole, MapPin, Trash2 } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'

import {
  createObjective,
  deleteObjective,
  getCampaignStory,
  saveGmState,
  saveWorldState,
  updateObjective,
} from './story'

export function CampaignStoryPanel({
  campaignId,
  isManager,
  userId,
}: {
  campaignId: number
  isManager: boolean
  userId: string
}) {
  const queryClient = useQueryClient()
  const story = useQuery({
    queryKey: ['campaign-story', campaignId],
    queryFn: () => getCampaignStory(campaignId),
  })
  const [world, setWorld] = useState({
    currentLocation: '',
    inWorldDatetime: '',
    summary: '',
    weather: '',
  })
  const [secretState, setSecretState] = useState('')
  const [objective, setObjective] = useState({
    description: '',
    isSecret: false,
    priority: 'normal',
    title: '',
  })

  useEffect(() => {
    if (story.data?.world)
      setWorld({
        currentLocation: story.data.world.current_location,
        inWorldDatetime: story.data.world.in_world_datetime,
        summary: story.data.world.summary,
        weather: story.data.world.weather,
      })
    if (story.data?.gmState) setSecretState(story.data.gmState.secret_state)
  }, [story.data])

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['campaign-story', campaignId] })
  const saveWorld = useMutation({
    mutationFn: () =>
      Promise.all([
        saveWorldState({
          ...world,
          campaignId,
          updatedBy: userId,
        }),
        saveGmState({ campaignId, secretState, updatedBy: userId }),
      ]),
    onSuccess: refresh,
  })
  const addObjective = useMutation({
    mutationFn: () =>
      createObjective({
        ...objective,
        campaignId,
        createdBy: userId,
      }),
    onSuccess: async () => {
      setObjective({
        description: '',
        isSecret: false,
        priority: 'normal',
        title: '',
      })
      await refresh()
    },
  })
  const changeObjective = useMutation({
    mutationFn: ({
      id,
      priority,
      status,
    }: {
      id: number
      priority?: string
      status?: string
    }) => updateObjective(id, { priority, status }),
    onSuccess: refresh,
  })
  const removeObjective = useMutation({
    mutationFn: deleteObjective,
    onSuccess: refresh,
  })

  return (
    <section className="story-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Living campaign</p>
          <h2>World and objectives</h2>
        </div>
        <MapPin aria-hidden="true" />
      </div>
      {story.isLoading && <p className="muted-copy">Reading the world…</p>}
      {story.isError && (
        <p className="form-message error">
          Campaign state could not be loaded.
        </p>
      )}
      {isManager ? (
        <form
          className="world-state-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            saveWorld.mutate()
          }}
        >
          <label>
            Current location
            <input
              maxLength={200}
              value={world.currentLocation}
              onChange={(event) =>
                setWorld({ ...world, currentLocation: event.target.value })
              }
            />
          </label>
          <label>
            In-world date and time
            <input
              maxLength={200}
              value={world.inWorldDatetime}
              onChange={(event) =>
                setWorld({ ...world, inWorldDatetime: event.target.value })
              }
            />
          </label>
          <label>
            Weather and atmosphere
            <input
              maxLength={500}
              value={world.weather}
              onChange={(event) =>
                setWorld({ ...world, weather: event.target.value })
              }
            />
          </label>
          <label className="story-wide-field">
            Public world state
            <textarea
              rows={4}
              maxLength={5000}
              value={world.summary}
              onChange={(event) =>
                setWorld({ ...world, summary: event.target.value })
              }
            />
          </label>
          <label className="story-wide-field secret-state-field">
            <span>
              <LockKeyhole size={14} /> Game Master secrets
            </span>
            <textarea
              rows={4}
              maxLength={10000}
              value={secretState}
              onChange={(event) => setSecretState(event.target.value)}
            />
          </label>
          <button disabled={saveWorld.isPending}>
            {saveWorld.isPending ? 'Saving…' : 'Save world state'}
          </button>
        </form>
      ) : (
        <div className="world-state-display">
          <div>
            <MapPin size={17} />
            <span>Location</span>
            <strong>{story.data?.world?.current_location || 'Unknown'}</strong>
          </div>
          <div>
            <span>Campaign time</span>
            <strong>{story.data?.world?.in_world_datetime || 'Not set'}</strong>
          </div>
          <div>
            <CloudSun size={17} />
            <span>Weather</span>
            <strong>{story.data?.world?.weather || 'Not set'}</strong>
          </div>
          {story.data?.world?.summary && <p>{story.data.world.summary}</p>}
        </div>
      )}

      <div className="objective-heading">
        <div>
          <p className="eyebrow">Quest log</p>
          <h3>Objectives</h3>
        </div>
        <Flag aria-hidden="true" />
      </div>
      {isManager && (
        <form
          className="objective-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            addObjective.mutate()
          }}
        >
          <input
            required
            maxLength={160}
            placeholder="Objective title"
            value={objective.title}
            onChange={(event) =>
              setObjective({ ...objective, title: event.target.value })
            }
          />
          <select
            value={objective.priority}
            onChange={(event) =>
              setObjective({ ...objective, priority: event.target.value })
            }
          >
            <option value="low">Low priority</option>
            <option value="normal">Normal priority</option>
            <option value="high">High priority</option>
          </select>
          <textarea
            rows={2}
            maxLength={5000}
            placeholder="What does the party need to accomplish?"
            value={objective.description}
            onChange={(event) =>
              setObjective({ ...objective, description: event.target.value })
            }
          />
          <label>
            <input
              type="checkbox"
              checked={objective.isSecret}
              onChange={(event) =>
                setObjective({ ...objective, isSecret: event.target.checked })
              }
            />{' '}
            GM-only objective
          </label>
          <button disabled={addObjective.isPending}>Add objective</button>
        </form>
      )}
      <div className="objective-list">
        {story.data?.objectives.length === 0 && (
          <p className="muted-copy">No objectives have been recorded.</p>
        )}
        {story.data?.objectives.map((item) => (
          <article
            className={item.status === 'active' ? '' : 'is-resolved'}
            key={item.id}
          >
            <div className="objective-meta">
              <span>{item.priority}</span>
              <span>{item.status}</span>
              {item.is_secret && (
                <span>
                  <LockKeyhole size={12} /> Secret
                </span>
              )}
            </div>
            <h4>{item.title}</h4>
            {item.description && <p>{item.description}</p>}
            {isManager && (
              <div className="objective-actions">
                <select
                  aria-label={`Status for ${item.title}`}
                  value={item.status}
                  onChange={(event) =>
                    changeObjective.mutate({
                      id: item.id,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
                <select
                  aria-label={`Priority for ${item.title}`}
                  value={item.priority}
                  onChange={(event) =>
                    changeObjective.mutate({
                      id: item.id,
                      priority: event.target.value,
                    })
                  }
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
                <button
                  className="danger-button"
                  aria-label={`Delete ${item.title}`}
                  onClick={() => removeObjective.mutate(item.id)}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
