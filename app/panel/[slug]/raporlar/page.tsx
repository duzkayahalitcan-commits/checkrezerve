import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import ReservationChart from './ReservationChart'

export const dynamic = 'force-dynamic'

export default async function RaporlarPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  const now   = new Date()
  const today = now.toISOString().slice(0, 10)

  // This month / last month bounds
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastMonthDate  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`

  // Last 7 days for chart
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  const sevenDaysStr = sevenDaysAgo.toISOString().slice(0, 10)

  const [
    { data: thisMonthRes },
    { data: lastMonthRes },
    { data: weeklyRes },
  ] = await Promise.all([
    db.from('reservations')
      .select('id, status')
      .eq('restaurant_id', restaurant.id)
      .gte('reserved_date', thisMonthStart)
      .lte('reserved_date', today),
    db.from('reservations')
      .select('id, status')
      .eq('restaurant_id', restaurant.id)
      .gte('reserved_date', lastMonthStart)
      .lt('reserved_date', thisMonthStart),
    db.from('reservations')
      .select('id, reserved_date, guest_name, guest_email, guest_phone, party_size')
      .eq('restaurant_id', restaurant.id)
      .gte('reserved_date', sevenDaysStr)
      .lte('reserved_date', today)
      .neq('status', 'cancelled'),
  ])

  // Build 7-day chart data
  const dayMap = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    dayMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const r of weeklyRes ?? []) {
    const key = r.reserved_date as string
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
  }
  const chartData = Array.from(dayMap.entries()).map(([date, count]) => ({
    label: new Date(date + 'T12:00').toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
    count,
  }))

  // Top 5 customers
  const customerMap = new Map<string, { name: string; count: number }>()
  for (const r of weeklyRes ?? []) {
    const key = (r.guest_email as string | null) ?? (r.guest_phone as string | null) ?? (r.guest_name as string)
    if (!customerMap.has(key)) customerMap.set(key, { name: r.guest_name as string, count: 0 })
    customerMap.get(key)!.count++
  }
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Popular time slot (from all reservations this month)
  const { data: timeData } = await db
    .from('reservations')
    .select('reserved_time')
    .eq('restaurant_id', restaurant.id)
    .gte('reserved_date', thisMonthStart)
    .neq('status', 'cancelled')

  const timeSlotMap = new Map<string, number>()
  for (const r of timeData ?? []) {
    const slot = (r.reserved_time as string)?.slice(0, 5)
    if (slot) timeSlotMap.set(slot, (timeSlotMap.get(slot) ?? 0) + 1)
  }
  const popularSlot = [...timeSlotMap.entries()].sort((a, b) => b[1] - a[1])[0]

  const thisTotal = (thisMonthRes ?? []).length
  const lastTotal = (lastMonthRes ?? []).length
  const diff      = thisTotal - lastTotal
  const diffPct   = lastTotal > 0 ? Math.round(Math.abs(diff) / lastTotal * 100) : null

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Raporlar</h1>
        <p className="text-xs text-stone-500 mt-0.5">Rezervasyon analizi ve istatistikler</p>
      </div>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Month comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-1">Bu Ay</p>
            <p className="text-3xl font-bold text-white">{thisTotal}</p>
            {diffPct !== null && (
              <p className={`text-xs mt-1 font-semibold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {diff >= 0 ? '▲' : '▼'} {diffPct}% geçen aya göre
              </p>
            )}
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-1">Geçen Ay</p>
            <p className="text-3xl font-bold text-white">{lastTotal}</p>
            <p className="text-xs text-stone-600 mt-1">Karşılaştırma dönemi</p>
          </div>
        </div>

        {/* 7-day bar chart */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-200 mb-4">Son 7 Gün</h2>
          <ReservationChart data={chartData} />
        </div>

        {/* Top customers + popular slot */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-200 mb-4">En Çok Rezervasyon — Top 5</h2>
            {topCustomers.length === 0 ? (
              <p className="text-stone-500 text-sm">Bu hafta veri yok</p>
            ) : (
              <div className="space-y-2">
                {topCustomers.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm text-stone-300 font-medium">{c.name}</span>
                    </div>
                    <span className="text-xs text-stone-500">{c.count} rez.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-200 mb-4">En Popüler Saat</h2>
            {popularSlot ? (
              <div className="text-center py-4">
                <p className="text-4xl font-black text-white">{popularSlot[0]}</p>
                <p className="text-sm text-stone-500 mt-2">{popularSlot[1]} rezervasyon bu saatte</p>
              </div>
            ) : (
              <p className="text-stone-500 text-sm">Bu ay veri yok</p>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
