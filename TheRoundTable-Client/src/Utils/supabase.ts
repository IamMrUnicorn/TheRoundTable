import { createClient } from '@supabase/supabase-js'
import { createContext} from 'react'
const supabaseUrl = 'https://tmzgscgemsbfxosmnoon.supabase.co'
const supabaseKey = import.meta.env.VITE_REACT_APP_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
export const supabaseContext = createContext(supabase)
