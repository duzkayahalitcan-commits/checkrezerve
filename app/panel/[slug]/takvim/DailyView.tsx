'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { TakvimReservation } from './CalendarTypes'

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 8
  return `${String(h).padStart(2, '0')}:00`
})

const STATUS_COLORS: Record<string, string> = {
  pending:   'border-l-amber-400 bg-amber-500/8',
  confirmed: 'border-l-emerald-400 bg-emerald-500/8',
  cancelled: 'border-l-red-400/50 bg-red-500/5 opacity-50',
  completed: 'border-l-blue-400 bg-blue-500/8',
}

const STATUS_DOT: Record<string, string> = {
  pending:   'bg-amber-400',
  confirmed: 'bg-emerald-400',
  cancelled: 'bg-red-400/50',
  completed: 'bg-blue-400',
}

export default function DailyView({
  date,
  reservations,
  onSelect,
  selectedId,
}: {
  date: string
  reservations: TakvimReservation[]
  onSelect: (r: TakvimReservation) => void
  selectedId: string | null
}) {
  const byHour = useMemo(() => {
    const map: Record<string, TakvimReservation[]> = {}
    for (const h of HOURS) map[h] = []
    for (const r of reservations) {
      const hour = (r.reserved_time ?? '').slice(0, 5)
      if (map[hour]) map[hour].push(r)
    }
    return map
  }, [reservations])

  const dayLabel = new Date(date + 'T12:00').toLocaleDateString('tr', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const totalGuests = reservations.reduce((sum, r) => sum + (r.party_size ?? 0), 0)

  return (
    <div className="space-y-3">
      {/* Day header */}
      <div className="sticky top-0 z-10 bg-stone-950 py-3 border-b border-stone-800">
        <h2 className="text-white font-bold text-base">{dayLabel}</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          {reservations.length} rezervasyon · {totalGuests} kişi
        </p>
      </div>

      {/* Hour slots */}
      <div className="space-y-1">
        {HOURS.map(hour => {
          const slots = byHour[hour] ?? []
          return (
            <div key={hour} className="group flex gap-3 min-h-[52px]">
              {/* Time label */}
              <div className="w-12 shrink-0 pt-1.5 text-right">
                <span className="text-[11px] font-mono text-stone-500">{hour}</span>
              </div>

              {/* Slot content */}
              <div className="flex-1 border-t border-stone-800/50 pt-1 pb-1 space-y-1">
                {slots.length === 0 ? (
                  <button
                    onClick={() => {
                      // Yeni rezervasyon ekleme — ileride eklenebilir
                    }}
                    className="w-full h-8 rounded-lg border border-dashed border-stone-800 opacity-0 group-hover:opacity-100 hover:border-stone-600 transition-all text-[10px] text-stone-700 hover:text-stone-500"
                  >
                    + Ekle
                  </button>
                ) : (
                  slots.map(r => {
                    const isSelected = selectedId === r.id
                    const colorCls = STATUS_COLORS[r.status] ?? 'border-l-stone-600 bg-stone-800'
                    const dotCls = STATUS_DOT[r.status] ?? 'bg-stone-500'
                    const staffName = (r.calisanlar as { ad: string }[] | { ad: string } | null)
                      ? (Array.isArray(r.calisanlar) ? r.calisanlar[0] : r.calisanlar)?.ad
                      : null
                    const masaName = (r.masa_tipleri as { ad: string }[] | { ad: string } | null)
                      ? (Array.isArray(r.masa_tipleri) ? r.masa_tipleri[0] : r.masa_tipleri)?.ad
                      : null

                    return (
                      <motion.button
                        key={r.id}
                        layoutId={`card-${r.id}`}
                        onClick={() => onSelect(r)}
                        className={`w-full text-left rounded-xl border-l-4 p-2.5 transition-all hover:brightness-110 ${
                          isSelected ? 'ring-2 ring-[#D4A373]' : ''
                        } ${colorCls}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
                            <span className="text-sm font-semibold text-white truncate">
                              {r.guest_name ?? 'Misafir'}
                            </span>
                            {r.party_size && (
                              <span className="text-xs text-stone-500 shrink-0">👥{r.party_size}</span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-stone-500 shrink-0 ml-2">
                            {(r.reserved_time ?? '').slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                          {staffName && <span>💆 {staffName}</span>}
                          {masaName && <span>🪑 {masaName}</span>}
                          {(() => {
                            const h = (r.hizmetler as { ad: string }[] | { ad: string } | null)
                            const hn = h ? (Array.isArray(h) ? h[0]?.ad : h.ad) : null
                            return hn ? <span>✨ {hn}</span> : null
                          })()}
                        </div>
                      </motion.button>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
