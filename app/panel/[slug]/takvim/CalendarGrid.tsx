'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

type DayData = {
  date: string        // YYYY-MM-DD
  total: number
  pending: number
  confirmed: number
}

type CalendarReservation = {
  id: string
  guest_name: string | null
  reserved_time: string
  party_size: number | null
  status: string
  hizmetler?: { ad: string } | null
  calisanlar?: { ad: string } | null
}

export default function CalendarGrid({
  year: initYear,
  month: initMonth,
  dayData,
  reservationsByDate,
}: {
  year: number
  month: number
  dayData: DayData[]
  reservationsByDate: Record<string, CalendarReservation[]>
}) {
  const [year, setYear]   = useState(initYear)
  const [month, setMonth] = useState(initMonth)
  const [selected, setSelected] = useState<string | null>(null)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const dataMap = new Map(dayData.map(d => [d.date, d]))
  const today   = new Date().toISOString().slice(0, 10)

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1)
  const lastDay  = new Date(year, month, 0)
  const totalDays = lastDay.getDate()

  // Mon=0 ... Sun=6 offset
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const cells: (string | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(year, month - 1, i + 1)
      return d.toISOString().slice(0, 10)
    }),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('tr', { month: 'long', year: 'numeric' })

  const selectedRes = selected ? (reservationsByDate[selected] ?? []) : []

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-bold text-white capitalize text-sm">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
          <div key={d} className="text-[11px] text-stone-600 font-semibold py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />

          const data    = dataMap.get(date)
          const isToday = date === today
          const isSel   = date === selected
          const count   = data?.total ?? 0
          const hasPending = (data?.pending ?? 0) > 0

          const cellBg = isSel
            ? 'bg-red-500/20 border-red-500/40'
            : isToday
            ? 'bg-amber-500/10 border-amber-500/30'
            : count > 5
            ? 'bg-red-500/8 border-red-500/15'
            : count > 0
            ? 'bg-emerald-500/8 border-emerald-500/15'
            : 'bg-stone-900 border-stone-800'

          return (
            <motion.button
              key={date}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={() => setSelected(d => d === date ? null : date)}
              className={`relative aspect-square rounded-xl border p-1.5 text-left transition-colors cursor-pointer ${cellBg} hover:border-stone-600`}
            >
              <span className={`text-xs font-bold leading-none ${
                isSel ? 'text-red-400' : isToday ? 'text-amber-400' : 'text-stone-300'
              }`}>
                {new Date(date + 'T12:00').getDate()}
              </span>
              {count > 0 && (
                <div className="absolute bottom-1.5 inset-x-1.5 flex gap-0.5 justify-end">
                  <span className={`text-[9px] font-bold ${count > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {count}
                  </span>
                  {hasPending && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 self-center" />
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-stone-600 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/30" /> Rezervasyon var
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Bekleyen
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-red-500/30" /> Yoğun (5+)
        </span>
      </div>

      {/* Selected day detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                {new Date(selected + 'T12:00').toLocaleDateString('tr', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-stone-600 hover:text-stone-300 transition text-lg leading-none"
              >
                ×
              </button>
            </div>

            {selectedRes.length === 0 ? (
              <p className="text-stone-600 text-sm text-center py-4">Bu gün rezervasyon yok.</p>
            ) : (
              <div className="space-y-2">
                {selectedRes.map(r => {
                  const STATUS_CLS: Record<string, string> = {
                    pending:   'text-amber-400 bg-amber-500/10',
                    confirmed: 'text-emerald-400 bg-emerald-500/10',
                    cancelled: 'text-red-400 bg-red-500/10',
                    completed: 'text-blue-400 bg-blue-500/10',
                  }
                  const STATUS_TR: Record<string, string> = {
                    pending:   'Beklemede',
                    confirmed: 'Onaylı',
                    cancelled: 'İptal',
                    completed: 'Tamamlandı',
                  }
                  const cls = STATUS_CLS[r.status] ?? 'text-stone-400 bg-stone-800'
                  return (
                    <div key={r.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className="text-stone-500 text-xs font-mono w-10 flex-shrink-0">
                        {(r.reserved_time ?? '').slice(0, 5)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-stone-200 truncate">{r.guest_name ?? 'Misafir'}</div>
                        {r.calisanlar?.ad ? (
                          <div className="text-xs text-stone-500 truncate">💆 {r.calisanlar.ad}</div>
                        ) : r.party_size ? (
                          <div className="text-xs text-stone-500">👥 {r.party_size} kişi</div>
                        ) : null}
                        {r.hizmetler?.ad && (
                          <div className="text-xs text-stone-600 truncate">✨ {r.hizmetler.ad}</div>
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${cls}`}>
                        {STATUS_TR[r.status] ?? r.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
