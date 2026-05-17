import { redirect }        from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getTranslations, getLocale } from 'next-intl/server'
import WeeklyChart          from './WeeklyChart'
import ExportButton         from './ExportButton'
import ReservationList      from './ReservationList'
import PanelLangSelector    from '../_components/PanelLangSelector'
import SettingsForm           from './SettingsForm'
import type { Reservation, SpecialArea, Restaurant } from '@/types'

export const dynamic = 'force-dynamic'

function currentWeekRange(): { start: string; end: string } {
  const now  = new Date()
  const day  = now.getDay() === 0 ? 7 : now.getDay()
  const mon  = new Date(now); mon.setDate(now.getDate() - day + 1)
  const sun  = new Date(mon); sun.setDate(mon.getDate() + 6)
  const fmt  = (d: Date) => d.toISOString().slice(0, 10)
  return { start: fmt(mon), end: fmt(sun) }
}

function last7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default async function PanelDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug }   = await params
  const db         = getSupabaseAdmin()
  const t          = await getTranslations('panel')
  const locale     = await getLocale()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, slug, address, capacity, working_hours, closed_dates, prepayment_amount, dress_code, special_notes')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  const today  = new Date().toISOString().slice(0, 10)
  const week   = currentWeekRange()
  const days7  = last7Days()

  const [
    { data: weekReservations },
    { data: specialAreas },
    { count: todayCount },
    { count: todayConfirmed },
    { data: allReservations },
  ] = await Promise.all([
    db.from('reservations').select('id, date, status, special_area_id, party_size')
      .eq('restaurant_id', restaurant.id).gte('date', week.start).lte('date', week.end)
      .order('date', { ascending: true }),
    db.from('special_areas').select('id, name, capacity')
      .eq('restaurant_id', restaurant.id).order('name'),
    db.from('reservations').select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id).eq('date', today).neq('status', 'cancelled'),
    db.from('reservations').select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id).eq('date', today).eq('status', 'confirmed'),
    db.from('reservations').select(`
        id, guest_name, guest_phone, reserved_date, reserved_time,
        party_size, notes, status, source, calisan_id, hizmet_id, created_at,
        calisanlar(ad),
        hizmetler(ad, fiyat)
      `)
      .eq('restaurant_id', restaurant.id)
      .gte('reserved_date', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
      .order('reserved_date', { ascending: false })
      .order('reserved_time', { ascending: false }),
  ])

  const allRes = (weekReservations ?? []) as Pick<Reservation, 'id' | 'date' | 'status' | 'special_area_id' | 'party_size'>[]
  const areas  = (specialAreas ?? []) as SpecialArea[]

  const dailyStats = days7.map(date => ({
    date,
    label: new Date(date + 'T12:00:00').toLocaleDateString(locale, { weekday: 'short', day: 'numeric' }),
    count: allRes.filter(r => r.date === date && r.status !== 'cancelled').length,
    pct:   Math.min(100, Math.round(
      (allRes.filter(r => r.date === date && r.status !== 'cancelled').length / restaurant.capacity) * 100
    )),
  }))

  const areaStats = areas.map(area => {
    const areaRes = allRes.filter(r => r.special_area_id === area.id && r.status !== 'cancelled')
    const pct = Math.min(100, Math.round((areaRes.length / (area.capacity || 1)) * 100))
    return { ...area, reservationCount: areaRes.length, pct }
  })

  const weekTotal     = allRes.filter(r => r.status !== 'cancelled').length
  const weekCancelled = allRes.filter(r => r.status === 'cancelled').length
  const weekPct       = Math.min(100, Math.round((weekTotal / (restaurant.capacity * 7)) * 100))

  const roleLabel = ({
    super_admin:      t('roleSuperAdmin'),
    business_owner:   t('roleOwner'),
    business_manager: t('roleManager'),
  } as Record<string, string>)[session.role] ?? t('roleUnknown')

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-500 font-mono">checkrezerve</span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-white font-bold text-lg leading-tight">{restaurant.name}</h1>
            <RoleBadge role={session.role} label={roleLabel} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PanelLangSelector />
          <form action="/panel/logout" method="POST">
            <button
              type="submit"
              className="text-stone-400 hover:text-white text-sm transition px-3 py-1.5
                         rounded-lg border border-stone-700 hover:border-stone-500"
            >
              {t('logout')}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        <section className="grid grid-cols-3 gap-3">
          <StatCard label={t('todayTotal')}    value={todayCount ?? 0}     accent="amber" />
          <StatCard label={t('confirmedCount')} value={todayConfirmed ?? 0} accent="green" />
          <StatCard label={t('thisWeek')}       value={weekTotal}           accent="blue"  />
        </section>

        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-stone-200">{t('weeklyOccupancy')}</h2>
            <span className="text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded-full">
              {week.start} – {week.end}
            </span>
          </div>
          <WeeklyChart days={dailyStats} capacity={restaurant.capacity} />
          <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
            <span>{t('weeklyAvg')} <b className="text-amber-400">{weekPct}%</b></span>
            <span>{t('cancelledCount')}: <b className="text-red-400">{weekCancelled}</b></span>
          </div>
        </section>

        {areaStats.length > 0 && (
          <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h2 className="font-semibold text-sm text-stone-200 mb-4">{t('specialAreaOccupancy')}</h2>
            <div className="space-y-3">
              {areaStats.map(area => (
                <div key={area.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-stone-300">{area.name}</span>
                    <span className="text-stone-400 text-xs">
                      {area.reservationCount} / {area.capacity} {t('reservationWord')}
                      <b className={`ml-2 ${area.pct >= 80 ? 'text-red-400' : 'text-amber-400'}`}>
                        %{area.pct}
                      </b>
                    </span>
                  </div>
                  <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        area.pct >= 80 ? 'bg-red-500' : area.pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${area.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <ReservationList
          restaurantId={restaurant.id}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialReservations={(allReservations ?? []) as any}
          today={today}
        />

        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-stone-200">{t('weeklyReport')}</h2>
              <p className="text-stone-500 text-xs mt-0.5">{t('weeklyReportDesc')}</p>
            </div>
            <ExportButton
              restaurantId={restaurant.id}
              weekStart={week.start}
              weekEnd={week.end}
            />
          </div>
        </section>

        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h2 className="font-semibold text-sm text-stone-200 mb-5">{t('settingsTitle')}</h2>
          <SettingsForm restaurant={restaurant as Pick<Restaurant,
            'id' | 'working_hours' | 'closed_dates' | 'prepayment_amount' | 'dress_code' | 'special_notes'
          >} />
        </section>

      </main>
    </div>
  )
}

function RoleBadge({ role, label }: { role: string; label: string }) {
  const styles: Record<string, string> = {
    business_owner:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
    business_manager: 'bg-blue-500/15  text-blue-400  border-blue-500/20',
    super_admin:      'bg-red-500/15   text-red-400   border-red-500/20',
  }
  const cls = styles[role] ?? 'bg-stone-700/50 text-stone-400 border-stone-600/30'
  return (
    <span className={`inline-block border rounded-md px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: 'amber' | 'green' | 'blue' }) {
  const colors = { amber: 'text-amber-400', green: 'text-emerald-400', blue: 'text-blue-400' }
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold ${colors[accent]}`}>{value}</div>
      <div className="text-stone-500 text-xs mt-0.5">{label}</div>
    </div>
  )
}
