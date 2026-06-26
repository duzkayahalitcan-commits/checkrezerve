'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import type { TakvimReservation } from './CalendarTypes'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber-500/20 border-amber-500/40 text-amber-300',
  confirmed: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  cancelled: 'bg-red-500/20 border-red-500/40 text-red-300',
  completed: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
}
const STATUS_TR: Record<string, string> = {
  pending: 'Bekleyen', confirmed: 'Onaylı', cancelled: 'İptal', completed: 'Tamamlandı',
}

function buildWeek(offset: number): string[] {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - day + 1 + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export default function WeeklyView({
  reservations,
  onSelect,
  selectedId,
}: {
  reservations: TakvimReservation[]
  onSelect: (r: TakvimReservation) => void
  selectedId: string | null
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const today = new Date().toISOString().slice(0, 10)
  const dates = buildWeek(weekOffset)

  const byDate = useMemo(() => {
    const map: Record<string, TakvimReservation[]> = {}
    for (const d of dates) map[d] = []
    for (const r of reservations) {
      if (!r.is_deleted && map[r.reserved_date]) {
        map[r.reserved_date].push(r)
      }
    }
    return map
  }, [reservations, dates])

  const DAY_SHORT = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']

  const rangeLabel = `${new Date(dates[0] + 'T12:00').toLocaleDateString('tr', { day: 'numeric', month: 'short' })} – ${new Date(dates[6] + 'T12:00').toLocaleDateString('tr', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div className="space-y-4">
      {/* Hafta navigasyonu */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-xs text-stone-500">{rangeLabel}</p>
          {weekOffset === 0 && <p className="text-[10px] text-amber-400 font-semibold">Bu Hafta</p>}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 7 sütun */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="grid grid-cols-7 gap-2 min-w-[560px]">
          {dates.map((date, i) => {
            const isToday = date === today
            const dayNum = new Date(date + 'T12:00').getDate()
            const slots = byDate[date] ?? []

            return (
              <div
                key={date}
                className={`rounded-xl border ${
                  isToday ? 'border-amber-500/30 bg-amber-500/5' : 'border-stone-800 bg-stone-900'
                } flex flex-col min-h-[200px]`}
              >
                <div className={`px-2 py-2 border-b ${isToday ? 'border-amber-500/20' : 'border-stone-800'} text-center`}>
                  <p className={`text-[10px] font-semibold ${isToday ? 'text-amber-400' : 'text-stone-500'}`}>
                    {DAY_SHORT[i]}
                  </p>
                  <p className={`text-base font-bold leading-none mt-0.5 ${isToday ? 'text-amber-400' : 'text-stone-300'}`}>
                    {dayNum}
                  </p>
                  {slots.length > 0 && (
                    <p className="text-[9px] text-stone-500 mt-0.5">{slots.length} rez.</p>
                  )}
                </div>

                <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-72">
                  {slots.length === 0 ? (
                    <p className="text-[10px] text-stone-700 text-center pt-4">—</p>
                  ) : (
                    slots.map(r => (
                      <motion.button
                        key={r.id}
                        layoutId={`card-${r.id}`}
                        onClick={() => onSelect(r)}
                        className={`w-full text-left rounded-lg border px-2 py-1.5 text-[10px] leading-snug transition-all ${
                          selectedId === r.id ? 'ring-2 ring-[#D4A373]' : ''
                        } ${STATUS_COLOR[r.status] ?? 'bg-stone-800 border-stone-700 text-stone-400'}`}
                      >
                        <p className="font-semibold truncate">{r.guest_name ?? 'Misafir'}</p>
                        <p className="text-[9px] opacity-70">
                          {(r.reserved_time ?? '').slice(0, 5)}
                          {r.party_size ? ` · ${r.party_size} kişi` : ''}
                        </p>
                        <p className="text-[9px] opacity-60 mt-0.5">{STATUS_TR[r.status] ?? r.status}</p>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
