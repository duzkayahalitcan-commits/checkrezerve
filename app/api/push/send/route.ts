import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// VAPID ayarları (dinamik import ile)
const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY  ?? ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_EMAIL       = process.env.VAPID_EMAIL       ?? 'info@checkrezerve.com'

// POST /api/push/send
// Body: { userId?: string, title: string, body: string, url?: string }
// userId verilmişse sadece o kullanıcıya, verilmemişse tüm aboneliklere gönderir.
export async function POST(req: NextRequest) {
  // CRON_SECRET veya admin token ile koruma
  const auth = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID keys not configured.' }, { status: 500 })
  }

  const { userId, title, body, url } = await req.json()
  if (!title || !body) {
    return NextResponse.json({ error: 'title ve body gerekli.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Abonelikleri çek
  let query = db.from('push_subscriptions').select('id, user_id, endpoint, keys_p256dh, keys_auth, created_at')
  if (userId) {
    query = query.eq('user_id', userId)
  }
  const { data: subscriptions, error } = await query

  if (error) {
    console.error('[push/send]', error)
    return NextResponse.json({ error: 'Sorgu hatası.' }, { status: 500 })
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Abonelik bulunamadı.' })
  }

  const payload = JSON.stringify({ title, body, url: url ?? '/admin' })
  const { default: webpush } = await import('web-push')
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth:   sub.keys_auth,
            },
          },
          payload
        )
        return { endpoint: sub.endpoint, status: 'sent' }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        // Abonelik geçersizse sil (410 Gone)
        if (msg.includes('410') || msg.includes('gone') || msg.includes('unsubscribe')) {
          await db.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          return { endpoint: sub.endpoint, status: 'deleted' }
        }
        return { endpoint: sub.endpoint, status: 'error', error: msg }
      }
    })
  )

  const sent   = results.filter(r => r.status === 'fulfilled' && r.value.status === 'sent').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ sent, failed, total: subscriptions.length })
}
