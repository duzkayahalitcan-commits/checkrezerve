'use client'
import { useState, useEffect, useCallback } from 'react'
import { Package, Plus, Pencil, Check, X } from 'lucide-react'

type Paket = {
  id: string
  ad: string
  toplam_seans: number
  gecerlilik_gun: number
  fiyat: number | null
  hizmet_id: string | null
  aktif: boolean
}

type Service = { id: string; name: string }

export default function PaketlerManager({ paketler: initial, services, restaurantId }: { paketler: Paket[]; services: Service[]; restaurantId: string }) {
  const [paketler, setPaketler] = useState<Paket[]>(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ad: '', toplam_seans: '10', gecerlilik_gun: '30', fiyat: '', hizmet_id: '' })
  const [showNew, setShowNew] = useState(false)

  const resetForm = () => setForm({ ad: '', toplam_seans: '10', gecerlilik_gun: '30', fiyat: '', hizmet_id: '' })

  const handleSave = useCallback(async () => {
    if (!form.ad || !form.toplam_seans || !form.gecerlilik_gun) return
    setSaving(true)
    const body = {
      restaurant_id: restaurantId,
      ad: form.ad,
      toplam_seans: parseInt(form.toplam_seans),
      gecerlilik_gun: parseInt(form.gecerlilik_gun),
      fiyat: form.fiyat ? parseFloat(form.fiyat) : null,
      hizmet_id: form.hizmet_id || null,
    }
    try {
      const res = await fetch('/api/panel/paketler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) return
      const data = await res.json()
      setPaketler(p => [data, ...p])
      setShowNew(false)
      resetForm()
    } finally {
      setSaving(false)
    }
  }, [form, restaurantId])

  const handleToggle = useCallback(async (id: string, aktif: boolean) => {
    const res = await fetch('/api/panel/paketler', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, aktif: !aktif }) })
    if (!res.ok) return
    setPaketler(p => p.map(x => x.id === id ? { ...x, aktif: !aktif } : x))
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch('/api/panel/paketler', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) return
    setPaketler(p => p.filter(x => x.id !== id))
  }, [])

  return (
    <div className="space-y-4">
      {/* Yeni Paket Butonu */}
      <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 text-sm font-semibold transition-all">
        <Plus size={16} /> Yeni Paket
      </button>

      {/* Yeni Paket Formu */}
      {showNew && (
        <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-stone-400 mb-1 block">Paket Adı</label>
              <input value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white" placeholder="10 Seans Paketi" />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Toplam Seans</label>
              <input type="number" min="1" value={form.toplam_seans} onChange={e => setForm(f => ({ ...f, toplam_seans: e.target.value }))} className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Geçerlilik (gün)</label>
              <input type="number" min="1" value={form.gecerlilik_gun} onChange={e => setForm(f => ({ ...f, gecerlilik_gun: e.target.value }))} className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Fiyat (opsiyonel)</label>
              <input type="number" min="0" step="0.01" value={form.fiyat} onChange={e => setForm(f => ({ ...f, fiyat: e.target.value }))} className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white" placeholder="₺" />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Hizmet (opsiyonel)</label>
              <select value={form.hizmet_id} onChange={e => setForm(f => ({ ...f, hizmet_id: e.target.value }))} className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">Seçilmedi</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.ad} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50">
              <Check size={14} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button onClick={() => { setShowNew(false); resetForm() }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-700 text-stone-300 text-sm hover:bg-stone-600 transition-all">
              <X size={14} /> İptal
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {paketler.length === 0 && !showNew && (
        <div className="text-center py-16 text-stone-500">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Henüz paket yok</p>
          <p className="text-xs mt-1 opacity-70">Yukarıdaki butondan ilk paketinizi oluşturun</p>
        </div>
      )}

      <div className="space-y-2">
        {paketler.map(p => (
          <div key={p.id} className={`bg-stone-800/30 border ${p.aktif ? 'border-stone-700' : 'border-stone-700/40'} rounded-xl p-4 flex items-center gap-4 transition-all ${!p.aktif ? 'opacity-50' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Package size={18} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm">{p.ad}</div>
              <div className="text-xs text-stone-400 mt-0.5">
                {p.toplam_seans} seans · {p.gecerlilik_gun} gün
                {p.fiyat ? ` · ₺${p.fiyat}` : ''}
                {p.hizmet_id ? ` · ${services.find(s => s.id === p.hizmet_id)?.name ?? '?'}` : ''}
              </div>
            </div>
            <button onClick={() => handleToggle(p.id, p.aktif)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${p.aktif ? 'bg-emerald-500/15 text-emerald-400' : 'bg-stone-700 text-stone-400'}`}>
              {p.aktif ? 'Aktif' : 'Pasif'}
            </button>
            <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all">
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
