'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { TakvimReservation } from './CalendarTypes'

export default function CalendarGrid({
  year: initYear,
  month: initMonth,
  reservations,
  selectedDate,
  onSelectDate,
  onSelectReservation,
  restaurantId,
}: {
  year: number
  month: number
  reservations: TakvimReservation[]
  selectedDate: string | null
  onSelectDate: (d: string | null) => void
  onSelectReservation: (r: TakvimReservation) => void
  restaurantId: string
}) {
  const [year, setYear] = useState(initYear)
  const [month, setMonth] = useState(initMonth)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const today = new Date().toISOString().slice(0, 10)

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1)
  const lastDay  = new Date(year, month, 0)
  const totalDays = lastDay.getDate()
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const cells: (string | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(year, month - 1, i + 1)
      return d.toISOString().slice(0, 10)
    }),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('tr', {
    month: 'long', year: 'numeric',
  })

  // Günlük istatistik
  const dayStats = useMemo(() => {
    const map: Record<string, { total: number; pending: number; confirmed: number }> = {}
    for (const r of reservations) {
      const d = r.reserved_date
      if (!map[d]) map[d] = { total: 0, pending: 0, confirmed: 0 }
      if (r.status !== 'cancelled' && !r.is_deleted) map[d].total++
      if (r.status === 'pending') map[d].pending++
      if (r.status === 'confirmed') map[d].confirmed++
    }
    return map
  }, [reservations])

  const selectedReservations = useMemo(
    () => selectedDate ? reservations.filter(r => r.reserved_date === selectedDate && !r.is_deleted) : [],
    [selectedDate, reservations]
  )

  return (
    <div>
      {/* Ay navigasyonu */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-bold text-white capitalize text-sm">{monthName}</h2>
        <button onClick={nextMonth}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Gün başlıkları */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
          <div key={d} className="text-[11px] text-stone-600 font-semibold py-1">{d}</div>
        ))}
      </div>

      {/* Takvim hücreleri */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />

          const stats = dayStats[date]
          const isToday = date === today
          const isSel = date === selectedDate
          const count = stats?.total ?? 0
          const hasPending = (stats?.pending ?? 0) > 0

          const cellBg = isSel
            ? 'bg-[#D4A373]/15 border-[#D4A373]/40'
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
              onClick={() => onSelectDate(date === selectedDate ? null : date)}
              className={`relative aspect-square rounded-xl border p-1.5 text-left transition-colors cursor-pointer ${cellBg} hover:border-stone-600`}
            >
              <span className={`text-xs font-bold leading-none ${
                isSel ? 'text-[#D4A373]' : isToday ? 'text-amber-400' : 'text-stone-300'
              }`}>
                {new Date(date + 'T12:00').getDate()}
              </span>
              {count > 0 && (
                <div className="absolute bottom-1.5 inset-x-1.5 flex gap-0.5 justify-end items-end">
                  <span className={`text-[9px] font-bold ${count > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {count}
                  </span>
                  {hasPending && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Lejant */}
      <div className="flex items-center gap-4 text-[11px] text-stone-600 mt-3">
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

      {/* Seçili gün detayı */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                {new Date(selectedDate + 'T12:00').toLocaleDateString('tr', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </h3>
            </div>

            {selectedReservations.length === 0 ? (
              <p className="text-stone-600 text-sm text-center py-4">Bu gün rezervasyon yok.</p>
            ) : (
              <div className="space-y-2">
                {selectedReservations.map(r => {
                  const STATUS_CLS: Record<string, string> = {
                    pending:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    confirmed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
                    completed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  }
                  const STATUS_TR: Record<string, string> = {
                    pending:   'Beklemede',
                    confirmed: 'Onaylı',
                    cancelled: 'İptal',
                    completed: 'Tamamlandı',
                  }
                  const cls = STATUS_CLS[r.status] ?? 'text-stone-400 bg-stone-800 border-stone-700'

                  return (
                    <motion.button
                      key={r.id}
                      layoutId={`card-${r.id}`}
                      onClick={() => onSelectReservation(r)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-stone-800/50 transition-colors w-full text-left border border-transparent hover:border-stone-700"
                    >
                      <span className="text-stone-500 text-xs font-mono w-10 shrink-0">
                        {(r.reserved_time ?? '').slice(0, 5)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-stone-200 truncate">{r.guest_name ?? 'Misafir'}</div>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          {r.party_size && <span>👥 {r.party_size}</span>}
                          {(r.calisanlar as { ad: string }[] | null)?.[0]?.ad &&
                            <span>💆 {(r.calisanlar as { ad: string }[])[0].ad}</span>
                          }
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 border ${cls}`}>
                        {STATUS_TR[r.status] ?? r.status}
                      </span>
                    </motion.button>
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
