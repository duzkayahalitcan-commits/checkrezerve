import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — client yalnızca gerçekten çağrıldığında oluşturulur,
// build-time'da env yoksa patlamaz.
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars are missing')
  _client = createClient(url, key)
  return _client
}

// Convenience shorthand (aynı API'yi korur)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as never)[prop]
  },
})

// Tip tanımları
export type Restaurant = {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  capacity: number
  created_at: string
}

export type Reservation = {
  id: string
  restaurant_id: string
  guest_name: string
  guest_phone: string
  party_size: number
  reserved_date: string
  reserved_time: string
  notes: string | null
  status: 'confirmed' | 'cancelled' | 'completed'
  created_at: string
}
