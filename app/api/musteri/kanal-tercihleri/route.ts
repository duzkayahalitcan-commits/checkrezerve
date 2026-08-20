import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const KANALLAR = ['email', 'sms', 'whatsapp', 'push'] as const

// GET /api/musteri/kanal-tercihleri?restaurant_id=...
// Müşterinin bu işletme için seçebileceği kanalları döndürür.
// Yalnızca işletmenin AÇIK bıraktığı kanallar gösterilir + müşterinin seçimi.
export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  // Müşteri kimliği: Supabase auth session (Authorization Bearer) — panel cookie değil
  const jar = await cookies()
  const panelSession = verifySession(jar.get('cr_panel')?.value ?? '')

  const auth = req.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/)
  const db = getSupabaseAdmin()

  let musteriId: string | null = null
  if (panelSession?.userId) {
    musteriId = panelSession.userId
  } else if (match) {
    const { data: { user }, error } = await db.auth.getUser(match[1])
    if (!error && user) musteriId = user.id
  }

  if (!musteriId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // İşletmenin açtığı kanallar
  const { data: isletme } = await db
    .from('bildirim_kanal_ayarlari')
    .select('kanal, aktif')
    .eq('restaurant_id', restaurantId)

  // Müşterinin mevcut tercihleri
  const { data: tercih } = await db
    .from('musteri_kanal_tercihleri')
    .select('kanal, aktif')
    .eq('musteri_id', musteriId)
    .eq('restaurant_id', restaurantId)

  const acikKanallar = new Set((isletme ?? []).filter((r: Record<string, unknown>) => r.aktif).map((r: Record<string, unknown>) => r.kanal))
  const musteriTercih = new Map((tercih ?? []).map((r: Record<string, unknown>) => [r.kanal, r.aktif]))

  const kanallar = KANALLAR
    .filter(k => acikKanallar.has(k)) // sadece işletmenin açtıkları
    .map(k => ({
      kanal: k,
      aktif: musteriTercih.get(k) ?? true, // varsayılan açık
    }))

  return NextResponse.json({ restaurant_id: restaurantId, kanallar })
}

// PUT /api/musteri/kanal-tercihleri
// Body: { restaurant_id, kanallar: [{ kanal, aktif }] }
// Müşteri yalnızca işletmenin AÇIK bıraktığı kanalları değiştirebilir.
export async function PUT(req: NextRequest) {
  const jar = await cookies()
  const panelSession = verifySession(jar.get('cr_panel')?.value ?? '')

  const auth = req.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/)
  const db = getSupabaseAdmin()

  let musteriId: string | null = null
  if (panelSession?.userId) {
    musteriId = panelSession.userId
  } else if (match) {
    const { data: { user }, error } = await db.auth.getUser(match[1])
    if (!error && user) musteriId = user.id
  }
  if (!musteriId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const restaurantId = String(body.restaurant_id ?? '')
  const kanallar = Array.isArray(body.kanallar) ? body.kanallar : []
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  // İşletmenin açtığı kanalları kontrol et — müşteri kapalı bir kanalı AÇAMAZ
  const { data: isletme } = await db
    .from('bildirim_kanal_ayarlari')
    .select('kanal, aktif')
    .eq('restaurant_id', restaurantId)
  const acikKanallar = new Set((isletme ?? []).filter((r: Record<string, unknown>) => r.aktif).map((r: Record<string, unknown>) => r.kanal))

  for (const k of kanallar) {
    const kanal = String(k.kanal ?? '')
    if (!KANALLAR.includes(kanal as never)) continue
    const aktif = !!k.aktif
    // Müşteri yalnızca işletmenin açtığı kanalı seçebilir; kapalı kanal AÇILAMAZ
    if (aktif && !acikKanallar.has(kanal)) continue
    await db
      .from('musteri_kanal_tercihleri')
      .upsert({ musteri_id: musteriId, restaurant_id: restaurantId, kanal, aktif, updated_at: new Date().toISOString() }, { onConflict: 'musteri_id,restaurant_id,kanal' })
  }

  return NextResponse.json({ ok: true })
}
