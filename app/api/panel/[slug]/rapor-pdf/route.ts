import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyPanelToken } from '@/lib/middleware-auth'
import { sectorTerm } from '@/lib/sector-terminology'
import { generateReportPdf } from '@/lib/report-pdf'

// GET /api/panel/[slug]/rapor-pdf?bas=YYYY-MM-DD&son=YYYY-MM-DD
// Seçilen döneme ait raporu marka temalı PDF olarak döndürür.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const jar = await cookies()
  const secret = process.env.ADMIN_SECRET
  if (!secret || !verifyPanelToken(jar.get('cr_panel')?.value ?? '', secret)) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const bas = req.nextUrl.searchParams.get('bas')
  const son = req.nextUrl.searchParams.get('son')
  if (!bas || !son || bas > son) {
    return NextResponse.json({ error: 'Geçersiz tarih aralığı.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // İşletmeyi bul (slug + session tenant)
  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, business_type')
    .eq('slug', slug)
    .maybeSingle()
  if (!restaurant) return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 })

  const term = sectorTerm(restaurant.business_type as string | null)

  // Rezervasyonlar
  const { data: reservations } = await db
    .from('reservations')
    .select('id, status, hizmet_id, reserved_date, reserved_time')
    .eq('restaurant_id', restaurant.id)
    .gte('reserved_date', bas)
    .lte('reserved_date', son)

  // Hizmetler (ciro hesaplamak için)
  const { data: hizmetler } = await db
    .from('hizmetler')
    .select('id, fiyat')
    .eq('restaurant_id', restaurant.id)

  const list = reservations ?? []
  const total = list.length

  // Durum kırılımı
  const statusLabels: Record<string, string> = {
    confirmed: 'Onaylanan', pending: 'Bekleyen',
    cancelled: 'İptal', completed: 'Tamamlanan',
  }
  const statusCount = new Map<string, number>()
  for (const r of list) {
    const s = (r.status as string) ?? 'unknown'
    statusCount.set(s, (statusCount.get(s) ?? 0) + 1)
  }
  const statusBreakdown = Array.from(statusCount.entries())
    .map(([k, count]) => ({ label: statusLabels[k] ?? k, count }))
    .sort((a, b) => b.count - a.count)

  // Ciro — tamamlanan + onaylanan hizmet fiyatları
  const priceMap = new Map((hizmetler ?? []).map((h: Record<string, unknown>) => [h.id, h.fiyat as number]))
  let revenue = 0
  for (const r of list) {
    const st = r.status as string
    if ((st === 'completed' || st === 'confirmed') && r.hizmet_id && priceMap.has(r.hizmet_id as string)) {
      revenue += priceMap.get(r.hizmet_id as string)!
    }
  }

  // Günlük trend
  const dayMap = new Map<string, number>()
  const dayNameMap = new Map<string, string>()
  for (const r of list) {
    const d = r.reserved_date as string
    dayMap.set(d, (dayMap.get(d) ?? 0) + 1)
    dayNameMap.set(d, new Date(d + 'T12:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }))
  }
  const dailyTrend = Array.from(dayMap.entries())
    .map(([date, count]) => ({ label: dayNameMap.get(date) ?? date, count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'tr'))

  // En yoğun saat
  const hourMap = new Map<string, number>()
  for (const r of list) {
    const h = (r.reserved_time as string)?.slice(0, 5)
    if (h) hourMap.set(h, (hourMap.get(h) ?? 0) + 1)
  }
  let peakHour: string | null = null
  let maxHour = 0
  for (const [h, c] of hourMap) { if (c > maxHour) { maxHour = c; peakHour = h } }

  // En yoğun gün (hafta içi)
  const weekdayMap = new Map<string, number>()
  const weekdayNameMap: Record<string, string> = {
    '0': 'Pazar', '1': 'Pazartesi', '2': 'Salı', '3': 'Çarşamba',
    '4': 'Perşembe', '5': 'Cuma', '6': 'Cumartesi',
  }
  for (const r of list) {
    const wd = String(new Date((r.reserved_date as string) + 'T12:00').getDay())
    weekdayMap.set(wd, (weekdayMap.get(wd) ?? 0) + 1)
  }
  let peakDay: string | null = null
  let maxDay = 0
  for (const [wd, c] of weekdayMap) { if (c > maxDay) { maxDay = c; peakDay = weekdayNameMap[wd] } }

  // PDF üret
  try {
    const buffer = await generateReportPdf({
      restaurantName: restaurant.name,
      term,
      dateFrom: bas,
      dateTo: son,
      total,
      statusBreakdown,
      revenue,
      dailyTrend,
      peakHour,
      peakDay,
    })
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapor-${bas}-${son}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[rapor-pdf]', err)
    return NextResponse.json({ error: 'PDF oluşturulamadı.' }, { status: 500 })
  }
}
