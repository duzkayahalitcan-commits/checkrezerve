'use client'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, CheckCircle } from 'lucide-react'

export default function UyeSeanslarimClient({ restaurantId }: { restaurantId: string }) {
  const [todayRes, setTodayRes] = useState<Record<string, unknown>[]>([])
  const [uyeler, setUyeler] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [dusulen, setDusulen] = useState<Set<string>>(new Set())
  const [uyari, setUyari] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Bugunun rezervasyonlari
      const res = await fetch(`/api/panel-reservations?restaurant_id=${restaurantId}&date=${today}`)
      const data = res.ok ? await res.json() : []
      setTodayRes(Array.isArray(data) ? data.filter((r: Record<string, unknown>) =>
        r.status === 'confirmed' || r.status === 'completed'
      ) : [])

      // Uye paketleri
      const mpRes = await fetch(`/api/panel/musteri-paketleri?restaurant_id=${restaurantId}`)
      const mpData = mpRes.ok ? await mpRes.json() : []
      setUyeler(Array.isArray(mpData) ? mpData : [])
    } finally {
      setLoading(false)
    }
  }, [restaurantId, today])

  useEffect(() => { load() }, [load])

  const handleComplete = async (reservationId: string) => {
    // Once status guncelle
    const statusRes = await fetch('/api/panel-reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reservationId, status: 'completed' }),
    })
    if (!statusRes.ok) return

    // Sonra seans dus
    const seansRes = await fetch('/api/panel/seans-dus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservation_id: reservationId }),
    })
    const seansData = seansRes.ok ? await seansRes.json() : null

    setDusulen(prev => new Set(prev).add(reservationId))
    if (seansData?.uyari) {
      setUyari(seansData.uyari_mesaji)
      setTimeout(() => setUyari(null), 5000)
    }
    load()
  }

  if (loading) return <div className="text-center py-16 text-stone-500 text-sm">Yükleniyor...</div>

  return (
    <div className="space-y-8">
      {/* Uyari */}
      {uyari && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm font-medium">
          {uyari}
        </div>
      )}

      {/* Bugunku Seanslarim */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Calendar size={15} /> Bugünkü Seanslarım
        </h2>
        {todayRes.length === 0 ? (
          <div className="text-center py-10 text-stone-500 text-sm border border-stone-800 rounded-xl">
            Bugün için rezervasyon yok
          </div>
        ) : (
          <div className="space-y-2">
            {todayRes.map((r: Record<string, unknown>) => {
              const isDone = dusulen.has(r.id as string) || r.status === 'completed'
              return (
                <div key={r.id as string} className="bg-stone-800/30 border border-stone-700 rounded-xl p-4 flex items-center gap-4">
                  <div className="text-sm font-bold text-white w-12 text-center">
                    {(r.reserved_time as string)?.slice(0, 5) ?? '--:--'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{r.guest_name as string ?? 'Misafir'}</div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {r.party_size ? `${r.party_size} kişi` : ''}
                      {r.hizmetler ? ` · ${(r.hizmetler as Record<string, unknown>)?.ad as string}` : ''}
                    </div>
                  </div>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle size={14} /> Tamamlandı
                    </span>
                  ) : (
                    <button onClick={() => handleComplete(r.id as string)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-all">
                      Tamamlandı
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Üyelerim */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Üyelerim</h2>
        {uyeler.length === 0 ? (
          <div className="text-center py-10 text-stone-500 text-sm border border-stone-800 rounded-xl">
            Henüz üye paketi bulunmuyor
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-700/50">
                  <th className="text-left py-3 px-3 font-medium">Müşteri</th>
                  <th className="text-left py-3 px-3 font-medium">Paket</th>
                  <th className="text-left py-3 px-3 font-medium">Kalan / Toplam</th>
                  <th className="text-left py-3 px-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {(uyeler as Array<Record<string, unknown>>).map((u) => (
                  <tr key={u.id as string} className="border-b border-stone-800/50">
                    <td className="py-3 px-3 text-white font-medium">{u.musteri_adi as string}</td>
                    <td className="py-3 px-3 text-stone-300">{u.paket_adi as string}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] h-1.5 bg-stone-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${((u.kalan_oran as number) ?? 0) > 0.3 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.round(((u.kalan_oran as number) ?? 0) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-stone-400">{u.kalan_seans as number}/{u.toplam_seans as number}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.durum === 'aktif' ? 'bg-emerald-500/20 text-emerald-400' :
                        u.durum === 'bitti' ? 'bg-stone-500/20 text-stone-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {u.durum === 'aktif' ? 'Aktif' : u.durum === 'bitti' ? 'Bitti' : 'İptal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
