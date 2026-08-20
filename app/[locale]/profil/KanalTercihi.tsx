'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type Kanal = { kanal: string; aktif: boolean }
type BizKanallar = { restaurant_id: string; restaurant_name: string; kanallar: Kanal[] }

const KANAL_LABEL: Record<string, string> = { email: 'E-posta', sms: 'SMS', whatsapp: 'WhatsApp', push: 'Push' }
const KANAL_ICON: Record<string, string> = { email: '✉️', sms: '💬', whatsapp: '🟢', push: '🔔' }

export default function KanalTercihi() {
  const [items, setItems] = useState<BizKanallar[]>([])
  const [loading, setLoading] = useState(true)

  // Müşterinin paketi olan işletmeleri bul
  const loadRestaurants = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('musteri_paketleri')
      .select('paketler(restaurant_id, restaurants(id, name))')
      .eq('musteri_id', uid)
      .eq('aktif', true)
    type Row = { paketler: { restaurant_id: string; restaurants: { id: string; name: string } | null } }
    const raw = (data ?? []) as unknown as Row[]
    const bizIds = new Map<string, string>()
    for (const r of raw) {
      const rid = r.paketler?.restaurant_id
      const name = r.paketler?.restaurants?.name
      if (rid && name) bizIds.set(rid, name)
    }
    return [...bizIds.entries()].map(([id, name]) => ({ id, name }))
  }, [])

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session || cancelled) { if (!cancelled) setLoading(false); return }
      try {
        const biz = await loadRestaurants(session.user.id)
        const rows: BizKanallar[] = []
        for (const b of biz) {
          const res = await fetch(`/api/musteri/kanal-tercihleri?restaurant_id=${b.id}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          if (res.ok) {
            const d = await res.json()
            rows.push({ restaurant_id: b.id, restaurant_name: b.name, kanallar: d.kanallar })
          }
        }
        if (!cancelled) { setItems(rows); setLoading(false) }
      } catch { if (!cancelled) setLoading(false) }
    })
    return () => { cancelled = true }
  }, [loadRestaurants])

  async function toggle(bizId: string, kanal: string) {
    setItems(prev => prev.map(it =>
      it.restaurant_id === bizId
        ? { ...it, kanallar: it.kanallar.map(k => k.kanal === kanal ? { ...k, aktif: !k.aktif } : k) }
        : it
    ))
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const it = items.find(x => x.restaurant_id === bizId)
    const kanallar = it?.kanallar.map(k => k.kanal === kanal ? { ...k, aktif: !k.aktif } : k) ?? []
    await fetch('/api/musteri/kanal-tercihleri', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ restaurant_id: bizId, kanallar }),
    })
  }

  if (loading) return <div className="text-zinc-400 text-sm py-4">Yükleniyor...</div>
  if (items.length === 0) return null

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-6 mb-8 shadow-sm">
      <h2 className="text-base font-bold text-zinc-900 mb-1">🔔 Bildirim Tercihleri</h2>
      <p className="text-sm text-zinc-500 mb-5">Paket sahibi olduğunuz işletmelerden hangi kanaldan bildirim alacağınızı seçin.</p>

      <div className="space-y-6">
        {items.map(biz => (
          <div key={biz.restaurant_id}>
            <p className="text-sm font-semibold text-zinc-800 mb-2">{biz.restaurant_name}</p>
            <div className="flex flex-wrap gap-3">
              {biz.kanallar.map(k => (
                <button
                  key={k.kanal}
                  onClick={() => toggle(biz.restaurant_id, k.kanal)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    k.aktif ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-zinc-500 border-zinc-200'
                  }`}
                >
                  <span>{KANAL_ICON[k.kanal] ?? '📣'}</span>
                  {KANAL_LABEL[k.kanal] ?? k.kanal}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
