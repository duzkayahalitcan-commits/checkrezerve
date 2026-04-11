'use client'

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
  const today = new Date().toISOString().slice(0, 10)
  const max   = Math.max(...days.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-2 h-32">
      {days.map(day => {
        const isToday  = day.date === today
        const barH     = Math.max(4, Math.round((day.count / max) * 100))
        const barColor =
          day.pct >= 80 ? 'bg-red-500' :
          day.pct >= 50 ? 'bg-amber-500' :
          'bg-emerald-500'

        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
            {/* Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none
                            absolute -translate-y-8 bg-stone-700 text-white text-xs
                            rounded px-2 py-1 whitespace-nowrap z-10">
              {day.count} rezervasyon · %{day.pct} dolu
            </div>

            {/* Sayı */}
            <span className="text-xs text-stone-500 group-hover:text-white transition">
              {day.count > 0 ? day.count : ''}
            </span>

            {/* Bar */}
            <div className="w-full bg-stone-800 rounded-t-md relative" style={{ height: '96px' }}>
              <div
                className={`absolute bottom-0 w-full rounded-t-md transition-all ${barColor}
                            ${isToday ? 'ring-2 ring-white/30' : ''}`}
                style={{ height: `${barH}%` }}
              />
            </div>

            {/* Gün etiketi */}
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
