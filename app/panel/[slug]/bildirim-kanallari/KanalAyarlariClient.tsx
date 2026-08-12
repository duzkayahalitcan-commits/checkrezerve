'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Bell, Loader2, Check } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

type Kanal = { kanal: string; label: string; aktif: boolean }

const ICONS: Record<string, string> = { email: '✉️', sms: '💬', whatsapp: '🟢', push: '🔔' }
const DESC: Record<string, string> = {
  email: 'E-posta adresine bildirim gönderilir',
  sms: 'Telefona SMS gönderilir',
  whatsapp: 'WhatsApp üzerinden gönderilir',
  push: 'Tarayıcı/uygulama push bildirimi gönderilir',
}

export default function KanalAyarlariClient({ kanallar: initial }: { kanallar: Kanal[] }) {
  const toast = useToast()
  const [kanallar, setKanallar] = useState<Kanal[]>(initial)
  const [saving, setSaving] = useState(false)

  function toggle(kanal: string) {
    setKanallar(prev => prev.map(k => k.kanal === kanal ? { ...k, aktif: !k.aktif } : k))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/panel/bildirim-kanallari', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kanallar: kanallar.map(k => ({ kanal: k.kanal, aktif: k.aktif })) }),
      })
      if (!res.ok) throw new Error()
      toast.show('Kanal ayarları kaydedildi ✅', 'success')
    } catch {
      toast.show('Kaydedilemedi', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#D4A373]/15 text-[#D4A373] flex items-center justify-center">
            <Bell size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Müşteri Bildirim Kanalları</h2>
            <p className="text-xs text-stone-500">Açık kanallar müşteriye sunulur; müşteri bunlardan kapatabilir ama açamaz.</p>
          </div>
        </div>

        <div className="space-y-3">
          {kanallar.map(k => (
            <div key={k.kanal} className="flex items-center justify-between p-4 rounded-xl border border-stone-800 bg-stone-950/50">
              <div className="flex items-center gap-3">
                <span className="text-xl">{ICONS[k.kanal] ?? '📣'}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{k.label}</p>
                  <p className="text-xs text-stone-500">{DESC[k.kanal] ?? ''}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(k.kanal)}
                role="switch"
                aria-checked={k.aktif}
                className={`relative w-12 h-6.5 rounded-full transition-colors ${k.aktif ? 'bg-[#D4A373]' : 'bg-stone-700'}`}
                style={{ height: 26 }}
              >
                <span className={`absolute top-0.5 w-[22px] h-[22px] rounded-full bg-white transition-all ${k.aktif ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#c99a66] disabled:opacity-40 text-black text-sm font-semibold"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>
    </motion.div>
  )
}
