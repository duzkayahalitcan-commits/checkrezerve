'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Upload, FileText, Image as ImageIcon, Loader2, Trash2,
  Check, X, Sparkles, AlertTriangle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

type MenuItem = { ad: string; fiyat: string; sure_dakika: string }

type ParseResponse = { items: Array<{ ad: string; fiyat: number | null; sure_dakika: number | null }> }

export default function MenuUpload() {
  const router = useRouter()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [busy, setBusy] = useState<'idle' | 'uploading' | 'parsing' | 'saving'>('idle')
  const [fileName, setFileName] = useState<string>('')
  const [preview, setPreview] = useState<MenuItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setPreview(null)
    setFileName('')
    setError(null)
    setBusy('idle')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setBusy('uploading')
    setFileName(file.name)

    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/menu/parse', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Parse hatası')
      const parsed = data as ParseResponse
      if (!parsed.items || parsed.items.length === 0) {
        throw new Error('Dosyadan hizmet çıkarılamadı. Menü formatını kontrol edin.')
      }
      setPreview(parsed.items.map(it => ({
        ad: it.ad ?? '',
        fiyat: it.fiyat != null ? String(it.fiyat) : '',
        sure_dakika: it.sure_dakika != null ? String(it.sure_dakika) : '',
      })))
      setBusy('idle')
      toast.show(`${parsed.items.length} hizmet bulundu`, 'success')
    } catch (err) {
      setBusy('idle')
      setError(err instanceof Error ? err.message : 'Dosya işlenirken hata oluştu')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function update(i: number, key: keyof MenuItem, value: string) {
    setPreview(prev => prev ? prev.map((row, idx) => idx === i ? { ...row, [key]: value } : row) : prev)
  }

  function removeRow(i: number) {
    setPreview(prev => prev ? prev.filter((_, idx) => idx !== i) : prev)
  }

  async function save() {
    if (!preview) return
    const valid = preview.filter(r => r.ad.trim())
    if (valid.length === 0) { toast.show('Kaydedilecek hizmet yok', 'error'); return }
    setBusy('saving')
    try {
      const res = await fetch('/api/menu/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: valid.map(r => ({
            ad: r.ad.trim(),
            fiyat: r.fiyat ? Number(r.fiyat) : null,
            sure_dakika: r.sure_dakika ? Number(r.sure_dakika) : null,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Kayıt hatası')
      toast.show(`${data.inserted ?? valid.length} hizmet kaydedildi ✅`, 'success')
      reset()
      router.refresh()
    } catch (err) {
      setBusy('idle')
      setError(err instanceof Error ? err.message : 'Kayıt sırasında hata oluştu')
      toast.show('Kayıt hatası', 'error')
    }
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
      {/* Header + upload button */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#c9a84c]/15 text-[#c9a84c] flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Menü / Fiyat Listesi Yükle</h3>
            <p className="text-[11px] text-stone-500">PDF, JPG veya PNG yükleyin, otomatik hizmet listesi çıkarın</p>
          </div>
        </div>
        {preview === null && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy !== 'idle'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c9a84c] hover:bg-amber-500 disabled:opacity-40 text-black text-sm font-semibold"
          >
            {busy === 'uploading' || busy === 'parsing'
              ? <Loader2 size={15} className="animate-spin" />
              : <Upload size={15} />}
            {busy === 'uploading' ? 'Yükleniyor…' : busy === 'parsing' ? 'Ayrıştırılıyor…' : 'Dosya Yükle'}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={onFile}
      />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mx-5 mb-4"
          >
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{fileName ? `"${fileName}" işlenemedi` : 'Hata'}</p>
                <p className="text-xs mt-0.5 text-red-400/80">{error}</p>
                <button onClick={reset} className="text-xs underline mt-1.5 text-red-300 hover:text-white">Yeni dosya dene</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview table */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="px-5 pb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-400 flex items-center gap-2">
                {fileName.endsWith('.pdf') ? <FileText size={13} /> : <ImageIcon size={13} />}
                <span className="font-medium text-stone-300">{fileName}</span>
                <span className="text-stone-600">· {preview.length} hizmet</span>
              </p>
              <button onClick={reset} className="text-xs text-stone-500 hover:text-stone-300 flex items-center gap-1">
                <X size={13} /> İptal
              </button>
            </div>

            <div className="border border-stone-800 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_90px_90px_36px] gap-2 items-center px-3 py-2.5 bg-stone-800/60 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                <span>Hizmet adı</span>
                <span>Fiyat (₺)</span>
                <span>Süre (dk)</span>
                <span />
              </div>
              <div className="divide-y divide-stone-800/70 max-h-[320px] overflow-y-auto">
                {preview.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_90px_90px_36px] gap-2 items-center px-3 py-2">
                    <input
                      value={row.ad}
                      onChange={e => update(i, 'ad', e.target.value)}
                      placeholder="Hizmet adı"
                      className="w-full bg-transparent text-sm text-white placeholder-stone-600 outline-none focus:text-white"
                    />
                    <input
                      type="number" value={row.fiyat}
                      onChange={e => update(i, 'fiyat', e.target.value)}
                      placeholder="—"
                      className="w-full bg-stone-800/50 border border-stone-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-stone-600 outline-none focus:border-[#c9a84c]"
                    />
                    <input
                      type="number" value={row.sure_dakika}
                      onChange={e => update(i, 'sure_dakika', e.target.value)}
                      placeholder="—"
                      className="w-full bg-stone-800/50 border border-stone-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-stone-600 outline-none focus:border-[#c9a84c]"
                    />
                    <button
                      onClick={() => removeRow(i)}
                      aria-label={`${row.ad || 'hizmet'} satırını sil`}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={save}
                disabled={busy === 'saving'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold"
              >
                {busy === 'saving' ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {busy === 'saving' ? 'Kaydediliyor…' : 'Onayla ve Kaydet'}
              </button>
              <button
                onClick={reset}
                disabled={busy === 'saving'}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 text-sm"
              >
                Vazgeç
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
