// ─── İş Yeri Türleri ──────────────────────────────────────────────────────────

export type BusinessType =
  | 'restaurant'
  | 'barber'
  | 'hairdresser'
  | 'psychologist'
  | 'spa'
  | 'beauty_salon'
  | 'dentist'
  | 'fitness'
  | 'veterinary'
  | 'other'

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant:   'Restoran / Kafe',
  barber:       'Berber',
  hairdresser:  'Kuaför / Saç Salonu',
  psychologist: 'Psikolog / Terapist',
  spa:          'Spa / Masaj',
  beauty_salon: 'Güzellik Salonu',
  dentist:      'Diş Hekimi',
  fitness:      'Spor Salonu / PT',
  veterinary:   'Veteriner',
  other:        'Diğer',
}

export const BUSINESS_TYPE_ICONS: Record<BusinessType, string> = {
  restaurant:   '🍽️',
  barber:       '✂️',
  hairdresser:  '💇',
  psychologist: '🧠',
  spa:          '💆',
  beauty_salon: '💅',
  dentist:      '🦷',
  fitness:      '🏋️',
  veterinary:   '🐾',
  other:        '📅',
}

// "Rezervasyon" mu "Randevu" mu? İş türüne göre değişir.
export const BOOKING_TERM: Record<BusinessType, { singular: string; plural: string }> = {
  restaurant:   { singular: 'Rezervasyon', plural: 'Rezervasyonlar' },
  barber:       { singular: 'Randevu',     plural: 'Randevular'     },
  hairdresser:  { singular: 'Randevu',     plural: 'Randevular'     },
  psychologist: { singular: 'Seans',       plural: 'Seanslar'       },
  spa:          { singular: 'Randevu',     plural: 'Randevular'     },
  beauty_salon: { singular: 'Randevu',     plural: 'Randevular'     },
  dentist:      { singular: 'Randevu',     plural: 'Randevular'     },
  fitness:      { singular: 'Randevu',     plural: 'Randevular'     },
  veterinary:   { singular: 'Randevu',     plural: 'Randevular'     },
  other:        { singular: 'Randevu',     plural: 'Randevular'     },
}

// ─── Supabase Tablo Tipleri ────────────────────────────────────────────────────

export type Restaurant = {
  id:                       string
  name:                     string
  slug:                     string
  phone:                    string | null
  address:                  string | null
  capacity:                 number
  business_type:            BusinessType
  timezone:                 string
  booking_duration_minutes: number
  currency:                 string
  description:              string | null
  website:                  string | null
  instagram:                string | null
  is_active:                boolean
  created_at:               string
}

export type Service = {
  id:               string
  restaurant_id:    string
  name:             string
  description:      string | null
  duration_minutes: number
  price:            number | null
  currency:         string
  is_active:        boolean
  sort_order:       number
  created_at:       string
}

export type StaffMember = {
  id:            string
  restaurant_id: string
  name:          string
  title:         string | null
  bio:           string | null
  avatar_url:    string | null
  is_active:     boolean
  sort_order:    number
  created_at:    string
}

export type Reservation = {
  id:               string
  restaurant_id:    string
  // Mevcut DB kolonları (geriye dönük uyumlu)
  customer_name:    string
  phone:            string
  party_size:       number
  date:             string        // YYYY-MM-DD
  time:             string | null // HH:MM
  // Yeni kolonlar (multi-sector migration sonrası)
  end_time:         string | null
  duration_minutes: number | null
  service_id:       string | null
  staff_id:         string | null
  special_requests: string | null
  notes:            string | null
  status:           'confirmed' | 'cancelled' | 'completed' | 'no_show'
  source:           'form' | 'ai' | 'phone' | 'whatsapp' | 'walk_in'
  special_area_id:  string | null
  price_paid:       number | null
  currency:         string
  reminder_sent:    boolean
  created_at:       string
}

export type SpecialArea = {
  id:            string
  restaurant_id: string
  name:          string
  capacity:      number
  created_at:    string
}

export type RestaurantUser = {
  id:            string
  restaurant_id: string
  username:      string
  role:          'manager' | 'staff'
  is_active:     boolean
  created_at:    string
}

// ─── AI Mesaj Analizi ──────────────────────────────────────────────────────────

export type ReservationExtraction = {
  is_reservation_request: boolean
  name:           string | null
  date:           string | null  // YYYY-MM-DD
  time:           string | null  // HH:MM
  party_size:     number | null
  phone:          string | null
  notes:          string | null
  confidence:     number         // 0–1
  raw_date_text:  string | null
  service_name:   string | null  // berber/kuaför için hizmet adı
  staff_name:     string | null  // tercih edilen personel
}
