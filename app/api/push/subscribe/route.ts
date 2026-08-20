import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyPanelToken } from '@/lib/middleware-auth'

// POST /api/push/subscribe
// Body: { endpoint, keys: { p256dh, auth } }
// Kullanıcının push aboneliğini kaydeder.
export async function POST(req: NextRequest) {
  // Auth kontrolü — cr_panel veya Supabase session
  const jar = await cookies()
  const panelCookie = jar.get('cr_panel')?.value ?? ''

  let userId: string | null = null

  // Panel cookie'den userId çöz (K1 FİX: verifyPanelToken role dahil HMAC doğrular)
  if (panelCookie) {
    const secret = process.env.ADMIN_SECRET
    if (secret) {
      const session = verifyPanelToken(panelCookie, secret)
      if (session) userId = session.userId
    }
  }

  // Cookie yoksa Supabase Auth session dene
  if (!userId) {
    const authHeader = req.headers.get('authorization') ?? ''
    const match = authHeader.match(/^Bearer\s+(.+)$/)
    if (match) {
      const db = getSupabaseAdmin()
      const { data: { user } } = await db.auth.getUser(match[1])
      if (user) userId = user.id
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const { endpoint, keys } = await req.json()

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Mevcut abonelik varsa güncelle, yoksa ekle
  const { error } = await db
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
      },
      { onConflict: 'endpoint' }
    )

  if (error) {
    console.error('[push/subscribe]', error)
    return NextResponse.json({ error: 'Kayıt hatası.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
