'use client'

import { useState, useEffect, useCallback } from 'react'

type Flag = {
  id: string
  restaurant_id: string
  feature: string
  enabled: boolean
  created_at: string
  updated_at: string
  restaurants: { name: string; slug: string } | null
}

type Restaurant = {
  id: string
  name: string
  slug: string
}

const FEATURES = [
  { key: 'waitlist',        label: 'Bekleme Listesi' },
  { key: 'deposit_required', label: 'Depozito Zorunlu' },
  { key: 'voice_assistant',  label: 'Sesli Asistan' },
  { key: 'auto_confirm',     label: 'Otomatik Onay' },
  { key: 'reminder_sms',     label: 'Hatırlatma SMS' },
  { key: 'review_request',   label: 'Değerlendirme İsteği' },
] as const

export default function FeatureFlagManager({
  initialFlags,
  restaurants,
}: {
  initialFlags: Flag[]
  restaurants: Restaurant[]
}) {
  const [flags, setFlags] = useState<Flag[]>(initialFlags)
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const upsert = useCallback(async (restaurantId: string, feature: string, enabled: boolean) => {
    const key = `${restaurantId}:${feature}`
    setToggling(prev => new Set(prev).add(key))
    setError(null)
    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId, feature, enabled }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'İşlem başarısız')
      }
      setFlags(prev => {
        const existing = prev.findIndex(f => f.restaurant_id === restaurantId && f.feature === feature)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = { ...updated[existing], enabled }
          return updated
        }
        return [...prev, {
          id: '', restaurant_id: restaurantId, feature, enabled,
          created_at: '', updated_at: '',
          restaurants: restaurants.find(r => r.id === restaurantId) ?? { id: restaurantId, name: '?', slug: '?' },
        } as Flag]
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setToggling(prev => { const n = new Set(prev); n.delete(key); return n })
    }
  }, [restaurants])

  const getFlag = (restaurantId: string, feature: string) =>
    flags.find(f => f.restaurant_id === restaurantId && f.feature === feature)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-zinc-800">Feature Flags</h2>
        <span className="text-xs text-zinc-400">{flags.length} flag ayarlanmış</span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="text-left py-2 pr-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">İşletme</th>
              {FEATURES.map(f => (
                <th key={f.key} className="text-center py-2 px-2 text-zinc-500 font-medium text-xs uppercase tracking-wider min-w-[100px]">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {restaurants.map(r => (
              <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                <td className="py-3 pr-4">
                  <div className="font-medium text-zinc-800 text-sm">{r.name}</div>
                  <div className="text-[11px] text-zinc-400">/{r.slug}</div>
                </td>
                {FEATURES.map(f => {
                  const flag = getFlag(r.id, f.key)
                  const isOn = flag?.enabled ?? false
                  const loading = toggling.has(`${r.id}:${f.key}`)
                  return (
                    <td key={f.key} className="text-center py-3 px-2">
                      <button
                        onClick={() => upsert(r.id, f.key, !isOn)}
                        disabled={loading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isOn
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                        } disabled:opacity-50`}
                      >
                        {loading ? (
                          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                        )}
                        {isOn ? 'Açık' : 'Kapalı'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-8 text-sm text-zinc-400">
          Henüz işletme bulunmuyor.
        </div>
      )}
    </div>
  )
}
