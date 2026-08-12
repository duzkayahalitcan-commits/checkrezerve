import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { canEditSettings } from '@/lib/roles'

export const dynamic = 'force-dynamic'

const KANALLAR = ['email', 'sms', 'whatsapp', 'push'] as const

// GET /api/panel/bildirim-kanallari
// İşletmenin kanal ayarlarını döndürür.
export async function GET() {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canEditSettings(session.role ?? '')) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('bildirim_kanal_ayarlari')
    .select('kanal, aktif')
    .eq('restaurant_id', session.restaurantId)

  const ayarlar = KANALLAR.map(k => ({
    kanal: k,
    aktif: (data ?? []).find((r: Record<string, unknown>) => r.kanal === k)?.aktif ?? false,
  }))

  return NextResponse.json({ restaurant_id: session.restaurantId, ayarlar })
}

// PUT /api/panel/bildirim-kanallari
// Body: { kanallar: [{ kanal, aktif }] }
export async function PUT(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canEditSettings(session.role ?? '')) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }

  const body = await req.json()
  const kanallar = Array.isArray(body.kanallar) ? body.kanallar : []

  const db = getSupabaseAdmin()
  for (const k of kanallar) {
    const kanal = String(k.kanal ?? '')
    if (!KANALLAR.includes(kanal as never)) continue
    const aktif = !!k.aktif
    await db
      .from('bildirim_kanal_ayarlari')
      .upsert({ restaurant_id: session.restaurantId, kanal, aktif, updated_at: new Date().toISOString() }, { onConflict: 'restaurant_id,kanal' })
  }

  return NextResponse.json({ ok: true })
}
