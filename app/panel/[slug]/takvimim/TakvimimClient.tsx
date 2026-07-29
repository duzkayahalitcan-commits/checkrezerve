'use client'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export default function TakvimimClient({ restaurantId }: { restaurantId: string }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [reservations, setReservations] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/panel-reservations?restaurant_id=${restaurantId}&date=${date}`)
      if (res.ok) {
        const data = await res.json()
        setReservations(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
    }
  }, [restaurantId, date])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => {
          const d = new Date(date); d.setDate(d.getDate() - 1)
          setDate(d.toISOString().slice(0, 10))
        }} className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-all">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 text-center">
          <span className="text-white font-semibold text-sm">
            {new Date(date + 'T12:00').toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <button onClick={() => {
          const d = new Date(date); d.setDate(d.getDate() + 1)
          setDate(d.toISOString().slice(0, 10))
        }} className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-all">
          <ChevronRight size={18} />
        </button>
        <button onClick={() => setDate(new Date().toISOString().slice(0, 10))}
          className="px-3 py-1.5 rounded-lg text-xs bg-stone-800 text-stone-300 hover:bg-stone-700 transition-all">
          Bugün
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-500 text-sm">Yükleniyor...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Bu tarihte rezervasyon yok</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(reservations as Array<Record<string, unknown>>)
            .sort((a, b) => ((a.reserved_time as string) ?? '').localeCompare((b.reserved_time as string) ?? ''))
            .map((r: Record<string, unknown>) => (
              <div key={r.id as string} className="bg-stone-800/30 border border-stone-700 rounded-xl p-4 flex items-center gap-4">
                <div className="text-sm font-bold text-white w-12 text-center">
                  {(r.reserved_time as string)?.slice(0, 5) ?? '--:--'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{r.guest_name as string ?? 'Misafir'}</div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {r.party_size ? `${r.party_size} kişi` : ''}
                    {r.hizmetler ? (r.hizmetler as Record<string, unknown>)?.ad as string : ''}
                    {r.calisanlar ? ` · ${(r.calisanlar as Record<string, unknown>)?.ad as string}` : ''}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  r.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-300' :
                  r.status === 'completed' ? 'bg-blue-500/15 text-blue-400' :
                  r.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                  'bg-amber-500/15 text-amber-300'
                }`}>
                  {r.status === 'confirmed' ? 'Onaylı' : r.status === 'completed' ? 'Tamamlandı' : r.status === 'cancelled' ? 'İptal' : 'Beklemede'}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
