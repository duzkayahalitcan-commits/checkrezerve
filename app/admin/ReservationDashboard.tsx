'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

type Reservation = {
  id: string
  guest_name: string
  guest_phone: string
  reserved_date: string
  reserved_time: string
  party_size: number
  special_requests: string | null
  status: 'confirmed' | 'cancelled' | 'completed'
  source: string
  created_at: string
  restaurants?: { name: string; slug: string } | null
}

type Tab = 'today' | 'upcoming' | 'all'

export function ReservationDashboard({
  initialData,
  today,
}: {
  initialData: Reservation[]
  today: string
}) {
  const [reservations, setReservations] = useState<Reservation[]>(initialData)
  const [tab, setTab] = useState<Tab>('today')
  const [updating, setUpdating] = useState<string | null>(null)

  // Real-time Supabase subscription
  useEffect(() => {
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return

    const client = createClient(url, key)

    const channel = client
      .channel('reservations-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReservations((prev) => [payload.new as Reservation, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setReservations((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Reservation) : r))
            )
          } else if (payload.eventType === 'DELETE') {
            setReservations((prev) => prev.filter((r) => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => { client.removeChannel(channel) }
  }, [])

  // Durum güncelle (server action yerine doğrudan API çağrısı)
  async function updateStatus(id: string, status: Reservation['status']) {
    setUpdating(id)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const client = createClient(url, key)
    await client.from('reservations').update({ status }).eq('id', id)
    setUpdating(null)
  }

  const filtered = reservations.filter((r) => {
    if (tab === 'today')    return r.reserved_date === today
    if (tab === 'upcoming') return r.reserved_date > today
    return true
  })

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-full sm:w-fit mb-5">
        {(['today', 'upcoming', 'all'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-amber-500 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {t === 'today' ? 'Bugün' : t === 'upcoming' ? 'Yaklaşan' : 'Tümü'}
            <span className={`ml-1.5 text-xs ${tab === t ? 'text-white/80' : 'text-stone-600'}`}>
              {t === 'today'
                ? reservations.filter((r) => r.reserved_date === today).length
                : t === 'upcoming'
                ? reservations.filter((r) => r.reserved_date > today).length
                : reservations.length}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/3 p-10 text-center text-stone-500">
          {tab === 'today' ? 'Bugün rezervasyon yok.' : 'Rezervasyon bulunamadı.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              updating={updating === r.id}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReservationCard({
  reservation: r,
  updating,
  onStatusChange,
}: {
  reservation: Reservation
  updating: boolean
  onStatusChange: (id: string, status: Reservation['status']) => void
}) {
  const statusConfig = {
    confirmed: { label: 'Onaylı',     cls: 'bg-green-500/15 text-green-400 border-green-500/20' },
    cancelled: { label: 'İptal',      cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
    completed: { label: 'Tamamlandı', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  }
  const { label, cls } = statusConfig[r.status] ?? statusConfig.confirmed

  const dateStr = new Date(r.reserved_date + 'T00:00:00').toLocaleDateString('tr-TR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  return (
    <div className={`rounded-2xl border bg-white/3 p-4 transition-opacity ${updating ? 'opacity-50' : ''} ${
      r.status === 'cancelled' ? 'border-white/5 opacity-60' : 'border-white/8'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white truncate">{r.guest_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>
              {label}
            </span>
            {r.source === 'ai' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                AI
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-stone-400 flex-wrap">
            <span className="flex items-center gap-1">
              <span>📅</span> {dateStr}
            </span>
            <span className="flex items-center gap-1">
              <span>🕐</span> {r.reserved_time}
            </span>
            <span className="flex items-center gap-1">
              <span>👥</span> {r.party_size} kişi
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-stone-500 flex-wrap">
            <a
              href={`tel:${r.guest_phone}`}
              className="flex items-center gap-1 hover:text-amber-400 transition-colors"
            >
              <span>📞</span> {r.guest_phone}
            </a>
            {r.restaurants?.name && (
              <span className="text-stone-600">{r.restaurants.name}</span>
            )}
          </div>
          {r.special_requests && (
            <p className="mt-2 text-xs text-stone-500 italic">
              &ldquo;{r.special_requests}&rdquo;
            </p>
          )}
        </div>

        {/* Aksiyon butonları */}
        <div className="flex sm:flex-col flex-row gap-1.5 shrink-0">
          {r.status !== 'completed' && (
            <button
              onClick={() => onStatusChange(r.id, 'completed')}
              disabled={updating}
              className="px-3 py-2 sm:py-1.5 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-medium hover:bg-blue-500/25 transition-colors disabled:opacity-50 touch-manipulation"
            >
              ✓ Tamamla
            </button>
          )}
          {r.status === 'confirmed' && (
            <button
              onClick={() => onStatusChange(r.id, 'cancelled')}
              disabled={updating}
              className="px-3 py-2 sm:py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50 touch-manipulation"
            >
              ✕ İptal
            </button>
          )}
          {r.status === 'cancelled' && (
            <button
              onClick={() => onStatusChange(r.id, 'confirmed')}
              disabled={updating}
              className="px-3 py-2 sm:py-1.5 rounded-lg bg-green-500/15 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50 touch-manipulation"
            >
              ↩ Geri Al
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
