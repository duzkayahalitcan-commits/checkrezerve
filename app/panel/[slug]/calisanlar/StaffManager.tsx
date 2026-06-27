'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Pencil, X, Check, ToggleLeft, ToggleRight, Clock, Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

type Staff = {
  id: string; ad: string; soyad?: string | null
  telefon?: string | null; email?: string | null; pozisyon?: string | null
  aktif: boolean
}

type Service = { id: string; ad: string; renk?: string }

export default function StaffManager({ staff: initial, restaurantId }: { staff: Staff[]; restaurantId: string }) {
  const router = useRouter()
  const toast = useToast()
  const [staff, setStaff] = useState<Staff[]>(initial)
  const [selected, setSelected] = useState<Staff | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staffServices, setStaffServices] = useState<string[]>([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newForm, setNewForm] = useState({ ad: '', soyad: '', telefon: '', email: '', pozisyon: '' })

  // Hizmetleri yükle + seçili çalışanın hizmetleri
  async function loadServices(staffId?: string) {
    const [sRes, joinRes] = await Promise.all([
      fetch(`/api/panel-tables?table=hizmetler&restaurant_id=${restaurantId}`).then(r => r.json()),
      staffId ? fetch(`/api/panel-tables?table=calisan_hizmetler&calisan_id=${staffId}`).then(r => r.json()) : Promise.resolve([]),
    ])
    setServices(Array.isArray(sRes) ? sRes : [])
    setStaffServices(Array.isArray(joinRes) ? joinRes.map((j: { hizmet_id: string }) => j.hizmet_id) : [])
  }

  function openDetail(s: Staff) {
    setSelected(s)
    loadServices(s.id)
  }

  async function saveStaff() {
    setSaving(true)
    const payload = {
      ad: newForm.ad, soyad: newForm.soyad || null,
      telefon: newForm.telefon || null, email: newForm.email || null,
      pozisyon: newForm.pozisyon || null,
    }
    try {
      const res = await fetch('/api/panel-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'calisanlar', payload }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStaff(prev => [...prev, data as Staff])
      toast.show('Çalışan eklendi ✅', 'success')
      setShowNewForm(false)
      setNewForm({ ad: '', soyad: '', telefon: '', email: '', pozisyon: '' })
      router.refresh()
    } catch {
      toast.show('Eklenemedi', 'error')
    }
    setSaving(false)
  }

  async function updateStaff(id: string, payload: Partial<Staff>) {
    try {
      const res = await fetch('/api/panel-tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'calisanlar', id, payload }),
      })
      if (!res.ok) throw new Error()
      setStaff(prev => prev.map(s => s.id === id ? { ...s, ...payload } : s))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...payload } : null)
      toast.show('Güncellendi ✅', 'success')
    } catch { toast.show('Güncellenemedi', 'error') }
  }

  async function toggleService(serviceId: string) {
    const has = staffServices.includes(serviceId)
    const method = has ? 'DELETE' : 'POST'
    try {
      const res = await fetch('/api/panel-tables', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'calisan_hizmetler',
          payload: { calisan_id: selected!.id, hizmet_id: serviceId },
          id: has ? `${selected!.id}_${serviceId}` : undefined,
        }),
      })
      if (!res.ok) throw new Error()
      setStaffServices(prev => has ? prev.filter(id => id !== serviceId) : [...prev, serviceId])
    } catch { toast.show('Hata', 'error') }
  }

  // Çalışma saatleri
  const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  const [hours, setHours] = useState<Record<string, { acik: boolean; baslangic: string; bitis: string }>>({})

  async function saveHours() {
    if (!selected) return
    setSaving(true)
    try {
      await Promise.all(
        DAYS.map(async (_, gun) => {
          const h = hours[gun] ?? { acik: true, baslangic: '09:00', bitis: '18:00' }
          await fetch('/api/panel-tables', {
            method: 'upsert' as string === 'upsert' ? 'POST' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: 'calisan_saatler',
              payload: { calisan_id: selected.id, gun, ...h },
            }),
          }).catch(() => {})
        })
      )
      toast.show('Çalışma saatleri kaydedildi ✅', 'success')
    } catch { toast.show('Hata', 'error') }
    setSaving(false)
  }

  const fullName = (s: Staff) => `${s.ad}${s.soyad ? ' ' + s.soyad : ''}`
  const initials = (s: Staff) => (s.ad.charAt(0) + (s.soyad?.charAt(0) ?? '')).toUpperCase()

  return (
    <div className="flex gap-6">
      {/* ─── Sol: Çalışan Listesi ───────────────────────────────────────── */}
      <div className="flex-1 space-y-4">
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a84c] hover:bg-amber-500 text-black text-sm font-semibold transition-all"
        >
          <Plus size={15} /> Yeni Çalışan
        </button>

        {/* Yeni çalışan formu */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <input value={newForm.ad} onChange={e => setNewForm(f => ({ ...f, ad: e.target.value }))}
                  placeholder="Ad *" className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
                <input value={newForm.soyad} onChange={e => setNewForm(f => ({ ...f, soyad: e.target.value }))}
                  placeholder="Soyad" className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
                <input value={newForm.telefon} onChange={e => setNewForm(f => ({ ...f, telefon: e.target.value }))}
                  placeholder="Telefon" className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
                <input value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="E-posta" className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
                <input value={newForm.pozisyon} onChange={e => setNewForm(f => ({ ...f, pozisyon: e.target.value }))}
                  placeholder="Ünvan" className="col-span-2 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNewForm(false)} className="px-4 py-2 rounded-xl text-stone-400 text-sm hover:text-white">İptal</button>
                <button onClick={saveStaff} disabled={saving || !newForm.ad}
                  className="px-4 py-2 rounded-xl bg-[#c9a84c] text-black text-sm font-semibold disabled:opacity-40">Kaydet</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kart grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {staff.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => openDetail(s)}
              className={`bg-stone-900 border rounded-2xl p-4 text-left transition-all hover:border-stone-600 ${
                selected?.id === s.id ? 'border-[#c9a84c] ring-1 ring-[#c9a84c]' : 'border-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d2e1c] to-stone-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {initials(s)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{fullName(s)}</p>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    {s.pozisyon && <span className="flex items-center gap-1"><Briefcase size={10} />{s.pozisyon}</span>}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); updateStaff(s.id, { aktif: !s.aktif }) }}
                  className={`p-1.5 rounded-lg ${s.aktif ? 'text-emerald-400' : 'text-stone-500'}`}
                >
                  {s.aktif ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ─── Sağ: Slide-over Detay ──────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="w-96 shrink-0 bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-5 max-h-[calc(100vh-12rem)] overflow-y-auto sticky top-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d2e1c] to-stone-700 flex items-center justify-center text-white text-sm font-bold">{initials(selected)}</div>
                <div>
                  <h2 className="font-bold text-white text-sm">{fullName(selected)}</h2>
                  {selected.pozisyon && <p className="text-xs text-stone-500">{selected.pozisyon}</p>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-stone-500 hover:text-white p-1"><X size={16} /></button>
            </div>

            {/* Bilgiler */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">İletişim</h3>
              <input defaultValue={selected.telefon ?? ''} onBlur={e => updateStaff(selected.id, { telefon: e.target.value || null })}
                placeholder="Telefon" className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
              <input defaultValue={selected.email ?? ''} onBlur={e => updateStaff(selected.id, { email: e.target.value || null })}
                placeholder="E-posta" className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
              <input defaultValue={selected.pozisyon ?? ''} onBlur={e => updateStaff(selected.id, { pozisyon: e.target.value || null })}
                placeholder="Ünvan" className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#c9a84c] outline-none" />
            </div>

            {/* Hizmet seçimi */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Hizmetler</h3>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {services.map(s => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={staffServices.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                      className="w-4 h-4 rounded border-stone-600 text-[#c9a84c] focus:ring-[#c9a84c] bg-stone-800"
                    />
                    <span className="text-xs text-stone-300">{s.ad}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Çalışma saatleri */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} /> Çalışma Saatleri
              </h3>
              {DAYS.map((day, gun) => {
                const h = hours[gun] ?? { acik: true, baslangic: '09:00', bitis: '18:00' }
                return (
                  <div key={gun} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-stone-400">{day.slice(0, 3)}</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={h.acik} onChange={() => setHours(prev => ({ ...prev, [gun]: { ...h, acik: !h.acik } }))}
                        className="w-3.5 h-3.5 rounded border-stone-600 text-[#c9a84c] bg-stone-800" />
                    </label>
                    {h.acik && (
                      <div className="flex items-center gap-1 ml-auto">
                        <input type="time" value={h.baslangic} onChange={e => setHours(prev => ({ ...prev, [gun]: { ...h, baslangic: e.target.value } }))}
                          className="w-20 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-white outline-none" />
                        <span className="text-stone-600">—</span>
                        <input type="time" value={h.bitis} onChange={e => setHours(prev => ({ ...prev, [gun]: { ...h, bitis: e.target.value } }))}
                          className="w-20 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-white outline-none" />
                      </div>
                    )}
                  </div>
                )
              })}
              <button onClick={saveHours} disabled={saving}
                className="w-full mt-2 px-3 py-2 rounded-xl bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold hover:bg-[#c9a84c]/30 transition-all">
                {saving ? 'Kaydediliyor...' : 'Saatleri Kaydet'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
