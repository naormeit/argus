import { createClient } from '@supabase/supabase-js'

const configuredUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const configuredKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

if (!configuredUrl || !configuredKey) {
  // Keep the app renderable (marketing pages, builds without secrets) instead of
  // crashing at import time. Auth features will not work until these are set.
  console.warn('Supabase environment variables are missing — authentication is disabled.')
}

const supabaseUrl = configuredUrl || 'https://placeholder.supabase.co'
const supabaseAnonKey = configuredKey || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
