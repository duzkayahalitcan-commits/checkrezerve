'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Option = { id: string; ad: string }

// OP-03: Telefonla gelen rezervasyonu panelden hızlı ekleme (POST /api/panel/reservations)
export default function YeniRezervasyon({ calisanlar, hizmetler, defaultOpen = false }: { calisanlar: Option[]; hizmetler: Option[]; defaultOpen?: boolean }) {
  const router = useRouter()
  const toast = useToast()
  const today = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD (yerel)
  const empty = { guest_name: '', guest_phone: '', party_size: '2', reserved_date: today, reserved_time: '', calisan_id: '', hizmet_id: '', notes: '' }
  const [open, setOpen] = useState(defaultOpen)
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [known, setKnown] = useState<string | null>(null)

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  // Mevcut müşteri: telefon girilince adı otomatik doldur
  async function lookup() {
    if (form.guest_phone.replace(/\D/g, '').length < 10) return
    const res = await fetch(`/api/panel/reservations?phone=${encodeURIComponent(form.guest_phone)}`).catch(() => null)
    const json = await res?.json().catch(() => null)
    const g = json?.guest
    if (g) {
      setKnown(`Kayıtlı müşteri · ${g.visits} ziyaret · son ${g.lastVisit}`)
      setForm(f => (f.guest_name ? f : { ...f, guest_name: g.name ?? '' }))
    } else {
      setKnown(null)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await fetch('/api/panel/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null)
    const json = await res?.json().catch(() => ({})) ?? {}
    setBusy(false)
    if (!res?.ok) { setError(json.error ?? 'Bağlantı hatası. Lütfen tekrar deneyin.'); return }
    toast.show('Rezervasyon eklendi', 'success')
    setOpen(false)
    setForm(empty)
    setKnown(null)
    router.refresh()
  }

  const input = 'w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]'
  const label = 'text-[11px] text-stone-400 font-semibold mb-1 block'

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
        <Plus size={16} /> Yeni Rezervasyon
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <form onSubmit={submit} className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl p-5 space-y-3" aria-label="Yeni rezervasyon">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Yeni rezervasyon</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="text-stone-400 hover:text-white"><X size={18} /></button>
            </div>
            <div>
              <label className={label} htmlFor="yr-tel">Telefon</label>
              <input id="yr-tel" className={input} inputMode="tel" placeholder="0 5XX XXX XX XX" value={form.guest_phone} onChange={set('guest_phone')} onBlur={lookup} required autoFocus />
              {known && <p className="text-[11px] text-emerald-400 mt-1">{known}</p>}
            </div>
            <div>
              <label className={label} htmlFor="yr-ad">Ad soyad</label>
              <input id="yr-ad" className={input} value={form.guest_name} onChange={set('guest_name')} required />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={label} htmlFor="yr-tarih">Tarih</label>
                <input id="yr-tarih" type="date" className={input} value={form.reserved_date} onChange={set('reserved_date')} required />
              </div>
              <div>
                <label className={label} htmlFor="yr-saat">Saat</label>
                <input id="yr-saat" type="time" step={300} className={input} value={form.reserved_time} onChange={set('reserved_time')} required />
              </div>
              <div>
                <label className={label} htmlFor="yr-kisi">Kişi</label>
                <input id="yr-kisi" type="number" min={1} max={100} className={input} value={form.party_size} onChange={set('party_size')} />
              </div>
            </div>
            {(hizmetler.length > 0 || calisanlar.length > 0) && (
              <div className="grid grid-cols-2 gap-2">
                {hizmetler.length > 0 && (
                  <div>
                    <label className={label} htmlFor="yr-hizmet">Hizmet</label>
                    <select id="yr-hizmet" className={input} value={form.hizmet_id} onChange={set('hizmet_id')}>
                      <option value="">—</option>
                      {hizmetler.map(h => <option key={h.id} value={h.id}>{h.ad}</option>)}
                    </select>
                  </div>
                )}
                {calisanlar.length > 0 && (
                  <div>
                    <label className={label} htmlFor="yr-calisan">Çalışan</label>
                    <select id="yr-calisan" className={input} value={form.calisan_id} onChange={set('calisan_id')}>
                      <option value="">—</option>
                      {calisanlar.map(c => <option key={c.id} value={c.id}>{c.ad}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className={label} htmlFor="yr-not">Not</label>
              <textarea id="yr-not" rows={2} className={input} value={form.notes} onChange={set('notes')} />
            </div>
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={busy}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold">
              {busy ? 'Kaydediliyor…' : 'Kaydet (onaylı)'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
