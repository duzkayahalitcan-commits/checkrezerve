import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getCustomer, customerReservationFilter } from '@/lib/musteri-auth'

// Giriş yapmış müşterinin kendi rezervasyonları (web /rezervasyonlarim, /profil).
// İstemci anon client ile guest_email'e göre okuyordu; RLS (reservations_customer_select)
// role='customer' + telefon istiyor, DB'de customer profili yok → liste hep boştu.
// Eşleşme: auth e-postası (guest_email) + profil telefonu varyantları.

export async function GET(req: NextRequest) {
  const db = getSupabaseAdmin()
  const c = await getCustomer(req, db)
  if (!c) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
  const filter = customerReservationFilter(c)
  if (!filter) return NextResponse.json({ reservations: [] })

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '50', 10) || 50, 100)
  const { data, error } = await db
    .from('reservations')
    .select('id, guest_name, reserved_date, reserved_time, party_size, status, created_at, restaurants(name, slug)')
    .or(filter)
    .order('reserved_date', { ascending: false })
    .limit(limit)
  if (error) {
    console.error('[musteri/rezervasyonlar GET]', error)
    return NextResponse.json({ error: 'Rezervasyonlar yüklenemedi.' }, { status: 500 })
  }
  return NextResponse.json({ reservations: data ?? [] })
}
