import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import {
  createCharacterInventoryItem,
  deleteCharacterInventoryItem,
  listCharacterInventory,
  updateCharacterInventoryItem,
} from './inventory'

const categories = [
  'equipment',
  'consumable',
  'currency',
  'quest',
  'treasure',
  'tool',
  'container',
  'other',
] as const

export function CharacterInventoryPanel({
  canEdit,
  characterId,
}: {
  canEdit: boolean
  characterId: number
}) {
  const client = useQueryClient()
  const queryKey = ['character-inventory', characterId]
  const inventory = useQuery({
    queryKey,
    queryFn: () => listCharacterInventory(characterId),
  })
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] =
    useState<(typeof categories)[number]>('equipment')
  const [location, setLocation] = useState('Carried')
  const [weight, setWeight] = useState('')
  const [value, setValue] = useState('')
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey }),
      client.invalidateQueries({
        queryKey: ['character-memories', characterId],
      }),
    ])
  }
  const create = useMutation({
    mutationFn: () =>
      createCharacterInventoryItem({
        character_id: characterId,
        name: name.trim(),
        description: description.trim(),
        quantity,
        category,
        location: location.trim(),
        weight: weight ? Number(weight) : null,
        value: value.trim(),
      }),
    onSuccess: async () => {
      setName('')
      setDescription('')
      setQuantity(1)
      setWeight('')
      setValue('')
      await refresh()
    },
  })
  const update = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number
      updates: Record<string, unknown>
    }) => updateCharacterInventoryItem(id, updates),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: deleteCharacterInventoryItem,
    onSuccess: refresh,
  })
  const totalWeight = inventory.data?.reduce(
    (sum, item) => sum + Number(item.weight ?? 0) * item.quantity,
    0,
  )

  return (
    <section className="character-inventory-panel">
      <header>
        <div>
          <span className="eyebrow">Current belongings</span>
          <h3>Inventory & equipment</h3>
        </div>
        <span>
          {inventory.data?.length ?? 0} entries ·{' '}
          {totalWeight?.toFixed(1) ?? '0.0'} weight
        </span>
      </header>
      {canEdit && (
        <form
          className="character-inventory-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            create.mutate()
          }}
        >
          <input
            required
            maxLength={160}
            placeholder="Item name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            type="number"
            min={0}
            max={999999}
            aria-label="Quantity"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as typeof category)
            }
          >
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <input
            required
            maxLength={120}
            placeholder="Carried, backpack, vault…"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <input
            type="number"
            min={0}
            step="0.001"
            placeholder="Weight each"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
          <input
            maxLength={120}
            placeholder="Value (10 gp)"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <textarea
            maxLength={5000}
            rows={2}
            placeholder="Description or identifying details"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button
            disabled={create.isPending || !name.trim() || !location.trim()}
          >
            {create.isPending ? 'Adding…' : 'Add item'}
          </button>
        </form>
      )}
      {inventory.isLoading && <p className="muted-copy">Checking inventory…</p>}
      {inventory.isError && (
        <p className="form-error">Inventory could not be loaded.</p>
      )}
      {inventory.data?.length === 0 && (
        <p className="empty-feature-copy">
          No character inventory has been recorded.
        </p>
      )}
      <div className="character-inventory-list">
        {inventory.data?.map((item) => (
          <article key={item.id}>
            <div>
              <span>{item.category}</span>
              <h4>{item.name}</h4>
              <p>
                {item.quantity} × · {item.location}
                {item.weight !== null && ` · ${item.weight} each`}
                {item.value && ` · ${item.value}`}
              </p>
              {item.description && <p>{item.description}</p>}
            </div>
            {canEdit && (
              <div className="inventory-item-controls">
                <button
                  type="button"
                  onClick={() =>
                    update.mutate({
                      id: item.id,
                      updates: { is_equipped: !item.is_equipped },
                    })
                  }
                >
                  {item.is_equipped ? 'Unequip' : 'Equip'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    update.mutate({
                      id: item.id,
                      updates: { quantity: item.quantity + 1 },
                    })
                  }
                >
                  +1
                </button>
                <button
                  type="button"
                  disabled={item.quantity === 0}
                  onClick={() =>
                    update.mutate({
                      id: item.id,
                      updates: { quantity: Math.max(0, item.quantity - 1) },
                    })
                  }
                >
                  −1
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => remove.mutate(item.id)}
                >
                  Remove
                </button>
              </div>
            )}
            {(item.is_equipped || item.is_attuned) && (
              <footer>
                {item.is_equipped && <span>Equipped</span>}
                {item.is_attuned && <span>Attuned</span>}
              </footer>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
