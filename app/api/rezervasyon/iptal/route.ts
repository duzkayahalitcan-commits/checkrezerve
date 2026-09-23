import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { notifyReservationEvent } from '@/lib/notification-orchestrator'

// POST /api/rezervasyon/iptal  Body: { token }
// CM-04: Misafirin giriş yapmadan, SMS'teki linkle rezervasyon iptali.
// Önceden iptal sayfası anon client ile update yapıyordu; anon'un UPDATE policy'si
// olmadığı için 0 satır etkileniyor ve iptal sessizce hiç gerçekleşmiyordu.
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { prefix: 'rezervasyon-iptal', max: 10, windowMs: 60_000 })
  if (limited) return limited

  const { token } = await req.json().catch(() => ({ token: null }))
  if (typeof token !== 'string' || token.length < 10) {
    return NextResponse.json({ error: 'Geçersiz iptal bağlantısı.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data: r, error } = await db
    .from('reservations')
    .select('id, restaurant_id, guest_name, guest_phone, party_size, reserved_date, reserved_time, status, restaurants(id, name, phone, address)')
    .eq('cancellation_token', token)
    .maybeSingle()

  if (error) {
    console.error('[rezervasyon/iptal] okuma hatası:', error)
    return NextResponse.json({ error: 'İptal şu an yapılamıyor. Lütfen işletmeyi arayın.' }, { status: 500 })
  }
  if (!r) return NextResponse.json({ error: 'İptal bağlantısı geçersiz veya kullanılmış.' }, { status: 404 })
  if (r.status === 'cancelled') return NextResponse.json({ error: 'Bu rezervasyon zaten iptal edilmiş.' }, { status: 409 })
  if (r.status === 'completed') return NextResponse.json({ error: 'Tamamlanmış rezervasyon iptal edilemez.' }, { status: 409 })

  // Türkiye UTC+3 (yaz saati yok). Başlama saati geçmişse link geçersiz.
  const startsAt = new Date(`${r.reserved_date}T${String(r.reserved_time ?? '23:59').slice(0, 5)}:00+03:00`)
  if (!Number.isNaN(startsAt.getTime()) && startsAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Geçmiş rezervasyon iptal edilemez. Lütfen işletmeyi arayın.' }, { status: 409 })
  }

  const { data: updated, error: updError } = await db
    .from('reservations')
    .update({ status: 'cancelled', cancellation_token: null })
    .eq('id', r.id)
    .eq('cancellation_token', token)
    .neq('status', 'cancelled')
    .select('id')

  if (updError) {
    console.error('[rezervasyon/iptal] güncelleme hatası:', updError)
    return NextResponse.json({ error: 'İptal sırasında bir hata oluştu. Lütfen tekrar deneyin.' }, { status: 500 })
  }
  if (!updated?.length) return NextResponse.json({ error: 'Bu rezervasyon zaten iptal edilmiş.' }, { status: 409 })

  const rest = (Array.isArray(r.restaurants) ? r.restaurants[0] : r.restaurants) as
    { id: string; name: string; phone: string | null; address: string | null } | null
  if (rest) {
    void notifyReservationEvent('cancelled', {
      id: r.id,
      restaurant_id: r.restaurant_id,
      guest_name: r.guest_name,
      guest_phone: r.guest_phone,
      party_size: r.party_size,
      reserved_date: r.reserved_date,
      reserved_time: r.reserved_time,
    }, rest).catch(e => console.error('[rezervasyon/iptal] bildirim hatası:', e))
  }

  return NextResponse.json({ success: true })
}
