import { supabase } from '../../lib/supabase'

const BUCKET = 'campaign-maps'
const MAX_FILE_SIZE = 20 * 1024 * 1024
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type CampaignMap = Awaited<ReturnType<typeof listCampaignMaps>>[number]

export async function listCampaignMaps(campaignId: number) {
  const { data, error } = await supabase
    .from('campaign_maps')
    .select('*, campaign_references(name)')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
  if (error) throw error

  return Promise.all(
    data.map(async (map) => {
      const signed = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(map.storage_path, 60 * 60)
      if (signed.error) throw signed.error
      return { ...map, signedUrl: signed.data.signedUrl }
    }),
  )
}

function readImageDimensions(file: File) {
  return new Promise<{ height: number; width: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      resolve({ height: image.naturalHeight, width: image.naturalWidth })
      URL.revokeObjectURL(url)
    }
    image.onerror = () => {
      reject(new Error('The selected file could not be read as an image.'))
      URL.revokeObjectURL(url)
    }
    image.src = url
  })
}

export async function uploadCampaignMap(input: {
  campaignId: number
  description: string
  file: File
  locationReferenceId: number | null
  name: string
  uploadedBy: string
  visibility: 'game_master' | 'shared'
}) {
  const extension = MIME_EXTENSIONS[input.file.type]
  if (!extension)
    throw new Error('Choose a PNG, JPEG, or WebP image for the map.')
  if (input.file.size > MAX_FILE_SIZE)
    throw new Error('Map images must be 20 MB or smaller.')

  const dimensions = await readImageDimensions(input.file)
  const storagePath = `${input.campaignId}/${crypto.randomUUID()}.${extension}`
  const uploaded = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, input.file, {
      cacheControl: '3600',
      contentType: input.file.type,
      upsert: false,
    })
  if (uploaded.error) throw uploaded.error

  const { error } = await supabase.from('campaign_maps').insert({
    campaign_id: input.campaignId,
    description: input.description.trim(),
    file_size: input.file.size,
    height: dimensions.height,
    location_reference_id: input.locationReferenceId,
    mime_type: input.file.type,
    name: input.name.trim(),
    storage_path: storagePath,
    uploaded_by: input.uploadedBy,
    visibility: input.visibility,
    width: dimensions.width,
  })
  if (error) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    throw error
  }
}

export async function updateCampaignMap(
  id: number,
  updates: {
    description?: string
    location_reference_id?: number | null
    name?: string
    visibility?: 'game_master' | 'shared'
  },
) {
  const { error } = await supabase
    .from('campaign_maps')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteCampaignMap(
  map: Pick<CampaignMap, 'id' | 'storage_path'>,
) {
  const { error } = await supabase
    .from('campaign_maps')
    .delete()
    .eq('id', map.id)
  if (error) throw error
  const removed = await supabase.storage.from(BUCKET).remove([map.storage_path])
  if (removed.error) throw removed.error
}
