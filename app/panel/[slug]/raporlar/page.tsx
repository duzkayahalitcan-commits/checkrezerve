import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import RaporlarClient from './RaporlarClient'
import CalisanGelir from './CalisanGelir'

export const dynamic = 'force-dynamic'

type SP = Promise<{ period?: string; bas?: string; son?: string }>

export default async function RaporlarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: SP
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')
  const { slug } = await params
  const { period, bas, son } = await searchParams
  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, slug, onboarding_completed, business_type')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')
  if (!restaurant.onboarding_completed) redirect(`/panel/${slug}/onboarding`)

  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  // Dönem hesapla
  let dateFrom: string, dateTo: string, prevFrom: string, prevTo: string
  const periodType = period ?? 'month'

  if (periodType === 'day') {
    dateFrom = today; dateTo = today
    const y = new Date(now); y.setDate(now.getDate() - 1)
    prevFrom = y.toISOString().slice(0, 10); prevTo = prevFrom
  } else if (periodType === 'week') {
    const day = now.getDay() === 0 ? 7 : now.getDay()
    const mon = new Date(now); mon.setDate(now.getDate() - day + 1)
    dateFrom = mon.toISOString().slice(0, 10); dateTo = today
    const pmon = new Date(mon); pmon.setDate(mon.getDate() - 7)
    const psun = new Date(dateTo + 'T12:00'); psun.setDate(psun.getDate() - 7)
    prevFrom = pmon.toISOString().slice(0, 10); prevTo = psun.toISOString().slice(0, 10)
  } else if (periodType === 'custom' && bas && son) {
    dateFrom = bas; dateTo = son
    const range = (new Date(son).getTime() - new Date(bas).getTime()) / 86400000
    const pEnd = new Date(bas); pEnd.setDate(pEnd.getDate() - 1)
    const pStart = new Date(pEnd); pStart.setDate(pStart.getDate() - Math.round(range))
    prevFrom = pStart.toISOString().slice(0, 10); prevTo = pEnd.toISOString().slice(0, 10)
  } else {
    dateFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    dateTo = today
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    prevFrom = `${lm.getFullYear()}-${String(lm.getMonth() + 1).padStart(2, '0')}-01`
    const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    prevTo = lmEnd.toISOString().slice(0, 10)
  }

  // Ana veri
  const [{ data: currentRes }, { data: prevRes }, { data: allCurrent }, { data: hizmetler }, { data: calisanlar }, { data: dailyData }, { data: hourlyData }, { data: serviceData }] = await Promise.all([
    db.from('reservations').select('id, status').eq('restaurant_id', restaurant.id).gte('reserved_date', dateFrom).lte('reserved_date', dateTo),
    db.from('reservations').select('id, status').eq('restaurant_id', restaurant.id).gte('reserved_date', prevFrom).lte('reserved_date', prevTo),
    db.from('reservations').select('id, guest_name, guest_phone, reserved_date, reserved_time, party_size, status, notes, hizmet_id, calisan_id, created_at').eq('restaurant_id', restaurant.id).gte('reserved_date', dateFrom).lte('reserved_date', dateTo).order('reserved_date', { ascending: false }).order('reserved_time', { ascending: false }),
    db.from('hizmetler').select('id, ad, fiyat').eq('restaurant_id', restaurant.id).eq('aktif', true),
    db.from('calisanlar').select('id, ad').eq('restaurant_id', restaurant.id).eq('aktif', true),
    // Günlük rezervasyon sayısı
    db.from('reservations').select('reserved_date, id').eq('restaurant_id', restaurant.id).neq('status', 'cancelled').gte('reserved_date', dateFrom).lte('reserved_date', dateTo),
    // Saatlik dağılım
    db.from('reservations').select('reserved_time').eq('restaurant_id', restaurant.id).neq('status', 'cancelled').gte('reserved_date', dateFrom).lte('reserved_date', dateTo),
    // Hizmet bazlı
    db.from('reservations').select('hizmet_id').eq('restaurant_id', restaurant.id).neq('status', 'cancelled').not('hizmet_id', 'is', null).gte('reserved_date', dateFrom).lte('reserved_date', dateTo),
  ])

  const total = currentRes?.length ?? 0
  const prevTotal = prevRes?.length ?? 0
  const diff = total - prevTotal
  const diffPct = prevTotal > 0 ? Math.round((diff / prevTotal) * 100) : total > 0 ? 100 : 0

  // Durum kırılımı (onaylanan/iptal/tamamlanan)
  const statusLabels: Record<string, string> = {
    confirmed: 'Onaylanan', pending: 'Bekleyen',
    cancelled: 'İptal', completed: 'Tamamlanan',
  }
  const statusCount = new Map<string, number>()
  for (const r of currentRes ?? []) {
    const s = (r.status as string) ?? 'unknown'
    statusCount.set(s, (statusCount.get(s) ?? 0) + 1)
  }
  const statusBreakdown = Array.from(statusCount.entries())
    .map(([k, count]) => ({ label: statusLabels[k] ?? k, count }))
    .sort((a, b) => b.count - a.count)


  const cancelled = currentRes?.filter(r => r.status === 'cancelled').length ?? 0
  const cancelPct = total > 0 ? Math.round((cancelled / total) * 100) : 0
  const prevCancel = prevRes?.filter(r => r.status === 'cancelled').length ?? 0
  const prevCancelPct = prevTotal > 0 ? Math.round((prevCancel / prevTotal) * 100) : 0

  // Gelir: hizmet_fiyati * rezervasyon sayısı (basit)
  const servicePriceMap = new Map((hizmetler ?? []).map(h => [h.id, h.fiyat]))
  let revenue = 0
  for (const r of allCurrent ?? []) {
    if (r.status !== 'cancelled' && r.hizmet_id && servicePriceMap.has(r.hizmet_id)) {
      revenue += servicePriceMap.get(r.hizmet_id)!
    }
  }
  const prevRevenue = 0 // basit tutuldu

  // Günlük bar chart
  const dayMap = new Map<string, number>()
  for (const r of dailyData ?? []) {
    const d = r.reserved_date as string
    dayMap.set(d, (dayMap.get(d) ?? 0) + 1)
  }
  const barData = Array.from(dayMap.entries()).map(([date, count]) => ({
    label: new Date(date + 'T12:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    count,
  }))

  // Saatlik heatmap
  const hourMap = new Map<string, number>()
  for (const r of hourlyData ?? []) {
    const h = (r.reserved_time as string)?.slice(0, 5)
    if (h) hourMap.set(h, (hourMap.get(h) ?? 0) + 1)
  }
  const heatmapData = Array.from({ length: 16 }, (_, i) => {
    const h = `${String(i + 8).padStart(2, '0')}:00`
    return { hour: h, count: hourMap.get(h) ?? 0 }
  })

  // Hizmet dağılımı
  const hizmetCount = new Map<string, number>()
  for (const r of serviceData ?? []) {
    const hid = r.hizmet_id as string
    hizmetCount.set(hid, (hizmetCount.get(hid) ?? 0) + 1)
  }
  const hServiceMap = new Map((hizmetler ?? []).map(h => [h.id, h.ad]))
  const pieData = Array.from(hizmetCount.entries()).map(([id, count]) => ({
    name: hServiceMap.get(id) ?? 'Bilinmeyen',
    value: count,
  }))

  // Personel performansı
  const { data: staffRes } = await db
    .from('reservations').select('calisan_id').eq('restaurant_id', restaurant.id).neq('status', 'cancelled').not('calisan_id', 'is', null).gte('reserved_date', dateFrom).lte('reserved_date', dateTo)
  const staffCount = new Map<string, number>()
  for (const r of staffRes ?? []) {
    const cid = r.calisan_id as string
    staffCount.set(cid, (staffCount.get(cid) ?? 0) + 1)
  }
  const staffNameMap = new Map((calisanlar ?? []).map(c => [c.id, c.ad]))
  const staffBarData = Array.from(staffCount.entries()).map(([id, count]) => ({
    name: staffNameMap.get(id) ?? 'Bilinmeyen',
    count,
  })).sort((a, b) => b.count - a.count)

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Raporlar</h1>
        <p className="text-xs text-stone-500 mt-0.5">Rezervasyon ve gelir istatistikleri</p>
      </div>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
        <RaporlarClient
          slug={slug}
          businessType={restaurant.business_type as string | null}
          total={total} diff={diff} diffPct={diffPct}
          cancelPct={cancelPct} prevCancelPct={prevCancelPct}
          revenue={revenue} prevRevenue={prevRevenue}
          statusBreakdown={statusBreakdown}
          barData={barData}
          heatmapData={heatmapData}
          pieData={pieData}
          staffBarData={staffBarData}
          reservations={allCurrent ?? []}
          dateFrom={dateFrom} dateTo={dateTo}
          period={periodType}
        />

        {/* Eğitmen Bazlı Gelir Raporu */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h2 className="font-semibold text-sm text-stone-200 mb-4">Eğitmen Gelir Raporu</h2>
          <CalisanGelir restaurantId={restaurant.id} />
        </section>
      </main>
    </div>
  )
}
