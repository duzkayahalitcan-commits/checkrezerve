import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
