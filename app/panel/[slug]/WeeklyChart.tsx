'use client'

import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'motion/react'

type DayStat = {
  date:  string
  label: string
  count: number
  pct:   number
}

export default function WeeklyChart({
  days,
  capacity,
}: {
  days:     DayStat[]
  capacity: number
}) {
  const t      = useTranslations('panel')
  const locale = useLocale()
  const today  = new Date().toISOString().slice(0, 10)
  const max    = Math.max(...days.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-2 h-32">
      {days.map((day, i) => {
        const isToday  = day.date === today
        const barH     = Math.max(4, Math.round((day.count / max) * 100))
        const barColor = day.pct >= 80 ? 'bg-red-500' : day.pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
        const pctStr   = new Intl.NumberFormat(locale, {
          style: 'percent', maximumFractionDigits: 0,
        }).format(day.pct / 100)
        const tooltip  = `${day.count} ${t('chartReservation')} · ${pctStr} ${t('chartFull')}`

        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none
                            absolute -top-8 bg-stone-700 text-white text-xs
                            rounded px-2 py-1 whitespace-nowrap z-10">
              {tooltip}
            </div>

            <span className="text-xs text-stone-500 group-hover:text-white transition">
              {day.count > 0 ? day.count : ''}
            </span>

            <div className="w-full bg-stone-800 rounded-t-md relative" style={{ height: '96px' }}>
              <motion.div
                className={`absolute bottom-0 w-full rounded-t-md ${barColor} ${isToday ? 'ring-2 ring-white/30' : ''}`}
                initial={{ height: 0 }}
                animate={{ height: `${barH}%` }}
                transition={{ duration: 0.7, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>

            <span className={`text-xs truncate w-full text-center leading-tight
                              ${isToday ? 'text-amber-400 font-semibold' : 'text-stone-500'}`}>
              {day.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
