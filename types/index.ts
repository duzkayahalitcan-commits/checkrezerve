// ─── Floor Plan / Masa Krokisi ────────────────────────────────────────────────

export type Table = {
  id: string
  restaurant_id: string
  label: string
  capacity: number
  area_id: string | null
  x: number
  y: number
  width: number
  height: number
  shape: 'rect' | 'circle'
  is_active: boolean
  created_at: string
}

// Backward compat
export type FloorTable = Table

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
  | 'pilates'
  | 'chiropractor'
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
  pilates:      'Pilates Stüdyosu',
  chiropractor: 'Kayropraktik / Fizyoterapi',
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
  pilates:      '🧘',
  chiropractor: '🦴',
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
  pilates:      { singular: 'Ders',        plural: 'Dersler'        },
  chiropractor: { singular: 'Randevu',     plural: 'Randevular'     },
  veterinary:   { singular: 'Randevu',     plural: 'Randevular'     },
  other:        { singular: 'Randevu',     plural: 'Randevular'     },
}

// ─── Supabase Tablo Tipleri ────────────────────────────────────────────────────

export type WorkingDayHours = {
  open:  boolean
  start: string  // "HH:MM"
  end:   string  // "HH:MM"
}

export type WorkingHours = Partial<Record<
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
  WorkingDayHours
>>

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
  working_hours?:            WorkingHours | null
  closed_dates?:             string[] | null
  prepayment_amount?:        number | null
  special_notes?:            string | null
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
  guest_name:       string | null
  guest_phone:      string | null
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
  role:          'business_owner' | 'business_manager'
  is_active:     boolean
  created_at:    string
}

// ─── Paket / Seans Sistemi (W-61) ──────────────────────────────────────────────
// Gercek DB semasi: paketler.toplam_seans, musteri_paketleri.musteri_id (profiles FK),
// musteri_paketleri.kullanilan_seans, musteri_paketleri.aktif
// "kalan" her yerde hesaplanir: kalan = toplam_seans - kullanilan_seans

export type Paket = {
  id:              string
  restaurant_id:   string
  ad:              string
  toplam_seans:    number
  gecerlilik_gun:  number
  fiyat:           number | null
  hizmet_id:       string | null
  aktif:           boolean
  created_at:      string
  updated_at:      string
}

export type MusteriPaketi = {
  id:               string
  restaurant_id:    string
  paket_id:         string
  musteri_id:       string
  toplam_seans:     number
  kullanilan_seans: number
  baslangic_tarihi: string
  bitis_tarihi:     string | null
  aktif:            boolean
  calisan_id:       string | null
  created_at:       string
  updated_at:       string
}

// API'den gelen join'li liste tipi (kalan hesaplanir)
export type MusteriPaketListRow = MusteriPaketi & {
  paket_adi:      string
  musteri_adi:    string        // profiles.email'den
  musteri_email:  string | null
  calisan_adi:    string | null
  kalan_seans:    number        // hesaplanan
  kalan_oran:     number        // 0-1
  durum:          string        // hesaplanan: aktif/bitti
}

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
