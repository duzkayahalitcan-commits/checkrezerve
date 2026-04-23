'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

type Status = 'pending' | 'confirmed' | 'cancelled' | 'completed'

type Reservation = {
  id: string
  guest_name: string | null
  guest_phone: string | null
  reserved_date: string
  reserved_time: string
  party_size: number | null
  notes: string | null
  status: Status
  source: string | null
  calisan_id: string | null
  hizmet_id: string | null
  created_at: string
  calisanlar?: { ad: string } | null
  hizmetler?: { ad: string; fiyat: number } | null
}

const STATUS_LABEL: Record<Status, string> = {
  pending:   'Beklemede',
  confirmed: 'Onaylı',
  cancelled: 'İptal',
  completed: 'Tamamlandı',
}

const STATUS_CLS: Record<Status, string> = {
  pending:   'bg-amber-500/15 text-amber-300 border-amber-500/25',
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
}

type Tab = 'pending' | 'today' | 'upcoming' | 'all'

export default function ReservationList({
  restaurantId,
  initialReservations,
  today,
}: {
  restaurantId: string
  initialReservations: Reservation[]
  today: string
}) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [tab, setTab] = useState<Tab>('pending')
  const [updating, setUpdating] = useState<string | null>(null)

  // Real-time updates
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return

    const client = createClient(url, key)
    const channel = client
      .channel(`panel-reservations-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReservations((prev) => [payload.new as Reservation, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setReservations((prev) =>
              prev.map((r) => (r.id === payload.new.id ? { ...r, ...(payload.new as Reservation) } : r))
            )
          } else if (payload.eventType === 'DELETE') {
            setReservations((prev) => prev.filter((r) => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    return () => { client.removeChannel(channel) }
  }, [restaurantId])

  async function updateStatus(id: string, status: Status) {
    setUpdating(id)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const client = createClient(url, key)
    await client.from('reservations').update({ status }).eq('id', id)
    setUpdating(null)
  }

  const filtered = reservations.filter((r) => {
    if (tab === 'pending')   return r.status === 'pending'
    if (tab === 'today')     return r.reserved_date === today && r.status !== 'cancelled'
    if (tab === 'upcoming')  return r.reserved_date > today && r.status !== 'cancelled'
    return true
  })

  const pendingCount   = reservations.filter((r) => r.status === 'pending').length
  const todayCount     = reservations.filter((r) => r.reserved_date === today && r.status !== 'cancelled').length
  const upcomingCount  = reservations.filter((r) => r.reserved_date > today && r.status !== 'cancelled').length

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'pending',  label: 'Bekleyen',  count: pendingCount },
    { key: 'today',    label: 'Bugün',     count: todayCount },
    { key: 'upcoming', label: 'Yaklaşan',  count: upcomingCount },
    { key: 'all',      label: 'Tümü',      count: reservations.length },
  ]

  return (
    <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
      <h2 className="font-semibold text-sm text-stone-200 mb-4">Rezervasyonlar</h2>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-amber-500 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 ${tab === t.key ? 'text-white/80' : 'text-stone-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/3 py-10 text-center text-stone-500 text-sm">
          {tab === 'pending' ? 'Bekleyen rezervasyon yok.' :
           tab === 'today'   ? 'Bugün rezervasyon yok.' :
           tab === 'upcoming'? 'Yaklaşan rezervasyon yok.' :
           'Rezervasyon bulunamadı.'}
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
    </section>
  )
}

function ReservationCard({
  reservation: r,
  updating,
  onStatusChange,
}: {
  reservation: Reservation
  updating: boolean
  onStatusChange: (id: string, status: Status) => void
}) {
  const status = (r.status ?? 'pending') as Status
  const dateStr = new Date(r.reserved_date + 'T00:00:00').toLocaleDateString('tr-TR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const isBeauty = r.calisan_id !== null

  return (
    <div
      className={`rounded-xl border p-4 transition-opacity ${updating ? 'opacity-40' : ''} ${
        status === 'cancelled' ? 'border-white/5 opacity-60' :
        status === 'pending'   ? 'border-amber-500/20 bg-amber-500/3' :
        'border-white/8 bg-white/2'
      }`}
    >
      <div className="flex items-start justify-between gap-3">

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-white truncate">{r.guest_name ?? 'Misafir'}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_CLS[status]}`}>
              {STATUS_LABEL[status]}
            </span>
            {r.source === 'ai' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                AI
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-stone-400 mb-1">
            <span>📅 {dateStr}</span>
            <span>🕐 {(r.reserved_time ?? '').slice(0, 5)}</span>
            {isBeauty ? (
              <span>💆 {r.calisanlar?.ad ?? '—'}</span>
            ) : (
              <span>👥 {r.party_size ?? '—'} kişi</span>
            )}
          </div>

          {isBeauty && r.hizmetler && (
            <div className="text-xs text-stone-500 mb-1">
              ✨ {r.hizmetler.ad}
              {r.hizmetler.fiyat > 0 && (
                <span className="ml-2 text-emerald-400 font-medium">
                  {r.hizmetler.fiyat.toLocaleString('tr-TR')} ₺
                </span>
              )}
            </div>
          )}

          {r.guest_phone && (
            <a
              href={`tel:${r.guest_phone}`}
              className="text-sm text-stone-500 hover:text-amber-400 transition-colors"
            >
              📞 {r.guest_phone}
            </a>
          )}

          {r.notes && (
            <p className="mt-1.5 text-xs text-stone-500 italic">
              &ldquo;{r.notes}&rdquo;
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange(r.id, 'confirmed')}
                disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/35 transition-colors disabled:opacity-50"
              >
                ✓ Onayla
              </button>
              <button
                onClick={() => onStatusChange(r.id, 'cancelled')}
                disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-50"
              >
                ✕ Reddet
              </button>
            </>
          )}
          {status === 'confirmed' && (
            <>
              <button
                onClick={() => onStatusChange(r.id, 'completed')}
                disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-medium hover:bg-blue-500/25 transition-colors disabled:opacity-50"
              >
                ✓ Tamamla
              </button>
              <button
                onClick={() => onStatusChange(r.id, 'cancelled')}
                disabled={updating}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50"
              >
                ✕ İptal
              </button>
            </>
          )}
          {status === 'cancelled' && (
            <button
              onClick={() => onStatusChange(r.id, 'pending')}
              disabled={updating}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors disabled:opacity-50"
            >
              ↩ Geri Al
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
