import { redirect }        from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getLocale }        from 'next-intl/server'
import CalendarGrid         from './CalendarGrid'
import WeeklyView           from './WeeklyView'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ m?: string; view?: string }>

export default async function TakvimPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: SearchParams
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug }       = await params
  const { m, view }    = await searchParams
  const locale         = await getLocale()
  const isWeekly       = view === 'haftalik'

  // Parse ?m=YYYY-MM or default to current month
  const now   = new Date()
  let year    = now.getFullYear()
  let month   = now.getMonth() + 1

  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [y, mo] = m.split('-').map(Number)
    if (y >= 2020 && y <= 2030 && mo >= 1 && mo <= 12) {
      year = y; month = mo
    }
  }

  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  // For weekly view: fetch 3 weeks (prev + current + next) for WeeklyView offset support
  // For monthly view: fetch the month
  const day     = now.getDay() === 0 ? 7 : now.getDay()
  const weekMon = new Date(now); weekMon.setDate(now.getDate() - day + 1 - 7)
  const weekSun = new Date(now); weekSun.setDate(now.getDate() - day + 1 + 7 * 2 - 1)
  const weekStart = weekMon.toISOString().slice(0, 10)
  const weekEnd   = weekSun.toISOString().slice(0, 10)

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay    = new Date(year, month, 0).getDate()
  const monthEnd   = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const dateFrom = isWeekly ? weekStart : monthStart
  const dateTo   = isWeekly ? weekEnd   : monthEnd

  const { data: reservations } = await db
    .from('reservations')
    .select(`
      id, guest_name, reserved_date, reserved_time,
      party_size, status,
      calisanlar(ad),
      hizmetler(ad)
    `)
    .eq('restaurant_id', restaurant.id)
    .gte('reserved_date', dateFrom)
    .lte('reserved_date', dateTo)
    .order('reserved_time', { ascending: true })

  const allRes = reservations ?? []

  type CalRes = typeof allRes[number] & {
    calisanlar?: { ad: string } | null
    hizmetler?: { ad: string } | null
  }

  const reservationsByDate: Record<string, CalRes[]> = {}
  const dayDataMap: Record<string, { total: number; pending: number; confirmed: number }> = {}

  for (const r of allRes as CalRes[]) {
    const d = r.reserved_date
    if (!reservationsByDate[d]) reservationsByDate[d] = []
    reservationsByDate[d].push(r)

    if (!dayDataMap[d]) dayDataMap[d] = { total: 0, pending: 0, confirmed: 0 }
    if (r.status !== 'cancelled') dayDataMap[d].total++
    if (r.status === 'pending')   dayDataMap[d].pending++
    if (r.status === 'confirmed') dayDataMap[d].confirmed++
  }

  const dayData  = Object.entries(dayDataMap).map(([date, v]) => ({ date, ...v }))
  const monthName = new Date(year, month - 1, 1).toLocaleDateString(locale, {
    month: 'long', year: 'numeric',
  })

  const base = `/panel/${slug}/takvim`

  return (
    <div>
      {/* Page header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-500 capitalize">{monthName}</p>
          <h1 className="text-lg font-bold text-white mt-0.5">Rezervasyon Takvimi</h1>
        </div>
        {/* View toggle */}
        <div className="flex rounded-lg bg-stone-800 p-0.5 gap-0.5">
          <a
            href={`${base}?view=haftalik`}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              isWeekly ? 'bg-red-500/20 text-red-400' : 'text-stone-400 hover:text-white'
            }`}
          >
            Haftalık
          </a>
          <a
            href={base}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              !isWeekly ? 'bg-red-500/20 text-red-400' : 'text-stone-400 hover:text-white'
            }`}
          >
            Aylık
          </a>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {isWeekly ? (
          <WeeklyView reservationsByDate={reservationsByDate as Record<string, { id: string; guest_name: string | null; reserved_time: string; party_size: number | null; status: string }[]>} />
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            dayData={dayData}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reservationsByDate={reservationsByDate as any}
          />
        )}
      </main>
    </div>
  )
}
