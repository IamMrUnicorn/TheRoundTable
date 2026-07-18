import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Backpack,
  CheckSquare,
  LockKeyhole,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'

import {
  createCampaignTask,
  createInventoryItem,
  deleteCampaignTask,
  deleteInventoryItem,
  getCampaignLogistics,
  updateCampaignTaskStatus,
  updateInventoryQuantity,
} from './logistics'

type Member = {
  user_id: string
  profiles: { display_name: string } | null
}

export function CampaignLogisticsPanel({
  campaignId,
  isManager,
  members,
  userId,
}: {
  campaignId: number
  isManager: boolean
  members: Member[]
  userId: string
}) {
  const queryClient = useQueryClient()
  const [item, setItem] = useState({
    category: 'other',
    description: '',
    holder: 'Party',
    name: '',
    quantity: 1,
    unit: '',
  })
  const [task, setTask] = useState({
    assignedTo: '',
    category: 'preparation',
    description: '',
    dueAt: '',
    isGmOnly: false,
    title: '',
  })
  const logistics = useQuery({
    queryKey: ['campaign-logistics', campaignId],
    queryFn: () => getCampaignLogistics(campaignId),
  })
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['campaign-logistics', campaignId],
    })
  const addItem = useMutation({
    mutationFn: () =>
      createInventoryItem({ ...item, campaignId, createdBy: userId }),
    onSuccess: async () => {
      setItem({
        category: 'other',
        description: '',
        holder: 'Party',
        name: '',
        quantity: 1,
        unit: '',
      })
      await refresh()
    },
  })
  const changeQuantity = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      updateInventoryQuantity(id, quantity),
    onSuccess: refresh,
  })
  const removeItem = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: refresh,
  })
  const addTask = useMutation({
    mutationFn: () =>
      createCampaignTask({ ...task, campaignId, createdBy: userId }),
    onSuccess: async () => {
      setTask({
        assignedTo: '',
        category: 'preparation',
        description: '',
        dueAt: '',
        isGmOnly: false,
        title: '',
      })
      await refresh()
    },
  })
  const changeTask = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateCampaignTaskStatus(id, status),
    onSuccess: refresh,
  })
  const removeTask = useMutation({
    mutationFn: deleteCampaignTask,
    onSuccess: refresh,
  })

  return (
    <section className="logistics-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shared supplies</p>
          <h2>Party inventory</h2>
        </div>
        <Backpack aria-hidden="true" />
      </div>
      <form
        className="inventory-form"
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          addItem.mutate()
        }}
      >
        <input
          required
          maxLength={160}
          placeholder="Item name"
          value={item.name}
          onChange={(event) => setItem({ ...item, name: event.target.value })}
        />
        <input
          required
          maxLength={120}
          placeholder="Holder or location"
          value={item.holder}
          onChange={(event) => setItem({ ...item, holder: event.target.value })}
        />
        <input
          type="number"
          min={0}
          max={999999}
          value={item.quantity}
          onChange={(event) =>
            setItem({ ...item, quantity: Number(event.target.value) })
          }
        />
        <input
          maxLength={40}
          placeholder="Unit"
          value={item.unit}
          onChange={(event) => setItem({ ...item, unit: event.target.value })}
        />
        <select
          value={item.category}
          onChange={(event) =>
            setItem({ ...item, category: event.target.value })
          }
        >
          {[
            'currency',
            'consumable',
            'equipment',
            'quest',
            'treasure',
            'other',
          ].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          maxLength={2000}
          placeholder="Description (optional)"
          value={item.description}
          onChange={(event) =>
            setItem({ ...item, description: event.target.value })
          }
        />
        <button disabled={addItem.isPending}>Add item</button>
      </form>
      <div className="inventory-list">
        {logistics.data?.inventory.length === 0 && (
          <p className="muted-copy">The shared inventory is empty.</p>
        )}
        {logistics.data?.inventory.map((entry) => (
          <article key={entry.id}>
            <div>
              <span>{entry.category}</span>
              <h3>{entry.name}</h3>
              <p>
                {entry.holder}
                {entry.description ? ` · ${entry.description}` : ''}
              </p>
            </div>
            <div className="quantity-controls">
              <button
                aria-label={`Remove one ${entry.name}`}
                className="secondary-button"
                disabled={entry.quantity === 0}
                onClick={() =>
                  changeQuantity.mutate({
                    id: entry.id,
                    quantity: Math.max(0, entry.quantity - 1),
                  })
                }
              >
                <Minus size={14} />
              </button>
              <strong>
                {entry.quantity} {entry.unit}
              </strong>
              <button
                aria-label={`Add one ${entry.name}`}
                className="secondary-button"
                onClick={() =>
                  changeQuantity.mutate({
                    id: entry.id,
                    quantity: Math.min(999999, entry.quantity + 1),
                  })
                }
              >
                <Plus size={14} />
              </button>
              <button
                aria-label={`Delete ${entry.name}`}
                className="danger-button"
                onClick={() => removeItem.mutate(entry.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="task-heading">
        <div>
          <p className="eyebrow">Between sessions</p>
          <h3>Preparation and downtime</h3>
        </div>
        <CheckSquare aria-hidden="true" />
      </div>
      <form
        className="task-form"
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          addTask.mutate()
        }}
      >
        <input
          required
          maxLength={160}
          placeholder="Task title"
          value={task.title}
          onChange={(event) => setTask({ ...task, title: event.target.value })}
        />
        <select
          value={task.category}
          onChange={(event) =>
            setTask({ ...task, category: event.target.value })
          }
        >
          <option value="preparation">Preparation</option>
          <option value="downtime">Downtime</option>
        </select>
        <select
          value={task.assignedTo}
          onChange={(event) =>
            setTask({ ...task, assignedTo: event.target.value })
          }
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.profiles?.display_name ?? 'Adventurer'}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={task.dueAt}
          onChange={(event) => setTask({ ...task, dueAt: event.target.value })}
        />
        <textarea
          rows={2}
          maxLength={3000}
          placeholder="Details (optional)"
          value={task.description}
          onChange={(event) =>
            setTask({ ...task, description: event.target.value })
          }
        />
        {isManager && (
          <label>
            <input
              type="checkbox"
              checked={task.isGmOnly}
              onChange={(event) =>
                setTask({ ...task, isGmOnly: event.target.checked })
              }
            />{' '}
            Game Masters only
          </label>
        )}
        <button disabled={addTask.isPending}>Add task</button>
      </form>
      <div className="task-list">
        {logistics.data?.tasks.length === 0 && (
          <p className="muted-copy">
            Nothing needs attention between sessions.
          </p>
        )}
        {logistics.data?.tasks.map((entry) => {
          const canUpdate =
            isManager ||
            entry.created_by === userId ||
            entry.assigned_to === userId
          return (
            <article
              className={entry.status === 'done' ? 'is-done' : ''}
              key={entry.id}
            >
              <div className="task-meta">
                <span>{entry.category}</span>
                <span>{entry.status.replace('_', ' ')}</span>
                {entry.is_gm_only && (
                  <span>
                    <LockKeyhole size={12} /> GM only
                  </span>
                )}
              </div>
              <h4>{entry.title}</h4>
              {entry.description && <p>{entry.description}</p>}
              <small>
                {entry.assignee?.display_name
                  ? `Assigned to ${entry.assignee.display_name}`
                  : 'Unassigned'}
                {entry.due_at
                  ? ` · due ${new Date(entry.due_at).toLocaleString()}`
                  : ''}
              </small>
              {canUpdate && (
                <div className="task-actions">
                  <select
                    aria-label={`Status for ${entry.title}`}
                    value={entry.status}
                    onChange={(event) =>
                      changeTask.mutate({
                        id: entry.id,
                        status: event.target.value,
                      })
                    }
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                  {(isManager || entry.created_by === userId) && (
                    <button
                      aria-label={`Delete ${entry.title}`}
                      className="danger-button"
                      onClick={() => removeTask.mutate(entry.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
