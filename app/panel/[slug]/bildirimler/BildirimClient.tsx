'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { saveTemplate, deleteTemplate, sendNotification, resendNotification } from './actions'

type LogEntry = {
  id: string; tip: string; alici: string; mesaj: string; durum: string
  hata_mesaji?: string | null; sablon_id?: string | null; created_at: string
}
type Template = {
  id: string; ad: string; icerik: string; tip: string; aktif: boolean; son_kullanim?: string | null; created_at: string
}

const DECIS_TIPLERI = ['sms', 'push', 'email', 'whatsapp']
const DURUM_RENK: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-400',
  sent:      'bg-emerald-500/15 text-emerald-400',
  delivered: 'bg-blue-500/15 text-blue-400',
  failed:    'bg-red-500/15 text-red-400',
}

export default function BildirimClient({ slug, logs: initialLogs, templates: initialTemplates }: {
  slug: string; logs: LogEntry[]; templates: Template[]
}) {
  const router = useRouter()
  const toast = useToast()
  const [tab, setTab] = useState<'log' | 'gonder' | 'sablon'>('log')
  const [logs, setLogs] = useState(initialLogs)
  const [templates, setTemplates] = useState(initialTemplates)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Gönder form
  const [sendForm, setSendForm] = useState({ tip: 'sms', alici: '', mesaj: '' })
  const [sending, setSending] = useState(false)

  // Şablon form
  const [tplForm, setTplForm] = useState({ id: '', ad: '', icerik: '', tip: 'sms' })
  const [tplEditor, setTplEditor] = useState(false)

  const filteredLogs = logs.filter(l => {
    if (filterType !== 'all' && l.tip !== filterType) return false
    if (filterStatus !== 'all' && l.durum !== filterStatus) return false
    return true
  })

  async function handleSend() {
    setSending(true)
    const fd = new FormData()
    fd.set('tip', sendForm.tip)
    fd.set('alici', sendForm.alici)
    fd.set('mesaj', sendForm.mesaj)
    const res = await sendNotification(fd)
    setSending(false)
    if (res.success) {
      toast.show('Bildirim gönderildi ✅', 'success')
      setSendForm({ tip: 'sms', alici: '', mesaj: '' })
      router.refresh()
    } else {
      toast.show(res.error ?? 'Hata', 'error')
    }
  }

  async function handleSaveTpl() {
    const fd = new FormData()
    if (tplForm.id) fd.set('id', tplForm.id)
    fd.set('ad', tplForm.ad)
    fd.set('icerik', tplForm.icerik)
    fd.set('tip', tplForm.tip)
    const res = await saveTemplate(fd)
    if (res.success) {
      toast.show(tplForm.id ? 'Güncellendi ✅' : 'Eklendi ✅', 'success')
      setTplEditor(false)
      setTplForm({ id: '', ad: '', icerik: '', tip: 'sms' })
      router.refresh()
    } else {
      toast.show(res.error ?? 'Hata', 'error')
    }
  }

  async function handleDeleteTpl(id: string) {
    const res = await deleteTemplate(id)
    if (res.success) {
      toast.show('Silindi', 'success')
      router.refresh()
    } else {
      toast.show(res.error ?? 'Hata', 'error')
    }
  }

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white">Bildirimler</h1>
      </div>

      {/* Sekmeler */}
      <div className="px-6 pt-4 flex gap-2 border-b border-stone-800">
        {([
          { key: 'log' as const, label: 'Log' },
          { key: 'gonder' as const, label: 'Gönder' },
          { key: 'sablon' as const, label: 'Şablonlar' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.key ? 'text-[#c9a84c] border-[#c9a84c]' : 'text-stone-500 border-transparent hover:text-stone-300'
            }`}>{t.label}</button>
        ))}
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* ── TAB: LOG ────────────────────────────────────────────────── */}
        {tab === 'log' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                <option value="all">Tümü</option>
                {DECIS_TIPLERI.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option><option value="sent">Gönderildi</option>
                <option value="delivered">İletildi</option><option value="failed">Hatalı</option>
              </select>
            </div>

            {filteredLogs.length === 0 ? (
              <p className="text-stone-500 text-sm text-center py-12">Bildirim kaydı yok</p>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map(l => (
                  <div key={l.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">{l.tip}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${DURUM_RENK[l.durum] ?? 'bg-stone-800 text-stone-400'}`}>
                            {l.durum}
                          </span>
                          <span className="text-[10px] text-stone-600">{l.alici}</span>
                        </div>
                        <p className="text-sm text-stone-300 line-clamp-2">{l.mesaj}</p>
                        {l.hata_mesaji && <p className="text-xs text-red-400 mt-1">⚠ {l.hata_mesaji}</p>}
                        <p className="text-[10px] text-stone-600 mt-1">
                          {new Date(l.created_at + 'Z').toLocaleString('tr-TR')}
                        </p>
                      </div>
                      {l.durum === 'failed' && (
                        <button onClick={async () => {
                          const res = await resendNotification(l.id)
                          if (res.success) { toast.show('Tekrar gönderiliyor', 'success'); router.refresh() }
                          else toast.show(res.error ?? 'Hata', 'error')
                        }} className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 shrink-0">
                          Tekrar Gönder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: GÖNDER ──────────────────────────────────────────────── */}
        {tab === 'gonder' && (
          <div className="max-w-lg space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-xs text-stone-400 font-medium mb-1.5 block">Tür</label>
                <select value={sendForm.tip} onChange={e => setSendForm(f => ({ ...f, tip: e.target.value }))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white outline-none">
                  {DECIS_TIPLERI.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-400 font-medium mb-1.5 block">Alıcı (telefon / email)</label>
                <input value={sendForm.alici} onChange={e => setSendForm(f => ({ ...f, alici: e.target.value }))}
                  placeholder="+905XX XXX XX XX" className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 outline-none focus:border-[#c9a84c]" />
              </div>

              <div>
                <label className="text-xs text-stone-400 font-medium mb-1.5 block">
                  Mesaj
                  <span className="text-stone-600 ml-2">({sendForm.mesaj.length}/160)</span>
                </label>
                <textarea value={sendForm.mesaj} onChange={e => setSendForm(f => ({ ...f, mesaj: e.target.value }))}
                  rows={4} maxLength={160}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 outline-none focus:border-[#c9a84c] resize-none"
                  placeholder="Mesajınızı yazın..." />
              </div>

              <div className="bg-stone-800 rounded-xl p-3 text-xs text-stone-400 space-y-1">
                <p className="font-semibold text-stone-300 mb-1">Kullanılabilir değişkenler:</p>
                <p><code className="text-[#c9a84c]">{'{musteri_adi}'}</code> — Müşteri adı</p>
                <p><code className="text-[#c9a84c]">{'{tarih}'}</code> — Rezervasyon tarihi</p>
                <p><code className="text-[#c9a84c]">{'{saat}'}</code> — Rezervasyon saati</p>
                <p><code className="text-[#c9a84c]">{'{isletme_adi}'}</code> — İşletme adı</p>
              </div>

              <button onClick={handleSend} disabled={sending || !sendForm.mesaj.trim()}
                className="w-full rounded-xl bg-[#c9a84c] py-3.5 text-sm font-bold text-black hover:bg-amber-500 transition-all disabled:opacity-40">
                {sending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: ŞABLONLAR ──────────────────────────────────────────── */}
        {tab === 'sablon' && (
          <div className="space-y-4">
            <button onClick={() => { setTplEditor(true); setTplForm({ id: '', ad: '', icerik: '', tip: 'sms' }) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a84c] text-black text-sm font-semibold hover:bg-amber-500 transition-all">
              + Yeni Şablon
            </button>

            {templates.length === 0 && !tplEditor && (
              <p className="text-stone-500 text-sm text-center py-12">Henüz şablon yok</p>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {templates.map(t => (
                <div key={t.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{t.ad}</h3>
                      <span className="text-[10px] text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full mt-1 inline-block">{t.tip}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setTplForm({ id: t.id, ad: t.ad, icerik: t.icerik, tip: t.tip }); setTplEditor(true) }}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-[#c9a84c] text-xs">✏️</button>
                      <button onClick={() => handleDeleteTpl(t.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 text-xs">🗑️</button>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2">{t.icerik}</p>
                  {t.son_kullanim && (
                    <p className="text-[10px] text-stone-600 mt-2">Son: {new Date(t.son_kullanim + 'Z').toLocaleDateString('tr-TR')}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Şablon düzenleme modalı */}
            <AnimatePresence>
              {tplEditor && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                  onClick={() => setTplEditor(false)}>
                  <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                    className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <h2 className="text-lg font-bold text-white mb-4">{tplForm.id ? 'Şablon Düzenle' : 'Yeni Şablon'}</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-stone-400 font-medium mb-1.5 block">Ad</label>
                        <input value={tplForm.ad} onChange={e => setTplForm(f => ({ ...f, ad: e.target.value }))}
                          className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#c9a84c]" />
                      </div>
                      <div>
                        <label className="text-xs text-stone-400 font-medium mb-1.5 block">Tür</label>
                        <select value={tplForm.tip} onChange={e => setTplForm(f => ({ ...f, tip: e.target.value }))}
                          className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white outline-none">
                          {DECIS_TIPLERI.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-stone-400 font-medium mb-1.5 block">İçerik</label>
                        <textarea value={tplForm.icerik} onChange={e => setTplForm(f => ({ ...f, icerik: e.target.value }))}
                          rows={5} className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#c9a84c] resize-none" />
                        <p className="text-[10px] text-stone-600 mt-1">
                          Değişkenler: {'{musteri_adi}'} {'{tarih}'} {'{saat}'} {'{isletme_adi}'}
                        </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setTplEditor(false)}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-sm font-medium">İptal</button>
                        <button onClick={handleSaveTpl}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#c9a84c] text-black text-sm font-bold">Kaydet</button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
