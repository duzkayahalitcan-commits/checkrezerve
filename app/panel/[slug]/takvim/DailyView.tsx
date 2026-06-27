'use client'

import { useMemo, useState, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { updateReservation } from './actions'
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
  pending:   'bg-amber-400', confirmed: 'bg-emerald-400',
  cancelled: 'bg-red-400/50', completed: 'bg-blue-400',
}

export default function DailyView({
  date, reservations, onSelect, selectedId,
}: {
  date: string; reservations: TakvimReservation[]
  onSelect: (r: TakvimReservation) => void; selectedId: string | null
}) {
  const router = useRouter()
  const toast = useToast()
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOverHour, setDragOverHour] = useState<string | null>(null)
  const dragRef = useRef<{ id: string; origTime: string } | null>(null)

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
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const totalGuests = reservations.reduce((sum, r) => sum + (r.party_size ?? 0), 0)

  // Sürükle-bırak: rezervasyonu saat dilimine taşı
  const handleDrop = useCallback(async (reservationId: string, newHour: string) => {
    if (!dragRef.current) return
    if (dragRef.current.origTime === newHour) { setDragging(null); return }

    const res = await updateReservation(reservationId, { reserved_time: newHour })
    if (res.success) {
      toast.show('Saat güncellendi ✅', 'success')
      router.refresh()
    } else {
      toast.show('Güncellenemedi', 'error')
    }
    setDragging(null)
    setDragOverHour(null)
  }, [router, toast])

  return (
    <div className="space-y-3">
      {/* Day header */}
      <div className="sticky top-0 z-10 bg-stone-950 py-3 border-b border-stone-800">
        <h2 className="text-white font-bold text-base">{dayLabel}</h2>
        <p className="text-xs text-stone-500 mt-0.5">{reservations.length} rezervasyon · {totalGuests} kişi</p>
        {/* Tarih navigasyonu */}
        <div className="flex gap-2 mt-2">
          <button onClick={() => {
            const d = new Date(date + 'T12:00')
            d.setDate(d.getDate() - 1)
            window.location.href = `?view=gunluk&g=${d.toISOString().slice(0, 10)}`
          }} className="text-xs text-stone-500 hover:text-white px-2 py-1 rounded-lg bg-stone-800">← Önceki</button>
          <button onClick={() => window.location.href = `?view=gunluk`}
            className="text-xs text-[#D4A373] px-2 py-1 rounded-lg bg-stone-800">Bugün</button>
          <button onClick={() => {
            const d = new Date(date + 'T12:00')
            d.setDate(d.getDate() + 1)
            window.location.href = `?view=gunluk&g=${d.toISOString().slice(0, 10)}`
          }} className="text-xs text-stone-500 hover:text-white px-2 py-1 rounded-lg bg-stone-800">Sonraki →</button>
        </div>
      </div>

      {/* Hour slots */}
      <div className="space-y-1">
        {HOURS.map(hour => {
          const slots = byHour[hour] ?? []
          const isDragOver = dragOverHour === hour

          return (
            <div
              key={hour}
              onDragOver={e => { e.preventDefault(); setDragOverHour(hour) }}
              onDragLeave={() => setDragOverHour(null)}
              onDrop={e => {
                e.preventDefault()
                const rid = e.dataTransfer.getData('text/plain')
                if (rid) handleDrop(rid, hour)
              }}
              className={`group flex gap-3 min-h-[52px] rounded-lg transition-colors ${
                isDragOver ? 'bg-[#D4A373]/10 border border-dashed border-[#D4A373]/40' : ''
              }`}
            >
              {/* Time label */}
              <div className="w-12 shrink-0 pt-1.5 text-right">
                <span className="text-[11px] font-mono text-stone-500">{hour}</span>
              </div>

              {/* Slot content */}
              <div className="flex-1 border-t border-stone-800/50 pt-1 pb-1 space-y-1">
                {slots.length === 0 ? (
                  <div className="w-full h-8 rounded-lg border border-dashed border-stone-800 opacity-0 group-hover:opacity-100 transition-all text-[10px] text-stone-700 flex items-center justify-center">
                    Boş
                  </div>
                ) : (
                  slots.map(r => {
                    const isSelected = selectedId === r.id
                    const colorCls = STATUS_COLORS[r.status] ?? 'border-l-stone-600 bg-stone-800'
                    const dotCls = STATUS_DOT[r.status] ?? 'bg-stone-500'

                    const getRel = (val: unknown) => {
                      if (!val) return null
                      const arr = Array.isArray(val) ? val : [val]
                      return arr[0] ?? null
                    }
                    const staffName = getRel(r.calisanlar)?.ad
                    const masaName = getRel(r.masa_tipleri)?.ad

                    return (
                      <motion.div
                        key={r.id}
                        layoutId={`card-${r.id}`}
                        draggable
                        onDragStart={(e: unknown) => {
                          const ev = e as React.DragEvent
                          dragRef.current = { id: r.id, origTime: r.reserved_time ?? '' }
                          ev.dataTransfer.setData('text/plain', r.id)
                          setDragging(r.id)
                        }}
                        onDragEnd={() => { setDragging(null); setDragOverHour(null) }}
                        onClick={() => onSelect(r)}
                        className={`w-full text-left rounded-xl border-l-4 p-2.5 transition-all hover:brightness-110 cursor-grab active:cursor-grabbing ${
                          isSelected ? 'ring-2 ring-[#D4A373]' : ''
                        } ${dragging === r.id ? 'opacity-50 scale-95' : ''} ${colorCls}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
                            <span className="text-sm font-semibold text-white truncate">
                              {r.guest_name ?? 'Misafir'}
                            </span>
                            {r.party_size && <span className="text-xs text-stone-500 shrink-0">👥{r.party_size}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                          {staffName && <span>💆 {staffName}</span>}
                          {masaName && <span>🪑 {masaName}</span>}
                        </div>
                      </motion.div>
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
