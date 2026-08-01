'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, X, Check } from 'lucide-react'

type BekleyenOdeme = {
  id: string
  musteri_adi: string
  paket_adi: string
  toplam_tutar: number | null
  odenen_tutar: number
  kalan_tutar: number
  odeme_durumu: string
  son_odeme_tarihi: string | null
  bitis_tarihi: string | null
}

export default function OdemeTakip({ restaurantId }: { restaurantId: string }) {
  const [rows, setRows] = useState<BekleyenOdeme[]>([])
  const [loading, setLoading] = useState(true)
  const [odemeliModal, setOdemeModal] = useState<{ id: string; ad: string; kalan: number } | null>(null)
  const [odemeTutar, setOdemeTutar] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/panel/musteri-paketleri?restaurant_id=${restaurantId}`)
      const data = await res.json()
      const list: BekleyenOdeme[] = (Array.isArray(data) ? data : []).filter((r: Record<string, unknown>) => {
        const durum = (r.odeme_durumu as string) ?? 'odendi'
        return durum !== 'odendi'
      }).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        musteri_adi: (r.musteri_adi as string) ?? '?',
        paket_adi: (r.paket_adi as string) ?? '?',
        toplam_tutar: r.toplam_tutar as number | null,
        odenen_tutar: (r.odenen_tutar as number) ?? 0,
        kalan_tutar: ((r.toplam_tutar as number) ?? 0) - ((r.odenen_tutar as number) ?? 0),
        odeme_durumu: (r.odeme_durumu as string) ?? 'bekliyor',
        son_odeme_tarihi: r.son_odeme_tarihi as string | null,
        bitis_tarihi: (r.bitis_tarihi as string | null) ?? null,
      }))
      setRows(list)
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => { load() }, [load])

  const handleOdeme = useCallback(async () => {
    if (!odemeliModal || !odemeTutar) return
    setSaving(true)
    try {
      const res = await fetch(`/api/panel/paket-odeme/${odemeliModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odenen_miktar: parseFloat(odemeTutar) }),
      })
      if (res.ok) {
        setOdemeModal(null)
        setOdemeTutar('')
        load()
      }
    } finally {
      setSaving(false)
    }
  }, [odemeliModal, odemeTutar, load])

  const vadeGecti = (bitis: string | null) => {
    if (!bitis) return false
    return bitis < new Date().toISOString().slice(0, 10)
  }

  if (loading) return <div className="text-center py-10 text-stone-500 text-sm">Yükleniyor...</div>

  return (
    <div>
      {rows.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <DollarSign size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Bekleyen ödeme yok</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-700/50">
                <th className="text-left py-3 px-3 font-medium">Üye</th>
                <th className="text-left py-3 px-3 font-medium">Paket</th>
                <th className="text-right py-3 px-3 font-medium">Toplam</th>
                <th className="text-right py-3 px-3 font-medium">Ödenen</th>
                <th className="text-right py-3 px-3 font-medium">Kalan</th>
                <th className="text-left py-3 px-3 font-medium">Son Ödeme</th>
                <th className="text-left py-3 px-3 font-medium">Durum</th>
                <th className="text-right py-3 px-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const vade = vadeGecti(r.bitis_tarihi)
                return (
                  <tr key={r.id} className={`border-b border-stone-800/50 hover:bg-white/[0.02] transition-colors ${vade ? 'bg-red-500/5' : ''}`}>
                    <td className="py-3 px-3 font-medium text-white">{r.musteri_adi}</td>
                    <td className="py-3 px-3 text-stone-300">{r.paket_adi}</td>
                    <td className="py-3 px-3 text-right text-stone-300">₺{r.toplam_tutar?.toLocaleString() ?? '-'}</td>
                    <td className="py-3 px-3 text-right text-stone-400">₺{r.odenen_tutar.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-semibold text-amber-400">₺{r.kalan_tutar.toLocaleString()}</td>
                    <td className="py-3 px-3 text-stone-400 text-xs">{r.son_odeme_tarihi ?? '-'}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vade ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {vade ? 'Vadesi Geçmiş' : r.odeme_durumu === 'taksitli' ? 'Taksitli' : 'Bekliyor'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setOdemeModal({ id: r.id, ad: r.musteri_adi, kalan: r.kalan_tutar })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-all"
                      >
                        Ödeme Al
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ödeme Modal */}
      {odemeliModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOdemeModal(null)}>
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">Ödeme Al</h3>
              <button onClick={() => setOdemeModal(null)} aria-label="Kapat" className="text-stone-500 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-xs text-stone-400 mb-4">{odemeliModal.ad} - Kalan: ₺{odemeliModal.kalan.toLocaleString()}</p>
            <input
              type="number"
              step="0.01"
              value={odemeTutar}
              onChange={e => setOdemeTutar(e.target.value)}
              placeholder="Ödeme tutarı"
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white mb-4"
              max={odemeliModal.kalan}
            />
            <div className="flex gap-2">
              <button onClick={handleOdeme} disabled={saving || !odemeTutar} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50">
                <Check size={14} /> {saving ? 'Kaydediliyor...' : 'Ödemeyi Kaydet'}
              </button>
              <button onClick={() => setOdemeModal(null)} className="px-4 py-2 rounded-lg bg-stone-700 text-stone-300 text-sm hover:bg-stone-600 transition-all">İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
