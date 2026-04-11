import { NextRequest, NextResponse } from 'next/server'
import { cookies }                  from 'next/headers'
import { createHmac }               from 'crypto'
import { getSupabaseAdmin }         from '@/lib/supabase'

// Cookie doğrulama (panel session)
function verifySession(raw: string): { userId: string; restaurantId: string } | null {
  const parts = raw.split(':')
  if (parts.length < 3) return null
  const [userId, restaurantId, ...tokenParts] = parts
  const token    = tokenParts.join(':')
  const secret   = process.env.ADMIN_SECRET ?? 'dev-secret-change-me'
  const expected = createHmac('sha256', secret).update(`${userId}:${restaurantId}`).digest('base64url')
  if (token !== expected) return null
  return { userId, restaurantId }
}

// CSV satırı: özel karakter escape
function csvEscape(val: string | number | null | undefined): string {
  const str = val == null ? '' : String(val)
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

export async function GET(req: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const jar     = await cookies()
  const rawCookie = jar.get('cr_panel')?.value
  if (!rawCookie) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const session = verifySession(rawCookie)
  if (!session) return NextResponse.json({ error: 'Geçersiz oturum.' }, { status: 401 })

  // ─── Parametre doğrulama ─────────────────────────────────────────────────
  const url         = req.nextUrl
  const restaurantId = url.searchParams.get('restaurantId') ?? ''
  const weekStart    = url.searchParams.get('weekStart') ?? ''
  const weekEnd      = url.searchParams.get('weekEnd') ?? ''

  // RBAC: kullanıcı sadece kendi restoranını export edebilir
  if (restaurantId !== session.restaurantId) {
    return NextResponse.json({ error: 'Bu restorana erişim yetkiniz yok.' }, { status: 403 })
  }

  // Tarih aralığı doğrulama — sadece cari veya geçmiş haftaları export et, gelecek yok
  const today   = new Date().toISOString().slice(0, 10)
  if (weekEnd > today) {
    // Henüz bitmemiş haftalar için weekEnd'i bugünle sınırla
    // (mevcut haftanın yarısını export edebilirler)
  }

  // Haftalık aralık en fazla 7 gün olabilir
  const diffDays = (new Date(weekEnd).getTime() - new Date(weekStart).getTime()) / 86400000
  if (diffDays > 7 || diffDays < 0) {
    return NextResponse.json({ error: 'Geçersiz tarih aralığı.' }, { status: 400 })
  }

  // ─── Veri çek ────────────────────────────────────────────────────────────
  const db = getSupabaseAdmin()
  const { data: rows, error } = await db
    .from('reservations')
    .select('customer_name, phone, date, time, party_size, status, special_requests, source')
    .eq('restaurant_id', restaurantId)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) return NextResponse.json({ error: 'Veri çekilemedi.' }, { status: 500 })

  // ─── Export log kaydet ────────────────────────────────────────────────────
  await db.from('export_logs').insert({
    restaurant_user_id: session.userId,
    restaurant_id:      restaurantId,
    export_type:        'weekly_csv',
    week_start:         weekStart,
    week_end:           weekEnd,
    row_count:          rows?.length ?? 0,
  })

  // ─── CSV oluştur ──────────────────────────────────────────────────────────
  const headers = ['Ad Soyad', 'Telefon', 'Tarih', 'Saat', 'Kişi Sayısı', 'Durum', 'Notlar', 'Kaynak']
  const lines   = [
    headers.join(','),
    ...(rows ?? []).map(r =>
      [
        r.customer_name,
        r.phone,
        r.date,
        r.time ?? '',
        r.party_size,
        r.status,
        r.special_requests ?? '',
        r.source,
      ].map(csvEscape).join(',')
    ),
  ]

  return new NextResponse(lines.join('\r\n'), {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rezervasyonlar_${weekStart}_${weekEnd}.csv"`,
    },
  })
}
