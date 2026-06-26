'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import CustomerHeader from '@/components/CustomerHeader'
import { Link } from '@/i18n/navigation'
import { X } from 'lucide-react'

interface ReservationRow {
  id: string
  guest_name: string
  reserved_date: string
  reserved_time: string
  party_size: number
  status: string
  created_at: string
  restaurants: { name: string; slug: string } | null
}

type TabKey = 'upcoming' | 'past' | 'cancelled'

export default function RezervasyonlarimPage() {
  const t = useTranslations('myReservations')
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [tab, setTab] = useState<TabKey>('upcoming')
  const [selected, setSelected] = useState<ReservationRow | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/giris'); return }

      const { data } = await supabase
        .from('reservations')
        .select('id, guest_name, reserved_date, reserved_time, party_size, status, created_at, restaurants(name, slug)')
        .eq('guest_email', session.user.email ?? '')
        .order('reserved_date', { ascending: false })
        .limit(50)

      setReservations((data ?? []) as unknown as ReservationRow[])
      setLoading(false)
    })
  }, [router])

  const today = new Date().toISOString().split('T')[0]
  const upcoming  = reservations.filter(r => r.reserved_date >= today && r.status !== 'cancelled')
  const past      = reservations.filter(r => r.reserved_date < today && r.status !== 'cancelled')
  const cancelled = reservations.filter(r => r.status === 'cancelled')

  const active = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled

  const cancelReservation = async (id: string) => {
    setCancelling(id)
    await fetch('/api/rezervasyon', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'cancelled' }),
    }).catch(() => {})
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
    setCancelling(null)
    setSelected(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <CustomerHeader />
        <div className="pt-24 pb-16 px-6 mx-auto max-w-4xl space-y-4">
          <div className="h-8 w-48 bg-zinc-200 rounded-xl animate-pulse" />
          <div className="h-12 bg-zinc-200 rounded-xl animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    confirmed: { label: t('statusConfirmed'), cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending:   { label: t('statusPending'),    cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    cancelled: { label: t('statusCancelled'),  cls: 'bg-red-100 text-red-700 border-red-200' },
    completed: { label: t('statusCompleted'),  cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  }

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'upcoming',  label: t('upcoming'), count: upcoming.length },
    { key: 'past',      label: t('past'),     count: past.length },
    { key: 'cancelled', label: t('cancelled'), count: cancelled.length },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      <CustomerHeader />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">{t('title')}</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 mb-8">
          {TABS.map(tabItem => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === tabItem.key ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              {tabItem.label} ({tabItem.count})
            </button>
          ))}
        </div>

        {active.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">
              {tab === 'upcoming' ? t('emptyUpcoming') : tab === 'past' ? t('emptyPast') : t('emptyCancelled')}
            </h3>
            {tab === 'upcoming' && (
              <Link href="/rezervasyon" className="inline-flex items-center gap-2 bg-[#E53935] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors mt-4">
                {t('makeReservation')}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {active.map(r => {
              const status = STATUS_MAP[r.status] ?? { label: r.status, cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
              const dateObj = new Date(r.reserved_date + 'T12:00:00')
              const formattedDate = dateObj.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
              const canCancel = r.status === 'pending' && r.reserved_date >= today

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => setSelected(r)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-lg font-bold text-zinc-900 truncate">
                          {r.restaurants?.name ?? '—'}
                        </span>
                        <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 mt-2">
                        <span>📅 {formattedDate}</span>
                        <span>🕐 {r.reserved_time?.slice(0, 5)}</span>
                        <span>👥 {r.party_size} {t('guests')}</span>
                      </div>
                    </div>
                    {canCancel && (
                      <button
                        onClick={e => { e.stopPropagation(); cancelReservation(r.id) }}
                        disabled={cancelling === r.id}
                        className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-full disabled:opacity-50"
                      >
                        {cancelling === r.id ? '...' : t('cancelBtn')}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-zinc-900 text-base">{t('detailTitle')}</h2>
              <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { label: t('labelBusiness'), value: selected.restaurants?.name ?? '—' },
                { label: t('labelDate'), value: new Date(selected.reserved_date + 'T12:00').toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: t('labelTime'), value: selected.reserved_time?.slice(0, 5) ?? '—' },
                { label: t('labelGuests'), value: `${selected.party_size} ${t('guests')}` },
                { label: t('labelStatus'), value: STATUS_MAP[selected.status]?.label ?? selected.status },
              ].map(f => (
                <div key={f.label} className="flex gap-3">
                  <span className="text-zinc-400 text-xs w-20 shrink-0 pt-0.5">{f.label}</span>
                  <span className="text-zinc-800 text-sm font-medium">{f.value}</span>
                </div>
              ))}
            </div>
            {selected.status === 'pending' && selected.reserved_date >= today && (
              <button
                onClick={() => cancelReservation(selected.id)}
                disabled={cancelling === selected.id}
                className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {cancelling === selected.id ? t('cancelling') : t('cancelConfirm')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
