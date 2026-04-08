import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — build-time'da env yoksa patlamaz
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars are missing')
  _client = createClient(url, key)
  return _client
}

// Convenience shorthand
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as never)[prop]
  },
})

// Re-export types from central types file
export type { Restaurant, Reservation } from '@/types'
