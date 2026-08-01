import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'
import { isValidVoiceKey, DEFAULT_VOICE_KEY } from '@/lib/voice-catalog'

// Ses değiştirme kilidi: işletme sahibi 24 saatte bir değiştirebilir.
// super_admin bu kısıtlamayı bypass eder.
const LOCK_HOURS = 24
const LOCK_MS = LOCK_HOURS * 60 * 60 * 1000

async function getSession() {
  const cookieStore = await cookies()
  const session = verifySession(cookieStore.get('cr_panel')?.value ?? '')
  return session
}

// GET /api/panel/voice-settings?restaurant_id=...
// İşletmenin mevcut sesi + kilit durumunu döner.
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('restaurants')
    .select('voice_id, voice_changed_at')
    .eq('id', restaurantId)
    .single()

  const voiceId = data?.voice_id ?? DEFAULT_VOICE_KEY
  const changedAt = data?.voice_changed_at ? new Date(data.voice_changed_at).getTime() : null
  const isSuperAdmin = session.role === 'super_admin'

  // Kilit durumu (super_admin bypass)
  let lockedUntil: number | null = null
  if (!isSuperAdmin && changedAt) {
    const until = changedAt + LOCK_MS
    if (until > Date.now()) lockedUntil = until
  }

  return NextResponse.json({
    voice_id: voiceId,
    voice_changed_at: data?.voice_changed_at ?? null,
    locked: lockedUntil !== null,
    locked_until: lockedUntil,
    remaining_ms: lockedUntil ? lockedUntil - Date.now() : 0,
    is_super_admin: isSuperAdmin,
    lock_hours: LOCK_HOURS,
  })
}

// PATCH /api/panel/voice-settings
// Body: { restaurant_id, voice_id }
// Rol + zaman kontrolü yapar. super_admin kısıtlamayı bypass eder.
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { restaurant_id?: string; voice_id?: string }
  const restaurantId = body.restaurant_id ?? session.restaurantId
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!body.voice_id || !isValidVoiceKey(body.voice_id)) {
    return NextResponse.json({ error: 'Geçersiz voice_id' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Mevcut ses + değişiklik zamanını çek
  const { data: current } = await db
    .from('restaurants')
    .select('voice_id, voice_changed_at')
    .eq('id', restaurantId)
    .single()

  const changedAt = current?.voice_changed_at ? new Date(current.voice_changed_at).getTime() : null
  const isSuperAdmin = session.role === 'super_admin'

  // 24 saat kilit kontrolü — super_admin bypass eder
  if (!isSuperAdmin && changedAt) {
    const until = changedAt + LOCK_MS
    if (until > Date.now()) {
      const remainingHours = Math.ceil((until - Date.now()) / (60 * 60 * 1000))
      return NextResponse.json({
        error: `Ses değiştirme kilidi aktif. ${remainingHours} saat sonra tekrar değiştirebilirsiniz.`,
        locked: true,
        locked_until: until,
        remaining_ms: until - Date.now(),
      }, { status: 429 })
    }
  }

  // Ses değişti mi kontrol et — değişmediyse voice_changed_at'ı güncelleme
  const changed = current?.voice_id !== body.voice_id
  const update: Record<string, unknown> = { voice_id: body.voice_id }
  if (changed) update.voice_changed_at = new Date().toISOString()

  const { error } = await db
    .from('restaurants')
    .update(update)
    .eq('id', restaurantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    voice_id: body.voice_id,
    voice_changed_at: changed ? new Date().toISOString() : (current?.voice_changed_at ?? null),
    changed,
  })
}
