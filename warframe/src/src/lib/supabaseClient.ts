import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Copy .env.example to .env.local and fill in your project values.'
  )
}

/**
 * Public Supabase client — uses the anon key, safe to ship in the frontend.
 * Row-level security on the Supabase side enforces read-only access for
 * unauthenticated users.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
