'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CustomerHeader from '@/components/CustomerHeader'
import { Link } from '@/i18n/navigation'

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

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  confirmed:  { label: 'Onaylandı', class: 'bg-emerald-100 text-emerald-700' },
  pending:    { label: 'Beklemede', class: 'bg-amber-100 text-amber-700' },
  cancelled:  { label: 'İptal Edildi', class: 'bg-red-100 text-red-700' },
  completed:  { label: 'Tamamlandı', class: 'bg-blue-100 text-blue-700' },
}

export default function RezervasyonlarimPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/giris'); return }

      const today = new Date().toISOString().split('T')[0]
      const phone = session.user.phone

      let query = supabase
        .from('reservations')
        .select('id, guest_name, reserved_date, reserved_time, party_size, status, created_at, restaurants(name, slug)')

      if (phone) {
        query = query.eq('guest_phone', phone)
      } else {
        query = query.eq('guest_name', session.user.email ?? '')
      }

      const { data } = await query
        .order('reserved_date', { ascending: false })
        .limit(50)

      setReservations((data ?? []) as unknown as ReservationRow[])
      setLoading(false)
    })
  }, [router])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = reservations.filter(r => r.reserved_date >= today && r.status !== 'cancelled')
  const past = reservations.filter(r => r.reserved_date < today || r.status === 'cancelled')
  const active = tab === 'upcoming' ? upcoming : past

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <CustomerHeader />
        <div className="pt-24 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <CustomerHeader />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">Rezervasyonlarım</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setTab('upcoming')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'upcoming' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            Yaklaşan ({upcoming.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'past' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            Geçmiş ({past.length})
          </button>
        </div>

        {active.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">
              {tab === 'upcoming' ? 'Henüz rezervasyonunuz yok' : 'Geçmiş rezervasyon bulunamadı'}
            </h3>
            <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
              {tab === 'upcoming'
                ? 'Bir işletme seçip hemen rezervasyon yapabilirsiniz.'
                : 'Tamamlanmış veya iptal edilmiş rezervasyonunuz bulunmuyor.'}
            </p>
            <Link
              href="/rezervasyon"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Rezervasyon Yap
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map(r => {
              const status = STATUS_MAP[r.status] ?? { label: r.status, class: 'bg-zinc-100 text-zinc-600' }
              const dateObj = new Date(r.reserved_date + 'T12:00:00')
              const formattedDate = dateObj.toLocaleDateString('tr-TR', {
                weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
              })

              return (
                <div key={r.id} className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-zinc-900 truncate">
                          {r.restaurants?.name ?? 'İşletme'}
                        </span>
                        <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 mt-2">
                        <span>📅 {formattedDate}</span>
                        <span>🕐 {r.reserved_time}</span>
                        <span>👥 {r.party_size} kişi</span>
                      </div>
                    </div>
                    {r.restaurants?.slug && (
                      <Link
                        href={`/${r.restaurants.slug}` as never}
                        className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-full"
                      >
                        Detay
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
