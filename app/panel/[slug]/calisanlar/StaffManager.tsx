'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Staff = {
  id: string
  ad: string
  telefon?: string | null
  pozisyon?: string | null
  aktif: boolean
  created_at?: string
}

export default function StaffManager({ staff, restaurantId }: { staff: Staff[]; restaurantId: string }) {
  const toast = useToast()
  const [list, setList] = useState<Staff[]>(staff)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ ad: '', telefon: '', pozisyon: '' })

  const supabase = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  async function save(id?: string) {
    if (!form.ad.trim()) return
    const client = await supabase()
    if (id) {
      const { error } = await client.from('staff').update({ ad: form.ad, telefon: form.telefon || null, pozisyon: form.pozisyon || null }).eq('id', id)
      if (error) { toast.show('Güncellenemedi', 'error'); return }
      setList(prev => prev.map(s => s.id === id ? { ...s, ad: form.ad, telefon: form.telefon, pozisyon: form.pozisyon } : s))
      toast.show('Güncellendi', 'success')
    } else {
      const { data, error } = await client.from('staff').insert({ restaurant_id: restaurantId, ad: form.ad, telefon: form.telefon || null, pozisyon: form.pozisyon || null }).select().single()
      if (error) { toast.show('Eklenemedi', 'error'); return }
      setList(prev => [...prev, data as Staff])
      toast.show('Eklendi', 'success')
    }
    setEditing(null)
    setForm({ ad: '', telefon: '', pozisyon: '' })
  }

  async function remove(id: string) {
    const client = await supabase()
    const { error } = await client.from('staff').delete().eq('id', id)
    if (error) { toast.show('Silinemedi', 'error'); return }
    setList(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
    toast.show('Silindi', 'success')
  }

  async function toggleActive(s: Staff) {
    const client = await supabase()
    const newVal = !s.aktif
    const { error } = await client.from('staff').update({ aktif: newVal }).eq('id', s.id)
    if (error) { toast.show('Güncellenemedi', 'error'); return }
    setList(prev => prev.map(x => x.id === s.id ? { ...x, aktif: newVal } : x))
    toast.show(newVal ? 'Aktif edildi' : 'Pasif edildi', 'success')
  }

  function startEdit(s: Staff) {
    setEditing(s.id)
    setForm({ ad: s.ad, telefon: s.telefon ?? '', pozisyon: s.pozisyon ?? '' })
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={form.ad}
            onChange={e => setForm(f => ({ ...f, ad: e.target.value }))}
            placeholder="Ad Soyad"
            className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <input
            value={form.telefon}
            onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))}
            placeholder="Telefon (opsiyonel)"
            className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <input
            value={form.pozisyon}
            onChange={e => setForm(f => ({ ...f, pozisyon: e.target.value }))}
            placeholder="Pozisyon"
            className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
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

      {/* Staff list */}
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
              className={`bg-stone-900 border border-stone-800 rounded-xl p-4 transition-all ${deleting === s.id ? 'opacity-40' : ''}`}
            >
              {editing === s.id ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <input value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <input value={form.pozisyon} onChange={e => setForm(f => ({ ...f, pozisyon: e.target.value }))} className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <div className="flex gap-2">
                    <button onClick={() => save(s.id)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"><Check size={14} /></button>
                    <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition-colors"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar placeholder */}
                    <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {s.ad.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">{s.ad}</span>
                        {s.pozisyon && <span className="text-[11px] text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full whitespace-nowrap">{s.pozisyon}</span>}
                      </div>
                      {s.telefon && <p className="text-xs text-stone-500 mt-0.5">{s.telefon}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`p-2 rounded-lg transition-colors ${s.aktif ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-stone-500 hover:text-white hover:bg-stone-800'}`}
                      title={s.aktif ? 'Pasif yap' : 'Aktif yap'}
                    >
                      {s.aktif ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
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
              <p className="text-white font-semibold mb-2">Çalışanı sil</p>
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
