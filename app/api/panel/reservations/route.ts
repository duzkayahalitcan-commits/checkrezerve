import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'
import { isValidPhone, phoneKey } from '@/lib/phone'

// OP-03: Panelden manuel (telefonla gelen) rezervasyon.
//   GET  ?phone=…  → aynı işletmede bu numarayla kayıtlı son misafir adı (otomatik doldurma)
//   POST           → rezervasyon oluşturur (status=confirmed, source=phone)
// İşletme, oturumdaki restaurantId'dir; body'den alınmaz.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/

async function getSession() {
  const jar = await cookies()
  return verifySession(jar.get('cr_panel')?.value ?? '')
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const key = phoneKey(req.nextUrl.searchParams.get('phone'))
  if (key.length < 10) return NextResponse.json({ guest: null })

  // guest_phone DB'de karışık biçimde → son 10 haneyle aday çek, anahtarla eşleştir
  const { data, error } = await getSupabaseAdmin()
    .from('reservations')
    .select('guest_name, guest_phone, guest_email, reserved_date')
    .eq('restaurant_id', session.restaurantId)
    .ilike('guest_phone', `%${key.slice(-7)}`)
    .order('reserved_date', { ascending: false })
    .limit(20)
  if (error) {
    console.error('[panel/reservations GET]', error)
    return NextResponse.json({ guest: null })
  }
  const match = (data ?? []).find(r => phoneKey(r.guest_phone) === key)
  const visits = (data ?? []).filter(r => phoneKey(r.guest_phone) === key).length
  return NextResponse.json({
    guest: match ? { name: match.guest_name, email: match.guest_email, visits, lastVisit: match.reserved_date } : null,
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })

  const name  = String(body.guest_name ?? '').trim()
  const phone = String(body.guest_phone ?? '').trim()
  const date  = String(body.reserved_date ?? '')
  const time  = String(body.reserved_time ?? '').slice(0, 5)
  const party = Math.max(1, Math.min(100, parseInt(body.party_size, 10) || 1))
  const calisanId = body.calisan_id && UUID_RE.test(body.calisan_id) ? body.calisan_id : null
  const hizmetId  = body.hizmet_id && UUID_RE.test(body.hizmet_id) ? body.hizmet_id : null

  if (!name) return NextResponse.json({ error: 'Misafir adı zorunlu.' }, { status: 400 })
  if (!isValidPhone(phone)) return NextResponse.json({ error: 'Telefon numarası geçersiz. Örnek: 0 5XX XXX XX XX' }, { status: 400 })
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return NextResponse.json({ error: 'Tarih veya saat geçersiz.' }, { status: 400 })

  const db = getSupabaseAdmin()

  // Seçilen çalışan/hizmet bu işletmeye mi ait?
  if (calisanId) {
    const { data } = await db.from('calisanlar').select('id').eq('id', calisanId).eq('restaurant_id', session.restaurantId).maybeSingle()
    if (!data) return NextResponse.json({ error: 'Çalışan bulunamadı.' }, { status: 400 })
    // OP-08: aynı çalışana aynı saatte ikinci rezervasyon verilmesin
    const { data: clash } = await db.from('reservations').select('id')
      .eq('restaurant_id', session.restaurantId).eq('calisan_id', calisanId)
      .eq('reserved_date', date).eq('reserved_time', time).neq('status', 'cancelled').limit(1)
    if (clash?.length) return NextResponse.json({ error: 'Bu çalışanın o saatte başka bir rezervasyonu var.' }, { status: 409 })
  }
  if (hizmetId) {
    const { data } = await db.from('hizmetler').select('id').eq('id', hizmetId).eq('restaurant_id', session.restaurantId).maybeSingle()
    if (!data) return NextResponse.json({ error: 'Hizmet bulunamadı.' }, { status: 400 })
  }

  // OP-04: walk-in = kapıdan gelen. source CHECK'i 'walk_in'i ancak SQL 06 sonrası kabul eder;
  // öncesinde 'phone' + not önekiyle yazılır (23514 = check_violation).
  const walkIn = body.walk_in === true
  const notes = String(body.notes ?? '').trim()
  const insertRow = (source: string, noteText: string | null) => db
    .from('reservations')
    .insert({
      restaurant_id:      session.restaurantId,
      guest_name:         name,
      guest_phone:        phone,
      party_size:         party,
      reserved_date:      date,
      reserved_time:      time,
      calisan_id:         calisanId,
      hizmet_id:          hizmetId,
      special_requests:   noteText,
      status:             'confirmed',
      source,
      cancellation_token: createHash('sha256').update(randomBytes(32)).digest('hex').slice(0, 32),
    })
    .select('id')
    .single()

  let { data, error } = await insertRow(walkIn ? 'walk_in' : 'phone', notes || null)
  if (walkIn && error?.code === '23514') {
    ;({ data, error } = await insertRow('phone', `[Walk-in]${notes ? ' ' + notes : ''}`))
  }

  if (error) {
    console.error('[panel/reservations POST]', error)
    return NextResponse.json({ error: 'Rezervasyon kaydedilemedi. Lütfen tekrar deneyin.' }, { status: 500 })
  }
  return NextResponse.json({ success: true, id: data!.id })
}
