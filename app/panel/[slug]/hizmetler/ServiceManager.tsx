'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Trash2, X, Check, DollarSign, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Service = {
  id: string
  ad: string
  fiyat: number
  sure?: number | null
  aktif: boolean
  created_at?: string
}

async function apiCall(method: string, body: object) {
  const res = await fetch('/api/panel-tables', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('İşlem başarısız')
  return res.json()
}

export default function ServiceManager({ services, restaurantId }: { services: Service[]; restaurantId: string }) {
  const toast = useToast()
  const [list, setList] = useState<Service[]>(services)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ ad: '', fiyat: '', sure: '' })

  async function save(id?: string) {
    if (!form.ad.trim()) return
    const payload = { ad: form.ad, fiyat: Number(form.fiyat) || 0, sure: form.sure ? Number(form.sure) : null }

    if (id) {
      try {
        await apiCall('PATCH', { table: 'services', id, payload })
        setList(prev => prev.map(s => s.id === id ? { ...s, ...payload } as Service : s))
        toast.show('Güncellendi', 'success')
      } catch { toast.show('Güncellenemedi', 'error'); return }
    } else {
      try {
        const { data } = await apiCall('POST', { table: 'services', payload })
        setList(prev => [...prev, data as Service])
        toast.show('Eklendi', 'success')
      } catch { toast.show('Eklenemedi', 'error'); return }
    }
    setEditing(null)
    setForm({ ad: '', fiyat: '', sure: '' })
  }

  async function remove(id: string) {
    try {
      await apiCall('DELETE', { table: 'services', id })
      setList(prev => prev.filter(s => s.id !== id))
      setDeleting(null)
      toast.show('Silindi', 'success')
    } catch { toast.show('Silinemedi', 'error') }
  }

  async function toggleActive(s: Service) {
    const newVal = !s.aktif
    try {
      await apiCall('PATCH', { table: 'services', id: s.id, payload: { aktif: newVal } })
      setList(prev => prev.map(x => x.id === s.id ? { ...x, aktif: newVal } : x))
      toast.show(newVal ? 'Aktif edildi' : 'Pasif edildi', 'success')
    } catch { toast.show('Güncellenemedi', 'error') }
  }

  function startEdit(s: Service) {
    setEditing(s.id)
    setForm({ ad: s.ad, fiyat: String(s.fiyat), sure: s.sure ? String(s.sure) : '' })
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={form.ad}
            onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
            placeholder="Hizmet adı"
            className="flex-[2] bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <div className="flex items-center gap-1">
            <DollarSign size={14} className="text-stone-500" />
            <input
              type="number"
              min={0}
              value={form.fiyat}
              onChange={e => setForm(f => ({ ...f, fiyat: e.target.value }))}
              placeholder="Fiyat"
              className="w-24 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <input
            type="number"
            min={0}
            value={form.sure}
            onChange={e => setForm(f => ({ ...f, sure: e.target.value }))}
            placeholder="Süre (dk)"
            className="w-28 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            onClick={() => save()}
            disabled={!form.ad.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Plus size={15} /> Ekle
          </button>
        </div>
      </div>

      {/* Service list */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-2">
          {list.map((s, i) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className={`bg-stone-900 border border-stone-800 rounded-xl p-4 ${deleting === s.id ? 'opacity-40' : ''}`}
            >
              {editing === s.id ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} className="flex-[2] bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <input type="number" value={form.fiyat} onChange={e => setForm(f => ({ ...f, fiyat: e.target.value }))} className="w-24 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <input type="number" value={form.sure} onChange={e => setForm(f => ({ ...f, sure: e.target.value }))} className="w-28 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <div className="flex gap-2">
                    <button onClick={() => save(s.id)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"><Check size={14} /></button>
                    <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition-colors"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{s.ad}</span>
                      {s.sure && (
                        <span className="flex items-center gap-1 text-[11px] text-stone-500">
                          <Clock size={11} /> {s.sure} dk
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-emerald-400">{s.fiyat.toLocaleString()} ₺</span>
                    <button
                      onClick={() => toggleActive(s)}
                      className={`p-2 rounded-lg transition-colors ${s.aktif ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-stone-500 hover:text-white hover:bg-stone-800'}`}
                      title={s.aktif ? 'Pasif yap' : 'Aktif yap'}
                    >
                      {s.aktif ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    {!s.aktif && <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Pasif</span>}
                    <button onClick={() => startEdit(s)} className="p-2 rounded-lg text-stone-500 hover:text-amber-400 hover:bg-stone-800 transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => setDeleting(s.id)} className="p-2 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"><Trash2 size={13} /></button>
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setDeleting(null)}
          >
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
              <p className="text-white font-semibold mb-2">Hizmeti sil</p>
              <p className="text-stone-400 text-sm mb-5">Bu işlem geri alınamaz. Silinecek: <strong className="text-white">{list.find(s => s.id === deleting)?.ad}</strong></p>
              <div className="flex gap-3">
                <button onClick={() => setDeleting(null)} className="flex-1 px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-sm font-medium hover:bg-stone-700 transition-colors">İptal</button>
                <button onClick={() => remove(deleting)} className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-colors">Sil</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
