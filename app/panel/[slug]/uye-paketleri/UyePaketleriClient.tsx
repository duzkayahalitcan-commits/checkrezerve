'use client'
import { useState, useEffect, useCallback } from 'react'
import { Users, Search, RefreshCw, AlertTriangle } from 'lucide-react'

type ListRow = {
  id: string
  musteri_id: string
  musteri_adi: string
  musteri_email: string | null
  paket_adi: string
  toplam_seans: number
  kalan_seans: number
  kalan_oran: number
  bitis_tarihi: string | null
  durum: string
  calisan_adi: string | null
}

type PaketOption = { id: string; ad: string }

export default function UyePaketleriClient({ restaurantId }: { restaurantId: string }) {
  const [rows, setRows] = useState<ListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [paketler, setPaketler] = useState<PaketOption[]>([])
  const [showAssign, setShowAssign] = useState(false)
  const [assignForm, setAssignForm] = useState({ musteri_id: '', paket_id: '', calisan_id: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [r, p] = await Promise.all([
        fetch(`/api/panel/musteri-paketleri?restaurant_id=${restaurantId}`).then(r => r.json()),
        fetch(`/api/panel/paketler?restaurant_id=${restaurantId}`).then(r => r.json()),
      ])
      setRows(r ?? [])
      setPaketler((p ?? []).filter((x: PaketOption & { aktif: boolean }) => x.aktif))
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => { load() }, [load])

  const handleAssign = useCallback(async () => {
    if (!assignForm.musteri_id || !assignForm.paket_id) return
    setSaving(true)
    try {
      const res = await fetch('/api/panel/musteri-paketleri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          paket_id: assignForm.paket_id,
          musteri_id: assignForm.musteri_id,
          calisan_id: assignForm.calisan_id || null,
        }),
      })
      if (res.ok) {
        setShowAssign(false)
        setAssignForm({ musteri_id: '', paket_id: '', calisan_id: '' })
        load()
      }
    } finally {
      setSaving(false)
    }
  }, [assignForm, restaurantId, load])

  const handleRenew = useCallback(async (id: string) => {
    const res = await fetch('/api/panel/musteri-paketleri', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'yenile' }),
    })
    if (res.ok) load()
  }, [load])

  const statusBadge = (durum: string, kalan: number, toplam: number) => {
    const oran = toplam > 0 ? kalan / toplam : 0
    if (durum === 'aktif' && kalan <= 2 && kalan > 0) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><AlertTriangle size={10} /> Yenileme Zamanı</span>
    }
    if (durum === 'aktif') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Aktif</span>
    if (durum === 'bitti') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-500/20 text-stone-400 border border-stone-500/30">Bitti</span>
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">İptal</span>
  }

  return (
    <div className="space-y-4">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => setShowAssign(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm font-semibold transition-all">
          <Users size={16} /> Paket Ata
        </button>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 text-sm transition-all">
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {/* Ata formu */}
      {showAssign && (
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Müşteri ID (profiles) *</label>
              <input value={assignForm.musteri_id} onChange={e => setAssignForm(f => ({ ...f, musteri_id: e.target.value }))} className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white" placeholder="Kullanıcı UUID" />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Paket *</label>
              <select value={assignForm.paket_id} onChange={e => setAssignForm(f => ({ ...f, paket_id: e.target.value }))} className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Seçin</option>
                {paketler.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Çalışan (opsiyonel)</label>
              <input value={assignForm.calisan_id} onChange={e => setAssignForm(f => ({ ...f, calisan_id: e.target.value }))} className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white" placeholder="Çalışan ID" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAssign} disabled={saving || !assignForm.musteri_id || !assignForm.paket_id} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50">
              {saving ? 'Kaydediliyor...' : 'Ata'}
            </button>
            <button onClick={() => setShowAssign(false)} className="px-4 py-2 rounded-lg bg-stone-700 text-stone-300 text-sm hover:bg-stone-600 transition-all">İptal</button>
          </div>
        </div>
      )}

      {/* Tablo */}
      {loading ? (
        <div className="text-center py-16 text-stone-500 text-sm">Yükleniyor...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Henüz üye paketi yok</p>
          <p className="text-xs mt-1 opacity-70">Yukarıdaki butondan bir müşteriye paket atayın</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-stone-700/50">
                <th className="text-left py-3 px-3 font-medium">Müşteri</th>
                <th className="text-left py-3 px-3 font-medium">Paket</th>
                <th className="text-left py-3 px-3 font-medium">Kalan / Toplam</th>
                <th className="text-left py-3 px-3 font-medium">Bitiş</th>
                <th className="text-left py-3 px-3 font-medium">Durum</th>
                <th className="text-left py-3 px-3 font-medium">Çalışan</th>
                <th className="text-right py-3 px-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-stone-800/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-white">{r.musteri_adi}</div>
                    {r.musteri_email && <div className="text-xs text-stone-500">{r.musteri_email}</div>}
                  </td>
                  <td className="py-3 px-3 text-stone-300">{r.paket_adi}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[80px] h-1.5 bg-stone-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${r.kalan_oran > 0.3 ? 'bg-emerald-500' : r.kalan_oran > 0 ? 'bg-amber-500' : 'bg-stone-500'}`} style={{ width: `${Math.round(r.kalan_oran * 100)}%` }} />
                      </div>
                      <span className="text-xs text-stone-400 w-14 text-right">{r.kalan_seans}/{r.toplam_seans}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-stone-400 text-xs">{r.bitis_tarihi ?? '-'}</td>
                  <td className="py-3 px-3">{statusBadge(r.durum, r.kalan_seans, r.toplam_seans)}</td>
                  <td className="py-3 px-3 text-stone-400 text-xs">{r.calisan_adi ?? '-'}</td>
                  <td className="py-3 px-3 text-right">
                    {r.durum === 'aktif' && (
                      <button onClick={() => handleRenew(r.id)} className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all">
                        Yenile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
