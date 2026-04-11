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
  if (cronSecret) {
    const auth = req.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const db    = getSupabaseAdmin()

  // Bugünkü onaylı rezervasyonları restoranla birlikte çek
  const { data: reservations, error } = await db
    .from('reservations')
    .select(`
      id,
      customer_name,
      phone,
      date,
      time,
      party_size,
      restaurant_id,
      restaurants ( name, address )
    `)
    .eq('date', today)
    .eq('status', 'confirmed')

  if (error) {
    console.error('[send-reminders] DB error:', error)
    return NextResponse.json({ error: 'Veri çekilemedi.' }, { status: 500 })
  }

  const results = await Promise.allSettled(
    (reservations ?? []).map(async r => {
      const restaurantRaw = r.restaurants as { name: string; address: string | null }[] | { name: string; address: string | null } | null
      const restaurant = Array.isArray(restaurantRaw) ? restaurantRaw[0] ?? null : restaurantRaw

      await sendReservationReminder({
        to:                 r.phone,
        customerName:       r.customer_name,
        restaurantName:     restaurant?.name,
        restaurantAddress:  restaurant?.address ?? undefined,
        date:               r.date,
        time:               r.time ?? '',
        partySize:          r.party_size,
        // İptal linki — ileride /cancel/[token] sayfası eklenebilir
        cancelUrl: undefined,
      })

      return r.id
    })
  )

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  console.log(`[send-reminders] ${today}: ${sent} gönderildi, ${failed} başarısız`)

  return NextResponse.json({ date: today, sent, failed })
}
