import { redirect }        from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getRoleLabel }    from '@/lib/roles'
import WeeklyChart          from './WeeklyChart'
import ExportButton         from './ExportButton'
import ReservationList      from './ReservationList'
import type { Reservation, SpecialArea } from '@/types'

export const dynamic = 'force-dynamic'

// Haftanın pazartesi–pazar aralığını döndürür
function currentWeekRange(): { start: string; end: string } {
  const now  = new Date()
  const day  = now.getDay() === 0 ? 7 : now.getDay() // 1=Pzt … 7=Paz
  const mon  = new Date(now); mon.setDate(now.getDate() - day + 1)
  const sun  = new Date(mon); sun.setDate(mon.getDate() + 6)
  const fmt  = (d: Date) => d.toISOString().slice(0, 10)
  return { start: fmt(mon), end: fmt(sun) }
}

// Son 7 günü gün gün döndürür (grafik için)
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

  // Restoranı doğrula — kullanıcı sadece kendi restoranına erişebilir
  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, slug, address, capacity')
    .eq('slug', slug)
    .eq('id', session.restaurantId)   // RBAC: sadece kendi restoranı
    .single()

  if (!restaurant) redirect('/panel/login')

  const today  = new Date().toISOString().slice(0, 10)
  const week   = currentWeekRange()
  const days7  = last7Days()

  // Paralel sorgular
  const [
    { data: weekReservations },
    { data: specialAreas },
    { count: todayCount },
    { count: todayConfirmed },
    { data: allReservations },
  ] = await Promise.all([
    // Bu haftaki tüm rezervasyonlar (grafik + istatistik)
    db
      .from('reservations')
      .select('id, date, status, special_area_id, party_size')
      .eq('restaurant_id', restaurant.id)
      .gte('date', week.start)
      .lte('date', week.end)
      .order('date', { ascending: true }),

    // Özel alanlar (Cam Kenarı vb.)
    db
      .from('special_areas')
      .select('id, name, capacity')
      .eq('restaurant_id', restaurant.id)
      .order('name'),

    // Bugünkü toplam
    db
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .eq('date', today)
      .neq('status', 'cancelled'),

    // Bugünkü onaylı
    db
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .eq('date', today)
      .eq('status', 'confirmed'),

    // Tüm yakın rezervasyonlar (liste için) — son 7 gün + gelecek 30 gün
    db
      .from('reservations')
      .select(`
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

  const allRes    = (weekReservations ?? []) as Pick<Reservation, 'id' | 'date' | 'status' | 'special_area_id' | 'party_size'>[]
  const areas     = (specialAreas ?? []) as SpecialArea[]

  // Haftalık doluluk oranı her gün için
  const dailyStats = days7.map(date => {
    const dayRes = allRes.filter(r => r.date === date && r.status !== 'cancelled')
    return {
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
      count: dayRes.length,
      pct:   Math.min(100, Math.round((dayRes.length / restaurant.capacity) * 100)),
    }
  })

  // Özel alan doluluk oranları (bu hafta)
  const areaStats = areas.map(area => {
    const areaRes = allRes.filter(
      r => r.special_area_id === area.id && r.status !== 'cancelled'
    )
    const pct = Math.min(100, Math.round((areaRes.length / (area.capacity || 1)) * 100))
    return { ...area, reservationCount: areaRes.length, pct }
  })

  // Haftalık toplam
  const weekTotal     = allRes.filter(r => r.status !== 'cancelled').length
  const weekCancelled = allRes.filter(r => r.status === 'cancelled').length
  const weekPct       = Math.min(100, Math.round((weekTotal / (restaurant.capacity * 7)) * 100))

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-500 font-mono">checkrezerve</span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-white font-bold text-lg leading-tight">{restaurant.name}</h1>
            <RoleBadge role={session.role} />
          </div>
        </div>
        <form action="/panel/logout" method="POST">
          <button
            type="submit"
            className="text-stone-400 hover:text-white text-sm transition px-3 py-1.5
                       rounded-lg border border-stone-700 hover:border-stone-500"
          >
            Çıkış
          </button>
        </form>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Bugünkü özet kartları */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard label="Bugün Toplam"   value={todayCount ?? 0}     accent="amber" />
          <StatCard label="Onaylı"          value={todayConfirmed ?? 0} accent="green" />
          <StatCard label="Bu Hafta"        value={weekTotal}           accent="blue"  />
        </section>

        {/* Haftalık Doluluk Grafiği */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-stone-200">Haftalık Doluluk Oranı</h2>
            <span className="text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded-full">
              {week.start} – {week.end}
            </span>
          </div>
          <WeeklyChart days={dailyStats} capacity={restaurant.capacity} />
          <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
            <span>Haftalık ort. doluluk: <b className="text-amber-400">{weekPct}%</b></span>
            <span>İptal: <b className="text-red-400">{weekCancelled}</b></span>
          </div>
        </section>

        {/* Özel Alan Takibi (Cam Kenarı vb.) */}
        {areaStats.length > 0 && (
          <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h2 className="font-semibold text-sm text-stone-200 mb-4">Özel Alan Doluluk Oranı</h2>
            <div className="space-y-3">
              {areaStats.map(area => (
                <div key={area.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-stone-300">{area.name}</span>
                    <span className="text-stone-400 text-xs">
                      {area.reservationCount} / {area.capacity} rezervasyon
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

        {/* Rezervasyon Listesi — Onayla / Reddet */}
        <ReservationList
          restaurantId={restaurant.id}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialReservations={(allReservations ?? []) as any}
          today={today}
        />

        {/* Haftalık Export */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-stone-200">Haftalık Rapor</h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Sadece bu haftaki rezervasyonları CSV olarak indir.
              </p>
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

function RoleBadge({ role }: { role: string }) {
  const label = getRoleLabel(role)
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: 'amber' | 'green' | 'blue'
}) {
  const colors = {
    amber: 'text-amber-400',
    green: 'text-emerald-400',
    blue:  'text-blue-400',
  }
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold ${colors[accent]}`}>{value}</div>
      <div className="text-stone-500 text-xs mt-0.5">{label}</div>
    </div>
  )
}
