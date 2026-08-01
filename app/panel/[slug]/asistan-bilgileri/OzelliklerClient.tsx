'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Check, X, Info, Loader2, MessageSquare } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Durum = 'var' | 'yok' | 'bilgi_al'

interface FeatureDef {
  kod: string
  baslik: string
  sektor: string
  durum: Durum
  notu: string | null
}

interface UnknownQ {
  id: string
  user_message: string
  created_at: string
}

const DURUM_META: Record<Durum, { label: string; icon: React.ReactNode; on: string; off: string }> = {
  var:      { label: 'Var', icon: <Check size={14} />, on: 'bg-green-500 text-white border-green-500', off: 'bg-stone-800 text-stone-500 border-stone-700 hover:border-stone-500' },
  yok:      { label: 'Yok', icon: <X size={14} />, on: 'bg-red-500 text-white border-red-500', off: 'bg-stone-800 text-stone-500 border-stone-700 hover:border-stone-500' },
  bilgi_al: { label: 'Bilgi Al', icon: <Info size={14} />, on: 'bg-stone-500 text-white border-stone-500', off: 'bg-stone-800 text-stone-500 border-stone-700 hover:border-stone-500' },
}

export default function OzelliklerClient({
  restaurantId,
  businessType,
}: {
  restaurantId: string
  businessType: string
}) {
  const [features, setFeatures] = useState<FeatureDef[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unknowns, setUnknowns] = useState<UnknownQ[]>([])
  const [replyTarget, setReplyTarget] = useState<UnknownQ | null>(null)
  const [replyText, setReplyText] = useState('')

  const toast = useToast()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSaved = useRef<string>('')

  // ─── Verileri yükle ────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/panel/ozellikler?restaurant_id=${restaurantId}`)
      const json = await res.json()
      if (res.ok && Array.isArray(json.definitions)) {
        setFeatures(json.definitions)
      } else {
        setFeatures([])
        setError('Özellik tablosu bulunamadı. Lütfen migration SQL dosyasını Supabase SQL Editor\'de çalıştırın.')
      }
    } catch {
      setFeatures([])
      setError('Veri yüklenemedi.')
    }
    // Cevaplanamayan sorular
    try {
      const r2 = await fetch(`/api/panel/ozellikler/unknown?restaurant_id=${restaurantId}`)
      const j2 = await r2.json()
      if (Array.isArray(j2)) setUnknowns(j2)
    } catch { /* sessizce */ }
    setLoading(false)
  }, [restaurantId])

  useEffect(() => { load() }, [load])

  // ─── Durum değiştir + debounce kaydet ──────────────────────────
  function setDurum(kod: string, durum: Durum) {
    setFeatures(prev => prev ? prev.map(f => f.kod === kod ? { ...f, durum } : f) : prev)
    scheduleSave()
  }
  function setNotu(kod: string, notu: string) {
    setFeatures(prev => prev ? prev.map(f => f.kod === kod ? { ...f, notu } : f) : prev)
    scheduleSave()
  }

  function scheduleSave() {
    setSaving(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => doSave(), 800)
  }

  async function doSave(manual = false) {
    if (!features) return
    // Sadece seçilmiş (var/yok) veya notu dolu olanları gönder
    const items = features
      .filter(f => f.durum !== 'bilgi_al' || (f.notu && f.notu.trim()))
      .map(f => ({ ozellik_kodu: f.kod, durum: f.durum, notu: f.notu?.trim() || null }))

    const payload = JSON.stringify({ restaurant_id: restaurantId, items })

    // Payload değişmemişse ve otomatik kayıttan geldiyse sessizce atla.
    // Manuel (Şimdi Kaydet) basıldıysa kullanıcıya geri bildirim ver.
    if (payload === lastSaved.current) {
      setSaving(false)
      if (manual) toast.show(items.length === 0 ? 'Kaydedilecek değişiklik yok' : 'Kayıtlar güncel', 'info')
      return
    }
    lastSaved.current = payload

    try {
      const res = await fetch('/api/panel/ozellikler', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: payload })
      const json = await res.json()
      if (res.ok && (!json.errors || json.errors.length === 0)) {
        setSavedAt(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }))
        setError(null)
        if (manual) toast.show('Özellikler kaydedildi ✓', 'success')
      } else {
        const msg = json.errors?.length ? json.errors.join('; ') : (json.error ?? 'Kaydetme hatası')
        setError(msg)
        if (manual) toast.show(msg, 'error')
      }
    } catch {
      setError('Kaydetme başarısız.')
      if (manual) toast.show('Kaydetme başarısız.', 'error')
    }
    setSaving(false)
  }

  // ─── Yanıt gönder (Bölüm D) ────────────────────────────────────
  async function submitReply() {
    if (!replyTarget || !replyText.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/panel/ozellikler/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId, conversation_id: replyTarget.id, answer: replyText.trim() }),
      })
      const json = await res.json()
      if (res.ok) {
        setReplyTarget(null)
        setReplyText('')
        toast.show('Yanıt kaydedildi ✓', 'success')
        load()
      } else {
        const msg = json.error ?? 'Yanıt kaydedilemedi'
        setError(msg)
        toast.show(msg, 'error')
      }
    } catch {
      setError('Yanıt kaydedilemedi.')
      toast.show('Yanıt kaydedilemedi.', 'error')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-stone-500">
        <Loader2 size={20} className="animate-spin mr-2" /> Yükleniyor...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Kayıt durumu */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>{error ? <span className="text-amber-400">{error}</span> : `Otomatik kayıt açık${savedAt ? ` · Son kayıt ${savedAt}` : ''}${saving ? ' · kaydediliyor...' : ''}`}</span>
        <button onClick={() => doSave(true)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500">
          Şimdi Kaydet
        </button>
      </div>

      {/* Özellik listesi */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-800">
          <h2 className="text-sm font-bold text-white">İşletme Özellikleri</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {businessType ? `${businessType} sektörü için ortak + sektörel özellikler` : 'Ortak özellikler'} — asistan yalnızca bu bilgileri kullanır, asla uydurmaz.
          </p>
        </div>
        <div className="divide-y divide-stone-800/60">
          {(features ?? []).map(f => {
            const m = DURUM_META[f.durum]
            return (
              <div key={f.kod} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-white font-medium">{f.baslik}</span>
                  <div className="flex items-center gap-1.5">
                    {(Object.keys(DURUM_META) as Durum[]).map(d => {
                      const mm = DURUM_META[d]
                      const active = f.durum === d
                      return (
                        <button
                          key={d}
                          onClick={() => setDurum(f.kod, d)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${active ? mm.on : mm.off}`}
                        >
                          {mm.icon}{mm.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <input
                  value={f.notu ?? ''}
                  onChange={(e) => setNotu(f.kod, e.target.value)}
                  disabled={f.durum === 'bilgi_al' && !f.notu}
                  placeholder={f.durum === 'bilgi_al' && !f.notu ? 'Önce bir durum seçin' : 'Ek bilgi — örn: Otopark binanın arkasında, ücretsiz'}
                  className="mt-2 w-full text-xs bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
                />
              </div>
            )
          })}
          {(features ?? []).length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-stone-500">
              Gösterilecek özellik bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* ── Bölüm D: Cevaplanamayan Sorular ─────────────────────── */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2"><MessageSquare size={15} /> Cevaplanamayan Sorular</h2>
          <p className="text-xs text-stone-500 mt-0.5">Asistanın cevaplayamadığı son sorular — yanıtlayarak bilgi tabanına ekleyin.</p>
        </div>
        <div className="divide-y divide-stone-800/60">
          {unknowns.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-stone-500">Yanıtlanmamış soru yok. 🎉</div>
          )}
          {unknowns.map(u => (
            <div key={u.id} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-white line-clamp-2">&ldquo;{u.user_message}&rdquo;</p>
                <p className="text-xs text-stone-600 mt-0.5">
                  {new Date(u.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={() => { setReplyTarget(u); setReplyText('') }}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
              >
                Yanıtla
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Yanıt modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setReplyTarget(null) }}>
          <div className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">Soruyu Yanıtla</h3>
            <p className="text-xs text-stone-500 mb-3">&ldquo;{replyTarget.user_message}&rdquo;</p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              placeholder="İşletme olarak doğru cevabı yazın. Bu bilgi asistan bilgi tabanına eklenir."
              className="w-full text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white placeholder-stone-600 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center justify-end gap-2 mt-3">
              <button onClick={() => setReplyTarget(null)} className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-white">Vazgeç</button>
              <button onClick={submitReply} disabled={saving || !replyText.trim()} className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-40">
                {saving ? 'Kaydediliyor...' : 'Kaydet & Yanıtla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
