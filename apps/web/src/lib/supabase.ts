import { createClient } from '@supabase/supabase-js'

import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required')
}

if (!supabasePublishableKey) {
  console.warn('VITE_SUPABASE_PUBLISHABLE_KEY is not configured yet')
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey || 'publishable-key-not-configured',
)
