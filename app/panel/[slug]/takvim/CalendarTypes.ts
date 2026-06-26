export type ViewMode = 'daily' | 'weekly' | 'monthly'

export type TakvimReservation = {
  id:             string
  guest_name:     string | null
  guest_phone:    string | null
  guest_email:    string | null
  reserved_date:  string       // YYYY-MM-DD
  reserved_time:  string       // HH:mm
  party_size:     number | null
  status:         string
  notes:          string | null
  table_id:       string | null
  calisan_id:     string | null
  hizmet_id:      string | null
  special_area_id: string | null
  is_deleted:     boolean | null
  calisanlar:     { ad: string } | { ad: string }[] | null
  hizmetler:      { ad: string } | { ad: string }[] | null
  masa_tipleri:   { ad: string } | { ad: string }[] | null
}
