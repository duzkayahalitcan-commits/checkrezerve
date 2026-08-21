/**
 * POST /api/send-reminders
 *
 * Bugün rezervasyonu olan müşterilere hatırlatma WhatsApp/SMS gönderir.
 * Günde bir kez çağrılmalıdır (sabah 09:00 gibi).
 *
 * Güvenlik: CRON_SECRET header ile korunur.
 * deploy.sh'da cron olarak ayarlanabilir:
 *   0 9 * * * curl -X POST https://checkrezerve.com/api/send-reminders \
 *               -H "Authorization: Bearer $CRON_SECRET"
 */

import { NextRequest, NextResponse }    from 'next/server'
import { getSupabaseAdmin }              from '@/lib/supabase'
import { sendReservationReminder }       from '@/lib/notification-service'

export async function POST(req: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const db    = getSupabaseAdmin()

  // Bugünkü onaylı rezervasyonları restoranla birlikte çek
  const { data: reservations, error } = await db
    .from('reservations')
    .select(`
      id,
      guest_name,
      guest_phone,
      reserved_date,
      reserved_time,
      party_size,
      restaurant_id,
      cancellation_token,
      restaurants ( name, address )
    `)
    .eq('reserved_date', today)
    .eq('status', 'confirmed')

  if (error) {
    console.error('[send-reminders] DB error:', error)
    return NextResponse.json({ error: 'Veri çekilemedi.' }, { status: 500 })
  }

  const results = await Promise.allSettled(
    (reservations ?? []).map(async r => {
      const restaurantRaw = r.restaurants as { name: string; address: string | null }[] | { name: string; address: string | null } | null
      const restaurant = Array.isArray(restaurantRaw) ? restaurantRaw[0] ?? null : restaurantRaw

      const cancelToken = r.cancellation_token
        ? r.cancellation_token
        : null

      const cancelUrl = cancelToken
        ? `https://checkrezerve.com/tr/rezervasyon/iptal/${cancelToken}`
        : undefined

      await sendReservationReminder({
        to:                 r.guest_phone,
        customerName:       r.guest_name,
        restaurantName:     restaurant?.name,
        restaurantAddress:  restaurant?.address ?? undefined,
        date:               r.reserved_date,
        time:               r.reserved_time ? String(r.reserved_time).slice(0, 5) : '',
        partySize:          r.party_size,
        cancelUrl,
      })

      return r.id
    })
  )

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ date: today, sent, failed })
}
