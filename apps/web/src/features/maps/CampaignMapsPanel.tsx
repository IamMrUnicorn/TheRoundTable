import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Expand, ImagePlus, MapPinned, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { listCampaignReferences } from '../references/references'
import {
  deleteCampaignMap,
  listCampaignMaps,
  updateCampaignMap,
  uploadCampaignMap,
} from './maps'

export function CampaignMapsPanel({
  campaignId,
  isManager,
  userId,
}: {
  campaignId: number
  isManager: boolean
  userId: string
}) {
  const client = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [locationId, setLocationId] = useState('')
  const [visibility, setVisibility] = useState<'game_master' | 'shared'>(
    'shared',
  )
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null)
  const maps = useQuery({
    queryKey: ['campaign-maps', campaignId],
    queryFn: () => listCampaignMaps(campaignId),
  })
  const references = useQuery({
    queryKey: ['campaign-references', campaignId],
    queryFn: () => listCampaignReferences(campaignId),
  })
  const refresh = () =>
    client.invalidateQueries({ queryKey: ['campaign-maps', campaignId] })
  const upload = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Choose a map image first.')
      return uploadCampaignMap({
        campaignId,
        description,
        file,
        locationReferenceId: locationId ? Number(locationId) : null,
        name,
        uploadedBy: userId,
        visibility,
      })
    },
    onSuccess: async () => {
      setFile(null)
      setName('')
      setDescription('')
      setLocationId('')
      setVisibility('shared')
      await refresh()
    },
  })
  const update = useMutation({
    mutationFn: ({
      id,
      visibility,
    }: {
      id: number
      visibility: 'game_master' | 'shared'
    }) => updateCampaignMap(id, { visibility }),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: deleteCampaignMap,
    onSuccess: refresh,
  })
  const locations =
    references.data?.filter((reference) => reference.kind === 'location') ?? []

  return (
    <section className="maps-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Atlas</p>
          <h2>Campaign maps</h2>
          <p className="muted-copy">
            Maps stay private to this campaign. Shared maps are visible to the
            party; GM maps remain behind the screen.
          </p>
        </div>
        <MapPinned aria-hidden="true" />
      </div>

      {isManager && (
        <form
          className="map-upload-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            upload.mutate()
          }}
        >
          <label>
            Map image
            <input
              required
              accept="image/png,image/jpeg,image/webp"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <small>PNG, JPEG, or WebP · up to 20 MB</small>
          </label>
          <label>
            Map name
            <input
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Linked location
            <select
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
            >
              <option value="">Campaign-wide map</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Visibility
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as typeof visibility)
              }
            >
              <option value="shared">Share with party</option>
              <option value="game_master">GM only</option>
            </select>
          </label>
          <label className="map-description-field">
            Description
            <textarea
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <button
            className="primary-button"
            disabled={upload.isPending}
            type="submit"
          >
            <ImagePlus size={17} />{' '}
            {upload.isPending ? 'Uploading…' : 'Add map'}
          </button>
        </form>
      )}
      {upload.error && <p className="form-error">{upload.error.message}</p>}
      {maps.error && (
        <p className="form-error">
          Maps could not be loaded: {maps.error.message}
        </p>
      )}
      {maps.isLoading && <p className="muted-copy">Opening the atlas…</p>}
      {!maps.isLoading && maps.data?.length === 0 && (
        <div className="empty-state compact-empty-state">
          <MapPinned size={28} />
          <h3>No maps in the atlas yet</h3>
          <p>
            {isManager
              ? 'Upload a world, region, city, or encounter map above.'
              : 'The GM has not shared a map with the party yet.'}
          </p>
        </div>
      )}
      <div className="map-grid">
        {maps.data?.map((map) => (
          <article className="map-card" key={map.id}>
            <button
              className="map-preview"
              onClick={() => setExpandedUrl(map.signedUrl)}
              type="button"
            >
              <img alt={map.name} src={map.signedUrl} />
              <span>
                <Expand size={16} /> Open map
              </span>
            </button>
            <div className="map-card-copy">
              <div className="campaign-card-meta">
                <span>{map.campaign_references?.name ?? 'Campaign-wide'}</span>
                <span>
                  {map.width && map.height
                    ? `${map.width} × ${map.height}`
                    : 'Map'}
                </span>
              </div>
              <h3>{map.name}</h3>
              {map.description && <p>{map.description}</p>}
              <small>
                {map.visibility === 'game_master'
                  ? 'GM only'
                  : 'Shared with party'}{' '}
                · {(map.file_size / 1024 / 1024).toFixed(1)} MB
              </small>
              {isManager && (
                <div className="map-card-actions">
                  <button
                    className="secondary-button"
                    disabled={update.isPending}
                    onClick={() =>
                      update.mutate({
                        id: map.id,
                        visibility:
                          map.visibility === 'shared'
                            ? 'game_master'
                            : 'shared',
                      })
                    }
                    type="button"
                  >
                    {map.visibility === 'shared' ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                    {map.visibility === 'shared'
                      ? 'Make GM only'
                      : 'Share with party'}
                  </button>
                  <button
                    className="danger-button"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(map)}
                    type="button"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      {(update.error || remove.error) && (
        <p className="form-error">{(update.error ?? remove.error)?.message}</p>
      )}
      {expandedUrl && (
        <div
          className="map-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded campaign map"
          onClick={() => setExpandedUrl(null)}
        >
          <button
            className="secondary-button"
            onClick={() => setExpandedUrl(null)}
            type="button"
          >
            Close map
          </button>
          <img
            alt="Expanded campaign map"
            onClick={(event) => event.stopPropagation()}
            src={expandedUrl}
          />
        </div>
      )}
    </section>
  )
}
