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

const AI_FEATURES = [
  { key: 'ai_chatbot',      label: '🤖 AI Chatbot' },
  { key: 'ai_reservation',  label: '📅 AI Rezervasyon' },
  { key: 'ai_voice_search', label: '🎤 AI Sesli Arama' },
] as const

// AI flags bağımlılık zinciri: ai_voice_search → ai_chatbot, ai_reservation → ai_chatbot
const AI_DEPENDENCIES: Record<string, string> = {
  ai_voice_search: 'ai_chatbot',
  ai_reservation:  'ai_chatbot',
}

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

  const getFlag = (restaurantId: string, feature: string) =>
    flags.find(f => f.restaurant_id === restaurantId && f.feature === feature)

  const upsert = useCallback(async (restaurantId: string, feature: string, enabled: boolean) => {
    const key = `${restaurantId}:${feature}`

    // Bağımlılık kontrolü: ai_chatbot kapatılıyorsa, bağımlı alt flag'leri de kapat
    const cascadeKeys: string[] = []
    if (feature === 'ai_chatbot' && !enabled) {
      for (const sub of Object.keys(AI_DEPENDENCIES)) {
        cascadeKeys.push(`${restaurantId}:${sub}`)
      }
    }

    // Hata yakalamak için tüm toggling key'leri
    const allKeys = [key, ...cascadeKeys]
    setToggling(prev => { const n = new Set(prev); for (const k of allKeys) n.add(k); return n })
    setError(null)
    try {
      // Ana flag'i güncelle
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
        let updated = [...prev]
        const updateFlag = (f: string, e: boolean) => {
          const idx = updated.findIndex(fl => fl.restaurant_id === restaurantId && fl.feature === f)
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], enabled: e }
          } else {
            updated.push({
              id: '', restaurant_id: restaurantId, feature: f, enabled: e,
              created_at: '', updated_at: '',
              restaurants: restaurants.find(rest => rest.id === restaurantId) ?? { id: restaurantId, name: '?', slug: '?' },
            } as Flag)
          }
        }
        updateFlag(feature, enabled)

        // Bağımlı alt flag'leri kapat (cascade)
        if (feature === 'ai_chatbot' && !enabled) {
          for (const sub of Object.keys(AI_DEPENDENCIES)) {
            updateFlag(sub, false)
          }
        }
        return updated
      })

      // Bağımlı flag'leri DB'ye de kaydet (fire-and-forget, state zaten güncellendi)
      if (feature === 'ai_chatbot' && !enabled) {
        for (const sub of Object.keys(AI_DEPENDENCIES)) {
          fetch('/api/admin/feature-flags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restaurant_id: restaurantId, feature: sub, enabled: false }),
          }).catch(() => {})
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setToggling(prev => { const n = new Set(prev); for (const k of allKeys) n.delete(k); return n })
    }
  }, [restaurants])

  // ─── Flag hücresi renderer ─────────────────────────────────────────

  const renderFlagCell = ({
    restaurantId,
    feature,
    label,
    disabled = false,
    colorClass = { on: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200', off: 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200' },
    dotClass = { on: 'bg-emerald-500', off: 'bg-zinc-300' },
  }: {
    restaurantId: string
    feature: string
    label: string
    disabled?: boolean
    colorClass?: { on: string; off: string }
    dotClass?: { on: string; off: string }
  }) => {
    const flag = getFlag(restaurantId, feature)
    const isOn = flag?.enabled ?? false
    const loading = toggling.has(`${restaurantId}:${feature}`)
    const canToggle = !loading && !disabled

    return (
      <td className="text-center py-3 px-2">
        <button
          onClick={() => canToggle && upsert(restaurantId, feature, !isOn)}
          disabled={!canToggle}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isOn ? colorClass.on : colorClass.off
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={disabled && !isOn ? `${label} kullanmak için AI Chatbot açık olmalı` : undefined}
        >
          {loading ? (
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <span className={`w-2 h-2 rounded-full ${isOn ? dotClass.on : dotClass.off}`} />
          )}
          {isOn ? 'Açık' : 'Kapalı'}
        </button>
      </td>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-zinc-800">Feature Flags</h2>
        <span className="text-xs text-zinc-400">{flags.length} flag ayarlanmış</span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ═══════ Genel Feature Flags ═══════ */}
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
                {FEATURES.map(f =>
                  renderFlagCell({ restaurantId: r.id, feature: f.key, label: f.label })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══════ 🤖 AI Özellikleri — Mor Bölüm ═══════ */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/30 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100 bg-purple-50/50">
          <span className="text-sm">🤖</span>
          <h3 className="font-semibold text-sm text-purple-800">AI Özellikleri</h3>
          <span className="text-[10px] text-purple-400 ml-auto">
            AI Chatbot kapalıysa alt özellikler devre dışı kalır
          </span>
        </div>

        <div className="overflow-x-auto p-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100">
                <th className="text-left py-2 px-4 text-purple-600 font-medium text-xs uppercase tracking-wider w-[180px]">İşletme</th>
                {AI_FEATURES.map(f => (
                  <th key={f.key} className="text-center py-2 px-2 text-purple-600 font-medium text-xs uppercase tracking-wider min-w-[120px]">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {restaurants.map(r => {
                const chatbotOn = getFlag(r.id, 'ai_chatbot')?.enabled ?? false
                return (
                  <tr key={r.id} className="border-b border-purple-50 hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-800 text-sm">{r.name}</div>
                      <div className="text-[11px] text-zinc-400">/{r.slug}</div>
                    </td>
                    {AI_FEATURES.map(f => {
                      // ai_voice_search ve ai_reservation: ai_chatbot açık değilse disabled
                      const dependsOn = AI_DEPENDENCIES[f.key]
                      const isDisabled = !!dependsOn && !chatbotOn
                      return renderFlagCell({
                        restaurantId: r.id,
                        feature: f.key,
                        label: f.label,
                        disabled: isDisabled,
                        colorClass: {
                          on: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
                          off: 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200',
                        },
                        dotClass: {
                          on: 'bg-purple-500',
                          off: 'bg-zinc-300',
                        },
                      })
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-8 text-sm text-zinc-400">
          Henüz işletme bulunmuyor.
        </div>
      )}
    </div>
  )
}
