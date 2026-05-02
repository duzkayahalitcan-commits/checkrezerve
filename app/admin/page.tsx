import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'
import { ReservationDashboard } from './ReservationDashboard'
import { AddRestaurantForm } from './restaurants/AddRestaurantForm'
import { QRCodeButton } from './restaurants/QRCodeButton'
import { SmsLog } from './SmsLog'
import UserForm from './restaurants/UserForm'

export const metadata: Metadata = {
  title: 'Admin — Rezervasyonlar',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = getSupabaseAdmin()
  const today    = new Date().toISOString().split('T')[0]

  // Paralel veri çekimi
  const [
    { data: restaurants },
    { data: reservations },
    { count: todayTotal },
    { count: todayConfirmed },
    { count: todayCancelled },
    { data: smsLogs },
  ] = await Promise.all([
    supabase.from('restaurants').select('id, name, slug, phone, address, capacity, created_at, business_type, timezone, booking_duration_minutes, currency, description, website, instagram, is_active, floor_plan_enabled').order('name'),

    supabase
      .from('reservations')
      .select('*, restaurants(name, slug)')
      .gte('reserved_date', today)
      .order('reserved_date', { ascending: true })
      .order('reserved_time', { ascending: true })
      .limit(200),

    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('reserved_date', today),

    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('reserved_date', today)
      .eq('status', 'confirmed'),

    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('reserved_date', today)
      .eq('status', 'cancelled'),

    supabase
      .from('sms_logs')
      .select('id, to_number, body, provider, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  // Restoran bazlı bugünkü doluluk
  const capacityStats = (restaurants ?? []).map((r) => {
    const todayCount = (reservations ?? []).filter(
      (res) => res.restaurant_id === r.id &&
               res.reserved_date === today &&
               res.status !== 'cancelled'
    ).length
    const pct = r.capacity ? Math.round((todayCount / r.capacity) * 100) : null
    return { ...r, todayCount, pct }
  })

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">checkrezerve</h1>
            <p className="text-xs text-stone-500">Admin Paneli</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-stone-400 hidden sm:block">Canlı</span>
            </div>
            <form action="/admin/logout" method="POST">
              <button
                type="submit"
                className="text-xs text-stone-500 hover:text-stone-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 space-y-6">

        {/* ── Stat Kartları ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Bugün Toplam"  value={todayTotal     ?? 0} icon="📋" />
          <StatCard label="Onaylı"        value={todayConfirmed ?? 0} icon="✅" color="green" />
          <StatCard label="İptal"         value={todayCancelled ?? 0} icon="✕"  color="red" />
          <StatCard
            label="Tarih"
            value={new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            icon="📅"
          />
        </div>

        {/* ── Kapasite Durumu ───────────────────────────────────── */}
        {capacityStats.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
              Bugün Kapasite
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {capacityStats.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/5 bg-white/3 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white truncate">{r.name}</span>
                    <span className="text-xs text-stone-500 shrink-0 ml-2">
                      {r.todayCount} / {r.capacity ?? '—'}
                    </span>
                  </div>
                  {r.pct !== null && (
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          r.pct >= 90 ? 'bg-red-500' :
                          r.pct >= 70 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(r.pct, 100)}%` }}
                      />
                    </div>
                  )}
                  {r.pct !== null && (
                    <p className={`text-xs mt-1.5 ${
                      r.pct >= 90 ? 'text-red-400' :
                      r.pct >= 70 ? 'text-amber-400' : 'text-stone-500'
                    }`}>
                      {r.pct >= 100 ? 'Kapasite doldu' :
                       r.pct >= 90  ? `%${r.pct} dolu — kritik` :
                       r.pct >= 70  ? `%${r.pct} dolu` : `%${r.pct} dolu`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Restoranlar ───────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Restoranlar
          </h2>
          <AddRestaurantForm />
          {restaurants && restaurants.length > 0 && (
            <div className="flex flex-col gap-2">
              {restaurants.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                    <span className="text-sm text-stone-200 truncate">{r.name}</span>
                    <span className="text-xs text-stone-600 shrink-0">/{r.slug}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
                    >
                      Aç ↗
                    </a>
                    <Link
                      href={`/admin/floor-plan/${r.id}`}
                      className="text-xs text-stone-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                      title="Masa krokisini düzenle"
                    >
                      🗺 Kroki
                      {r.floor_plan_enabled && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      )}
                    </Link>
                    <QRCodeButton slug={r.slug} name={r.name} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Restoran Kullanıcıları (RBAC) ────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Restoran Panel Kullanıcıları
          </h2>
          <UserForm restaurants={restaurants ?? []} />
        </section>

        {/* ── Rezervasyon Dashboard ─────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Rezervasyonlar
          </h2>
          <ReservationDashboard initialData={reservations ?? []} today={today} />
        </section>

        {/* ── Mock SMS Logu ─────────────────────────────────────── */}
        <SmsLog logs={smsLogs ?? []} />

      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, color,
}: {
  label: string
  value: number | string
  icon: string
  color?: 'green' | 'red'
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
      <div className="text-xl">{icon}</div>
      <div className={`text-2xl font-bold mt-1 ${
        color === 'green' ? 'text-green-400' :
        color === 'red'   ? 'text-red-400' : 'text-white'
      }`}>
        {value}
      </div>
      <div className="text-xs text-stone-500 mt-0.5">{label}</div>
    </div>
  )
}
