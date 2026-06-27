'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Trash2, X, Check, DollarSign, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

type Service = {
  id: string; ad: string; fiyat: number; sure_dakika?: number | null
  kategori?: string | null; renk?: string; aktif: boolean
}

const RENKLER = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#e11d48', '#ef4444',
  '#f97316', '#eab308', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
]

const KATEGORILER = ['Saç', 'Cilt', 'Tırnak', 'Makyaj', 'Spa', 'Bakım', 'Masaj', 'Diğer']

export default function ServiceManager({ services: initial, restaurantId }: { services: Service[]; restaurantId: string }) {
  const router = useRouter()
  const toast = useToast()
  const [services, setServices] = useState<Service[]>(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ ad: '', fiyat: '', sure_dakika: '', kategori: '', renk: '#6366f1' })

  async function save(id?: string) {
    if (!form.ad.trim()) return
    const payload = {
      ad: form.ad, fiyat: Number(form.fiyat) || 0,
      sure_dakika: form.sure_dakika ? Number(form.sure_dakika) : null,
      kategori: form.kategori || null, renk: form.renk,
    }
    try {
      const res = await fetch('/api/panel-tables', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { table: 'hizmetler', id, payload } : { table: 'hizmetler', payload }),
      })
      if (!res.ok) throw new Error()
      const data = id ? null : await res.json()
      if (id) setServices(prev => prev.map(s => s.id === id ? { ...s, ...payload } as Service : s))
      else if (data) setServices(prev => [...prev, data as Service])
      toast.show(id ? 'Güncellendi ✅' : 'Eklendi ✅', 'success')
      setEditing(null)
      setForm({ ad: '', fiyat: '', sure_dakika: '', kategori: '', renk: '#6366f1' })
      router.refresh()
    } catch { toast.show('Hata', 'error') }
  }

  async function remove(id: string) {
    try {
      await fetch('/api/panel-tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'hizmetler', id }),
      })
      setServices(prev => prev.filter(s => s.id !== id))
      setDeleting(null)
      toast.show('Silindi', 'success')
    } catch { toast.show('Silinemedi', 'error') }
  }

  async function toggleActive(s: Service) {
    const newVal = !s.aktif
    try {
      await fetch('/api/panel-tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'hizmetler', id: s.id, payload: { aktif: newVal } }),
      })
      setServices(prev => prev.map(x => x.id === s.id ? { ...x, aktif: newVal } : x))
    } catch { toast.show('Hata', 'error') }
  }

  function startEdit(s: Service) {
    setEditing(s.id)
    setForm({ ad: s.ad, fiyat: String(s.fiyat), sure_dakika: s.sure_dakika ? String(s.sure_dakika) : '', kategori: s.kategori ?? '', renk: s.renk ?? '#6366f1' })
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap gap-3">
          <input value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
            placeholder="Hizmet adı *" className="flex-[2] min-w-[140px] bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
          <input type="number" value={form.fiyat} onChange={e => setForm(f => ({ ...f, fiyat: e.target.value }))}
            placeholder="Fiyat" className="w-24 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
          <input type="number" value={form.sure_dakika} onChange={e => setForm(f => ({ ...f, sure_dakika: e.target.value }))}
            placeholder="Süre (dk)" className="w-28 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
          <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
            className="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#c9a84c] outline-none">
            <option value="">Kategori</option>
            {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <button onClick={() => save()} disabled={!form.ad.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c9a84c] hover:bg-amber-500 disabled:opacity-40 text-black text-sm font-semibold">
            <Plus size={15} /> Ekle
          </button>
        </div>
        {/* Renk seçici */}
        <div className="flex gap-1.5">
          {RENKLER.map(c => (
            <button key={c} onClick={() => setForm(f => ({ ...f, renk: c }))}
              className={`w-6 h-6 rounded-full transition-all ${form.renk === c ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-900 scale-110' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Service list */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-2">
          {services.map((s, i) => (
            <motion.div key={s.id} layout
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className={`bg-stone-900 border border-stone-800 rounded-xl p-4 ${deleting === s.id ? 'opacity-40' : ''}`}
            >
              {editing === s.id ? (
                <div className="flex flex-wrap gap-3">
                  <input value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
                    className="flex-[2] min-w-[120px] bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#c9a84c] outline-none" />
                  <input type="number" value={form.fiyat} onChange={e => setForm(f => ({ ...f, fiyat: e.target.value }))}
                    className="w-20 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#c9a84c] outline-none" />
                  <input type="number" value={form.sure_dakika} onChange={e => setForm(f => ({ ...f, sure_dakika: e.target.value }))}
                    className="w-24 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#c9a84c] outline-none" />
                  <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
                    className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                    <option value="">Kategori</option>
                    {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <div className="flex gap-1">
                    {RENKLER.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, renk: c }))}
                        className={`w-5 h-5 rounded-full ${form.renk === c ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => save(s.id)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Check size={14} /></button>
                    <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-stone-800 text-stone-400"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.renk ?? '#6366f1' }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">{s.ad}</span>
                        {s.kategori && <span className="text-[10px] text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">{s.kategori}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="flex items-center gap-1"><DollarSign size={10} />{s.fiyat.toLocaleString()} ₺</span>
                        {s.sure_dakika && <span className="flex items-center gap-1"><Clock size={10} />{s.sure_dakika} dk</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggleActive(s)} className={`p-2 rounded-lg ${s.aktif ? 'text-emerald-400' : 'text-stone-500'}`}>
                      {s.aktif ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button onClick={() => startEdit(s)} className="p-2 rounded-lg text-stone-500 hover:text-[#c9a84c]"><Pencil size={13} /></button>
                    <button onClick={() => setDeleting(s.id)} className="p-2 rounded-lg text-stone-500 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleting && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDeleting(null)}>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
              <p className="text-white font-semibold mb-2">Hizmeti sil</p>
              <p className="text-stone-400 text-sm mb-5">Silinecek: <strong className="text-white">{services.find(s => s.id === deleting)?.ad}</strong></p>
              <div className="flex gap-3">
                <button onClick={() => setDeleting(null)} className="flex-1 px-4 py-2 rounded-xl bg-stone-800 text-stone-300">İptal</button>
                <button onClick={() => remove(deleting)} className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400">Sil</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
