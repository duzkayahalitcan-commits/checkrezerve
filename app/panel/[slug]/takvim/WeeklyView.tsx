'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

type Reservation = {
  id: string
  guest_name: string | null
  reserved_time: string
  party_size: number | null
  status: string
}

type WeekDay = {
  date: string
  label: string
  dayLabel: string
  reservations: Reservation[]
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber-500/20 border-amber-500/40 text-amber-300',
  confirmed: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  cancelled: 'bg-red-500/20 border-red-500/40 text-red-300',
  completed: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
}

const STATUS_TR: Record<string, string> = {
  pending: 'Bekleyen', confirmed: 'Onaylı', cancelled: 'İptal', completed: 'Tamamlandı',
}

function buildWeek(offsetWeeks: number): string[] {
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - day + 1 + offsetWeeks * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export default function WeeklyView({
  reservationsByDate,
}: {
  reservationsByDate: Record<string, Reservation[]>
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const today = new Date().toISOString().slice(0, 10)
  const dates = buildWeek(weekOffset)

  const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  const DAY_SHORT = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']

  const weekDays: WeekDay[] = dates.map((date, i) => ({
    date,
    label: DAY_NAMES[i],
    dayLabel: DAY_SHORT[i],
    reservations: reservationsByDate[date] ?? [],
  }))

  const rangeLabel = `${new Date(dates[0] + 'T12:00').toLocaleDateString('tr', { day: 'numeric', month: 'short' })} – ${new Date(dates[6] + 'T12:00').toLocaleDateString('tr', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Önceki hafta"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-xs text-stone-500">{rangeLabel}</p>
          {weekOffset === 0 && <p className="text-[10px] text-amber-400 font-semibold">Bu Hafta</p>}
          {weekOffset === 1 && <p className="text-[10px] text-stone-500">Gelecek Hafta</p>}
          {weekOffset === -1 && <p className="text-[10px] text-stone-500">Geçen Hafta</p>}
        </div>
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 transition"
          aria-label="Sonraki hafta"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 7-column grid — horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="grid grid-cols-7 gap-2 min-w-[560px]">
          {weekDays.map(({ date, dayLabel, reservations }) => {
            const isToday = date === today
            const dayNum = new Date(date + 'T12:00').getDate()
            return (
              <div
                key={date}
                className={`rounded-xl border ${
                  isToday
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-stone-800 bg-stone-900'
                } flex flex-col min-h-[200px]`}
              >
                {/* Day header */}
                <div className={`px-2 py-2 border-b ${isToday ? 'border-amber-500/20' : 'border-stone-800'} text-center`}>
                  <p className={`text-[10px] font-semibold ${isToday ? 'text-amber-400' : 'text-stone-500'}`}>
                    {dayLabel}
                  </p>
                  <p className={`text-base font-bold leading-none mt-0.5 ${isToday ? 'text-amber-400' : 'text-stone-300'}`}>
                    {dayNum}
                  </p>
                  {reservations.length > 0 && (
                    <p className="text-[9px] text-stone-500 mt-0.5">{reservations.length} rezervasyon</p>
                  )}
                </div>

                {/* Reservation cards */}
                <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-72">
                  {reservations.length === 0 ? (
                    <p className="text-[10px] text-stone-700 text-center pt-4">—</p>
                  ) : (
                    reservations.map(r => (
                      <motion.div
                        key={r.id}
                        initial={false}
                        animate={{ opacity: 1 }}
                        className={`rounded-lg border px-2 py-1.5 text-[10px] leading-snug ${STATUS_COLOR[r.status] ?? 'bg-stone-800 border-stone-700 text-stone-400'}`}
                      >
                        <p className="font-semibold truncate">{r.guest_name ?? 'Misafir'}</p>
                        <p className="text-[9px] opacity-70">
                          {(r.reserved_time ?? '').slice(0, 5)}
                          {r.party_size ? ` · ${r.party_size} kişi` : ''}
                        </p>
                        <p className="text-[9px] opacity-60 mt-0.5">{STATUS_TR[r.status] ?? r.status}</p>
                      </motion.div>
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
