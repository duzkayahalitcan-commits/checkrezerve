'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight, LayoutGrid, Sofa } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

type Table = {
  id: string
  label: string
  capacity: number
  area_id: string | null
  x: number
  y: number
  width: number
  height: number
  shape: 'rect' | 'circle'
  is_active: boolean
}

type SpecialArea = {
  id: string
  name: string
  capacity: number
}

export default function TableManager({
  tables,
  areas,
  restaurantId,
}: {
  tables: Table[]
  areas: SpecialArea[]
  restaurantId: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [tab, setTab] = useState<'tables' | 'areas'>('tables')
  const [tableList, setTableList] = useState<Table[]>(tables)
  const [areaList, setAreaList] = useState<SpecialArea[]>(areas)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Table form
  const [tableForm, setTableForm] = useState({ label: '', capacity: '4', shape: 'rect' as 'rect' | 'circle', area_id: '' })

  // Area form
  const [areaForm, setAreaForm] = useState({ name: '', capacity: '10' })

  const supabase = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  // ─── Table CRUD ───

  async function saveTable(id?: string) {
    if (!tableForm.label.trim()) return
    const client = await supabase()
    const payload = {
      label: tableForm.label.trim(),
      capacity: Number(tableForm.capacity) || 4,
      shape: tableForm.shape,
      area_id: tableForm.area_id || null,
    }

    if (id) {
      const { error } = await client.from('tables').update(payload).eq('id', id)
      if (error) { toast.show('Güncellenemedi', 'error'); return }
      setTableList(prev => prev.map(t => t.id === id ? { ...t, ...payload } as Table : t))
      toast.show('Güncellendi', 'success')
    } else {
      const { data, error } = await client.from('tables').insert({ ...payload, restaurant_id: restaurantId }).select().single()
      if (error) { toast.show('Eklenemedi', 'error'); return }
      setTableList(prev => [...prev, data as Table])
      toast.show('Masa eklendi', 'success')
    }
    setEditing(null)
    setTableForm({ label: '', capacity: '4', shape: 'rect', area_id: '' })
    router.refresh()
  }

  async function deleteTable(id: string) {
    const client = await supabase()
    const { error } = await client.from('tables').delete().eq('id', id)
    if (error) { toast.show('Silinemedi', 'error'); return }
    setTableList(prev => prev.filter(t => t.id !== id))
    setDeleting(null)
    toast.show('Silindi', 'success')
    router.refresh()
  }

  async function toggleTableActive(t: Table) {
    const client = await supabase()
    const newVal = !t.is_active
    const { error } = await client.from('tables').update({ is_active: newVal }).eq('id', t.id)
    if (error) { toast.show('Güncellenemedi', 'error'); return }
    setTableList(prev => prev.map(x => x.id === t.id ? { ...x, is_active: newVal } : x))
    toast.show(newVal ? 'Aktif edildi' : 'Pasif edildi', 'success')
  }

  function startEditTable(t: Table) {
    setEditing(t.id)
    setTableForm({ label: t.label, capacity: String(t.capacity), shape: t.shape, area_id: t.area_id ?? '' })
  }

  // ─── Area CRUD ───

  async function saveArea(id?: string) {
    if (!areaForm.name.trim()) return
    const client = await supabase()
    const payload = { name: areaForm.name.trim(), capacity: Number(areaForm.capacity) || 10 }

    if (id) {
      const { error } = await client.from('special_areas').update(payload).eq('id', id)
      if (error) { toast.show('Güncellenemedi', 'error'); return }
      setAreaList(prev => prev.map(a => a.id === id ? { ...a, ...payload } : a))
      toast.show('Güncellendi', 'success')
    } else {
      const { data, error } = await client.from('special_areas').insert({ ...payload, restaurant_id: restaurantId }).select().single()
      if (error) { toast.show('Eklenemedi', 'error'); return }
      setAreaList(prev => [...prev, data as SpecialArea])
      toast.show('Alan eklendi', 'success')
    }
    setEditing(null)
    setAreaForm({ name: '', capacity: '10' })
    router.refresh()
  }

  async function deleteArea(id: string) {
    const client = await supabase()
    const { error } = await client.from('special_areas').delete().eq('id', id)
    if (error) { toast.show('Silinemedi', 'error'); return }
    setAreaList(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
    toast.show('Silindi', 'success')
    router.refresh()
  }

  function startEditArea(a: SpecialArea) {
    setEditing(a.id)
    setAreaForm({ name: a.name, capacity: String(a.capacity) })
  }

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1.5 bg-stone-900 border border-stone-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setTab('tables'); setEditing(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'tables' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <LayoutGrid size={14} /> Masalar
        </button>
        <button
          onClick={() => { setTab('areas'); setEditing(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'areas' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Sofa size={14} /> Alanlar
        </button>
      </div>

      {tab === 'tables' ? (
        /* ═══ TABLES ═══ */
        <div className="space-y-4">
          {/* Add table form */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={tableForm.label}
                onChange={e => setTableForm(f => ({ ...f, label: e.target.value }))}
                placeholder="Masa adı (örn. M1, M2, Bahçe 1)"
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <input
                type="number"
                min={1}
                value={tableForm.capacity}
                onChange={e => setTableForm(f => ({ ...f, capacity: e.target.value }))}
                placeholder="Kapasite"
                className="w-24 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
              <select
                value={tableForm.shape}
                onChange={e => setTableForm(f => ({ ...f, shape: e.target.value as 'rect' | 'circle' }))}
                className="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="rect">Dikdörtgen</option>
                <option value="circle">Yuvarlak</option>
              </select>
              <select
                value={tableForm.area_id}
                onChange={e => setTableForm(f => ({ ...f, area_id: e.target.value }))}
                className="bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Alan seç</option>
                {areaList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <button
                onClick={() => saveTable()}
                disabled={!tableForm.label.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <Plus size={15} /> Ekle
              </button>
            </div>
          </div>

          {/* Table list */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {tableList.map((t, i) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`bg-stone-900 border border-stone-800 rounded-xl p-4 ${deleting === t.id ? 'opacity-40' : ''} ${!t.is_active ? 'opacity-60' : ''}`}
                >
                  {editing === t.id ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input value={tableForm.label} onChange={e => setTableForm(f => ({ ...f, label: e.target.value }))}
                        className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                      <input type="number" value={tableForm.capacity} onChange={e => setTableForm(f => ({ ...f, capacity: e.target.value }))}
                        className="w-20 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                      <select value={tableForm.shape} onChange={e => setTableForm(f => ({ ...f, shape: e.target.value as 'rect' | 'circle' }))}
                        className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                        <option value="rect">Dikdörtgen</option>
                        <option value="circle">Yuvarlak</option>
                      </select>
                      <select value={tableForm.area_id} onChange={e => setTableForm(f => ({ ...f, area_id: e.target.value }))}
                        className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                        <option value="">Alan seç</option>
                        {areaList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => saveTable(t.id)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"><Check size={14} /></button>
                        <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition-colors"><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Shape icon */}
                        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${t.shape === 'circle' ? 'rounded-full' : 'rounded-lg'} bg-stone-800 border border-stone-700`}>
                          <LayoutGrid size={13} className="text-stone-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{t.label}</span>
                            <span className="text-[11px] text-stone-500">{t.capacity} kişi</span>
                            {t.area_id && areaList.find(a => a.id === t.area_id) && (
                              <span className="text-[11px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                                {areaList.find(a => a.id === t.area_id)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleTableActive(t)}
                          className={`p-2 rounded-lg transition-colors ${t.is_active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-stone-500 hover:text-white hover:bg-stone-800'}`}
                          title={t.is_active ? 'Pasif yap' : 'Aktif yap'}
                        >
                          {t.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        {!t.is_active && <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Pasif</span>}
                        <button onClick={() => startEditTable(t)} className="p-2 rounded-lg text-stone-500 hover:text-amber-400 hover:bg-stone-800 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleting(t.id)} className="p-2 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {tableList.length === 0 && (
                <div className="text-center py-12 bg-stone-900/50 border border-stone-800 rounded-2xl">
                  <p className="text-stone-400 font-semibold">Henüz masa eklenmemiş</p>
                  <p className="text-stone-600 text-sm mt-1">Yukarıdaki formu kullanarak masa ekleyebilirsiniz</p>
                </div>
              )}
            </div>
          </AnimatePresence>
        </div>
      ) : (
        /* ═══ AREAS ═══ */
        <div className="space-y-4">
          {/* Add area form */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={areaForm.name}
                onChange={e => setAreaForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Alan adı (örn. İç Mekan, Bahçe)"
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <input
                type="number"
                min={1}
                value={areaForm.capacity}
                onChange={e => setAreaForm(f => ({ ...f, capacity: e.target.value }))}
                placeholder="Kapasite"
                className="w-28 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                onClick={() => saveArea()}
                disabled={!areaForm.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <Plus size={15} /> Ekle
              </button>
            </div>
          </div>

          {/* Area list */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {areaList.map((a, i) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`bg-stone-900 border border-stone-800 rounded-xl p-4 ${deleting === a.id ? 'opacity-40' : ''}`}
                >
                  {editing === a.id ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input value={areaForm.name} onChange={e => setAreaForm(f => ({ ...f, name: e.target.value }))}
                        className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                      <input type="number" value={areaForm.capacity} onChange={e => setAreaForm(f => ({ ...f, capacity: e.target.value }))}
                        className="w-28 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                      <div className="flex gap-2">
                        <button onClick={() => saveArea(a.id)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"><Check size={14} /></button>
                        <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition-colors"><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center">
                          <Sofa size={13} className="text-stone-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm">{a.name}</span>
                          <span className="ml-2 text-[11px] text-stone-500">{a.capacity} kişi</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => startEditArea(a)} className="p-2 rounded-lg text-stone-500 hover:text-amber-400 hover:bg-stone-800 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleting(a.id)} className="p-2 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {areaList.length === 0 && (
                <div className="text-center py-12 bg-stone-900/50 border border-stone-800 rounded-2xl">
                  <p className="text-stone-400 font-semibold">Henüz alan eklenmemiş</p>
                  <p className="text-stone-600 text-sm mt-1">Alanlar, masaları gruplamak için kullanılır (İç Mekan, Bahçe vb.)</p>
                </div>
              )}
            </div>
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation modal */}
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
              <p className="text-white font-semibold mb-2">
                {tab === 'tables' ? 'Masayı sil' : 'Alanı sil'}
              </p>
              <p className="text-stone-400 text-sm mb-5">
                Bu işlem geri alınamaz.
                {tab === 'tables'
                  ? ` Silinecek: ${tableList.find(t => t.id === deleting)?.label}`
                  : ` Silinecek: ${areaList.find(a => a.id === deleting)?.name}`
                }
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleting(null)} className="flex-1 px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-sm font-medium hover:bg-stone-700 transition-colors">İptal</button>
                <button
                  onClick={() => tab === 'tables' ? deleteTable(deleting) : deleteArea(deleting)}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
