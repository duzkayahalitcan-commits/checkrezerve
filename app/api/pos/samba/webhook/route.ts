import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
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
 * Header: X-Webhook-Secret — restaurant_secrets.webhook_secret ile eşleşmeli
 *   (restaurants.webhook_secret anon'a açıktı; sırlar service_role-only tabloya taşındı — SQL 04-SC-02)
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

  // ─── 3) Sır doğrulama (restaurant_secrets, sadece service_role) ────────
  const { data: secretRow, error: secErr } = await db
    .from('restaurant_secrets')
    .select('webhook_secret')
    .eq('restaurant_id', restaurant_id)
    .maybeSingle()
  if (secErr) console.error('[pos-webhook] restaurant_secrets okunamadı:', secErr.message)

  // Geçiş dönemi: tablo boş/erişilemezse eski kolona düş (SQL 08 eski kolonu boşaltınca devre dışı kalır)
  let dbSecret = secretRow?.webhook_secret ?? null
  if (!dbSecret) {
    const { data: legacy } = await db.from('restaurants').select('webhook_secret').eq('id', restaurant_id).maybeSingle()
    dbSecret = legacy?.webhook_secret ?? null
  }
  if (dbSecret?.startsWith('\\x')) dbSecret = dbSecret.slice(2) // bytea hex öneki

  // İşletme yoksa da 401 (varlığı sızdırma); karşılaştırma sabit zamanlı
  const a = Buffer.from(dbSecret ?? '')
  const b = Buffer.from(headerSecret)
  if (!dbSecret || a.length !== b.length || !timingSafeEqual(a, b)) {
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
  // Türkiye tarihi (UTC 21:00 sonrası ertesi gün) — toISOString UTC gününü veriyordu
  const today = new Date(Date.now() + 3 * 3600_000).toISOString().split('T')[0]

  const { data: reservation, error: resErr } = await db
    .from('reservations')
    .select('id, guest_name, reserved_time, special_requests')
    .eq('restaurant_id', restaurant_id)
    .eq('table_id', table.id)
    .eq('reserved_date', today)   // legacy `date` kolonu yeni kayıtlarda boş
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
  // `completed_at` kolonu DB'de yok → update her zaman 500 dönüyordu. Kapanış zamanı yanıtta döner.
  const completedAt = closed_at ?? new Date().toISOString()
  const posNote = typeof total === 'number' ? `POS ödeme: ${total.toFixed(2)} TL` : null

  const { error: updateErr } = await db
    .from('reservations')
    .update({
      status: 'completed',
      // Müşteri notunu ezme, POS bilgisini ekle
      ...(posNote ? { special_requests: [reservation.special_requests, posNote].filter(Boolean).join(' | ') } : {}),
    })
    .eq('id', reservation.id)
    .eq('restaurant_id', restaurant_id)

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
