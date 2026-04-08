// Supabase tablo tipleri
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
  reserved_date: string   // YYYY-MM-DD
  reserved_time: string   // HH:MM
  notes: string | null
  status: 'confirmed' | 'cancelled' | 'completed'
  created_at: string
}

// AI mesaj analizi tipleri
export type ReservationExtraction = {
  is_reservation_request: boolean
  name: string | null
  date: string | null       // YYYY-MM-DD
  time: string | null       // HH:MM
  party_size: number | null
  phone: string | null
  notes: string | null
  confidence: number        // 0–1
  raw_date_text: string | null // Mesajda geçen ham tarih ifadesi
}
