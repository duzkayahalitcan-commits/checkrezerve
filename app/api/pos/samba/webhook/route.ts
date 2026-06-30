import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/pos/samba/webhook
 *
 * SambaPOS veya benzeri POS sistemlerinden gelen webhook.
 * Bir masa kapatıldığında çağrılır, ilgili rezervasyonu "completed" yapar.
 *
 * Body:
 *   table_name     string   — masa_tipleri.ad ile eşleşen masa adı
 *   restaurant_id  string   — UUID
 *   total          number   — ödeme tutarı (opsiyonel, log için)
 *   closed_at      string   — ISO 8601 zaman damgası
 *
 * Header: X-Webhook-Secret — restaurants.webhook_secret ile eşleşmeli
 */
export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin()

  // ─── 1) Header kontrolü ────────────────────────────────────────────────
  const headerSecret = req.headers.get('x-webhook-secret')
  if (!headerSecret) {
    return NextResponse.json({ error: 'X-Webhook-Secret header required' }, { status: 401 })
  }

  // ─── 2) Body parse ────────────────────────────────────────────────────
  let body: { table_name: string; restaurant_id: string; total?: number; closed_at?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { table_name, restaurant_id, total, closed_at } = body

  if (!table_name || !restaurant_id) {
    return NextResponse.json({ error: 'table_name and restaurant_id required' }, { status: 400 })
  }

  // ─── 3) Restoran kontrolü + webhook_secret doğrulama ──────────────────
  const { data: restaurant, error: restErr } = await db
    .from('restaurants')
    .select('id, webhook_secret, name')
    .eq('id', restaurant_id)
    .single()

  if (restErr || !restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  }

  // Supabase bytea tipini hex string'e çevir (\x prefix varsa kırp)
  const dbSecret = restaurant.webhook_secret?.startsWith('\\x')
    ? restaurant.webhook_secret.slice(2)
    : restaurant.webhook_secret

  if (!dbSecret || dbSecret !== headerSecret) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }

  // ─── 4) Masa_tipleri'nde eşleşen masayı bul ──────────────────────────
  const { data: table, error: tblErr } = await db
    .from('masa_tipleri')
    .select('id, ad')
    .eq('isletme_id', restaurant_id)
    .eq('ad', table_name)
    .eq('aktif', true)
    .single()

  if (tblErr || !table) {
    return NextResponse.json({ error: `Table '${table_name}' not found` }, { status: 404 })
  }

  // ─── 5) Bugünkü confirmed rezervasyonu bul ────────────────────────────
  const today = new Date().toISOString().split('T')[0]

  const { data: reservation, error: resErr } = await db
    .from('reservations')
    .select('id, guest_name, reserved_time')
    .eq('restaurant_id', restaurant_id)
    .eq('table_id', table.id)
    .eq('date', today)
    .eq('status', 'confirmed')
    .order('reserved_time', { ascending: false })
    .limit(1)
    .single()

  if (resErr || !reservation) {
    // Bugün bu masa için confirmed rezervasyon yok — bu normal olabilir
    // (masa boş oturum, yürüyen müşteri gibi). Yine de 200 dönüyoruz.
    return NextResponse.json({
      success: false,
      message: `No confirmed reservation found for table '${table_name}' today`,
    })
  }

  // ─── 6) Rezervasyonu completed yap ─────────────────────────────────────
  const completedAt = closed_at ?? new Date().toISOString()

  const { error: updateErr } = await db
    .from('reservations')
    .update({
      status: 'completed',
      completed_at: completedAt,
      // total varsa metadata'ya ekle
      ...(total ? { notes: `POS ödeme: ${total.toFixed(2)} TL` } : {}),
    })
    .eq('id', reservation.id)

  if (updateErr) {
    console.error('[pos-webhook] update error:', updateErr)
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
  }

  // ─── 7) Başarılı yanıt ────────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    reservation_id: reservation.id,
    guest_name: reservation.guest_name,
    completed_at: completedAt,
  })
}
