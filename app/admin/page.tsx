import type { Metadata } from 'next'
import { getSupabase } from '@/lib/supabase'
import { ReservationDashboard } from './ReservationDashboard'

export const metadata: Metadata = {
  title: 'Admin — Rezervasyonlar',
  robots: { index: false, follow: false },
}

// Her istek anında taze veri
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = getSupabase()

  const today = new Date().toISOString().split('T')[0]

  // Bugün + yaklaşan rezervasyonlar (en son 100)
  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, restaurants(name, slug)')
    .gte('reserved_date', today)
    .order('reserved_date', { ascending: true })
    .order('reserved_time', { ascending: true })
    .limit(100)

  // Bugünkü istatistikler
  const { count: todayTotal } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('reserved_date', today)

  const { count: todayConfirmed } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('reserved_date', today)
    .eq('status', 'confirmed')

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">checkrezerve</h1>
            <p className="text-xs text-stone-500 mt-0.5">Admin Paneli</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-stone-400">Canlı</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Stat kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Bugün Toplam" value={todayTotal ?? 0} icon="📋" />
          <StatCard label="Onaylı" value={todayConfirmed ?? 0} icon="✅" color="green" />
          <StatCard label="Yaklaşan" value={(reservations ?? []).length} icon="🗓️" />
          <StatCard
            label="Tarih"
            value={new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            icon="📅"
          />
        </div>

        {/* Dashboard (client — real-time) */}
        <ReservationDashboard initialData={reservations ?? []} today={today} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number | string
  icon: string
  color?: 'green'
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
      <div className="text-xl">{icon}</div>
      <div className={`text-2xl font-bold mt-1 ${color === 'green' ? 'text-green-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-stone-500 mt-0.5">{label}</div>
    </div>
  )
}
