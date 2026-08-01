import Link                   from 'next/link'
import nextDynamic             from 'next/dynamic'
import { redirect }           from 'next/navigation'
import { ChevronRight, Plus, CalendarDays, Users } from 'lucide-react'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getTranslations, getLocale } from 'next-intl/server'
import WeeklyChart    from './WeeklyChart'
import ExportButton   from './ExportButton'
import CountUp        from '@/components/CountUp'
import ReservationChart from '@/components/ui/ReservationChart'
import type { Reservation, SpecialArea } from '@/types'

const CiroDashboard = nextDynamic(() => import('./dashboard/CiroDashboard'))

export const dynamic = 'force-dynamic'

function currentWeekRange(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const mon = new Date(now); mon.setDate(now.getDate() - day + 1)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { start: fmt(mon), end: fmt(sun) }
}

function last7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
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

  const { slug } = await params
  const db       = getSupabaseAdmin()
  const t        = await getTranslations('panel')
  const locale   = await getLocale()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, slug, address, capacity, onboarding_completed')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  // Onboarding tamamlanmadiysa onboarding wizard'a yonlendir
  if (!restaurant.onboarding_completed) {
    redirect(`/panel/${slug}/onboarding`)
  }

  const today = new Date().toISOString().slice(0, 10)
  const week  = currentWeekRange()
  const days7 = last7Days()

  const [
    { data: weekReservations },
    { data: specialAreas },
    { count: todayCount },
    { count: todayConfirmed },
    { data: allReservations },
    { count: pendingCount },
    { count: cancelledCount },
  ] = await Promise.all([
    db.from('reservations').select('id, date, status, special_area_id, party_size')
      .eq('restaurant_id', restaurant.id).gte('date', week.start).lte('date', week.end)
      .order('date', { ascending: true }),
    db.from('special_areas').select('id, name, capacity')
      .eq('restaurant_id', restaurant.id).order('name'),
    db.from('reservations').select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id).eq('date', today).neq('status', 'cancelled'),
    db.from('reservations').select('id', { count: 'exact', head: true })
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
    db.from('reservations').select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id).eq('status', 'pending'),
    db.from('reservations').select('id', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id).eq('status', 'cancelled'),
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

  // Revenue estimate: sum of hizmetler.fiyat for confirmed/completed bookings this week
  const weekRevenue = (allReservations ?? []).reduce((sum, r) => {
    const res = r as unknown as { status: string; hizmetler?: { fiyat: number } | null }
    if ((res.status === 'confirmed' || res.status === 'completed') && res.hizmetler?.fiyat) {
      return sum + res.hizmetler.fiyat
    }
    return sum
  }, 0)

  const todayDateStr = new Date().toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div>
      {/* Page header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <p className="text-xs text-stone-500 capitalize">{todayDateStr}</p>
        <h1 className="text-lg font-bold text-white mt-0.5">Genel Bakış</h1>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Stat Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href={`/panel/${slug}/rezervasyonlar?tarih=${today}`} className="block">
            <StatCard label="Bugünkü Rezervasyon" value={todayCount ?? 0}    accent="amber" delay="0ms"   />
          </Link>
          <Link href={`/panel/${slug}/rezervasyonlar`} className="block">
            <StatCard label="Bu Hafta"             value={weekTotal}          accent="blue"  delay="70ms"  />
          </Link>
          <Link href={`/panel/${slug}/rezervasyonlar?durum=pending`} className="block">
            <StatCard label="Onay Bekleyen"        value={pendingCount ?? 0}  accent="yellow" delay="140ms" />
          </Link>
          <Link href={`/panel/${slug}/rezervasyonlar?durum=cancelled`} className="block">
            <StatCard label="İptal"                value={cancelledCount ?? 0} accent="red"  delay="210ms" />
          </Link>
        </section>

        {/* Quick action — tek birleşik CTA (A3) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href={`/panel/${slug}/takvim?view=gunluk`}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors">
            <Plus size={16} /> Yeni Rezervasyon
          </Link>
          <Link href={`/panel/${slug}/bugun`}
            className="flex items-center justify-center gap-2 bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors">
            <CalendarDays size={15} /> Bugünün Planı
          </Link>
          <Link href={`/panel/${slug}/misafirler`}
            className="flex items-center justify-center gap-2 bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors">
            <Users size={15} /> Misafirler
          </Link>
        </section>

        {/* Ciro Dashboard Widget */}
        <section>
          <CiroDashboard restaurantId={restaurant.id} />
        </section>

        {/* Weekly Chart */}
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

        {/* 7-Day Trend Chart */}
        <ReservationChart
          data={dailyStats.map(d => ({ label: d.label, count: d.count }))}
          title={t('weeklyOccupancy')}
          color="#F59E0B"
        />

        {/* Special Area Occupancy */}
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

        {/* Son rezervasyonlar — özet + tümüne git (liste Rezervasyonlar sayfasında) */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-stone-200">Son Rezervasyonlar</h2>
            <Link href={`/panel/${slug}/rezervasyonlar`}
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
              Tümünü gör <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href={`/panel/${slug}/rezervasyonlar?durum=pending`} className="block">
              <StatCard label="Onay Bekleyen" value={pendingCount ?? 0} accent="yellow" delay="0ms" />
            </Link>
            <Link href={`/panel/${slug}/rezervasyonlar?durum=confirmed`} className="block">
              <StatCard label="Onaylandı" value={todayConfirmed ?? 0} accent="green" delay="60ms" />
            </Link>
            <Link href={`/panel/${slug}/rezervasyonlar?durum=cancelled`} className="block">
              <StatCard label="İptal" value={cancelledCount ?? 0} accent="red" delay="120ms" />
            </Link>
            <Link href={`/panel/${slug}/rezervasyonlar?tarih=${today}`} className="block">
              <StatCard label="Bugün" value={todayCount ?? 0} accent="amber" delay="180ms" />
            </Link>
          </div>
        </section>

        {/* Export */}
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

      </main>
    </div>
  )
}

function StatCard({ label, value, accent, delay = '0ms' }: { label: string; value: number; accent: 'amber' | 'green' | 'blue' | 'yellow' | 'red'; delay?: string }) {
  const colors = {
    amber:  'text-amber-400',
    green:  'text-emerald-400',
    blue:   'text-blue-400',
    yellow: 'text-yellow-400',
    red:    'text-red-400',
  }
  return (
    <div
      className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center animate-[fadeSlideUp_0.4s_ease_forwards] opacity-0 hover:border-stone-700 transition-colors h-full"
      style={{ animationDelay: delay }}
    >
      <CountUp to={value} className={`text-2xl font-bold tabular-nums ${colors[accent]}`} />
      <div className="text-stone-500 text-xs mt-0.5">{label}</div>
    </div>
  )
}
