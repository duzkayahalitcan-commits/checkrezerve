import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { getCustomer, customerReservationFilter } from '@/lib/musteri-auth'
import { notifyReservationEvent } from '@/lib/notification-orchestrator'

// POST /api/musteri/rezervasyonlar/iptal  Body: { id }  (Bearer)
// #3: /rezervasyonlarim "PATCH /api/rezervasyon" çağırıyordu (yalnız POST var → 405), hata yutuluyor
// ve UI "iptal edildi" gösteriyordu. Sahiplik: müşterinin e-posta/telefonuyla eşleşen kayıt.
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { prefix: 'musteri-iptal', max: 10, windowMs: 60_000 })
  if (limited) return limited

  const db = getSupabaseAdmin()
  const c = await getCustomer(req, db)
  if (!c) return NextResponse.json({ error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' }, { status: 401 })
  const filter = customerReservationFilter(c)
  const { id } = await req.json().catch(() => ({ id: null }))
  if (!filter || typeof id !== 'string') return NextResponse.json({ error: 'Rezervasyon bulunamadı.' }, { status: 404 })

  const { data: r, error } = await db
    .from('reservations')
    .select('id, restaurant_id, guest_name, guest_phone, party_size, reserved_date, reserved_time, status, restaurants(id, name, phone, address)')
    .eq('id', id)
    .or(filter)
    .maybeSingle()
  if (error) {
    console.error('[musteri/iptal] okuma:', error)
    return NextResponse.json({ error: 'İptal şu an yapılamıyor. Lütfen işletmeyi arayın.' }, { status: 500 })
  }
  if (!r) return NextResponse.json({ error: 'Rezervasyon bulunamadı.' }, { status: 404 })
  if (r.status === 'cancelled') return NextResponse.json({ error: 'Bu rezervasyon zaten iptal edilmiş.' }, { status: 409 })
  if (r.status === 'completed') return NextResponse.json({ error: 'Tamamlanmış rezervasyon iptal edilemez.' }, { status: 409 })
  const startsAt = new Date(`${r.reserved_date}T${String(r.reserved_time ?? '23:59').slice(0, 5)}:00+03:00`)
  if (!Number.isNaN(startsAt.getTime()) && startsAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Geçmiş rezervasyon iptal edilemez. Lütfen işletmeyi arayın.' }, { status: 409 })
  }

  const { data: updated, error: updError } = await db
    .from('reservations')
    .update({ status: 'cancelled', cancellation_token: null })
    .eq('id', r.id)
    .neq('status', 'cancelled')
    .select('id')
  if (updError) {
    console.error('[musteri/iptal] güncelleme:', updError)
    return NextResponse.json({ error: 'İptal sırasında bir hata oluştu. Lütfen tekrar deneyin.' }, { status: 500 })
  }
  if (!updated?.length) return NextResponse.json({ error: 'Bu rezervasyon zaten iptal edilmiş.' }, { status: 409 })

  const rest = (Array.isArray(r.restaurants) ? r.restaurants[0] : r.restaurants) as
    { id: string; name: string; phone: string | null; address: string | null } | null
  if (rest) {
    void notifyReservationEvent('cancelled', {
      id: r.id, restaurant_id: r.restaurant_id, guest_name: r.guest_name, guest_phone: r.guest_phone,
      party_size: r.party_size, reserved_date: r.reserved_date, reserved_time: r.reserved_time,
    }, rest).catch(e => console.error('[musteri/iptal] bildirim:', e))
  }
  return NextResponse.json({ success: true })
}
