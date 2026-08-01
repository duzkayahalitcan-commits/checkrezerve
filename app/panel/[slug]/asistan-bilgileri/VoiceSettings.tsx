'use client'

import { useState, useEffect, useCallback } from 'react'
import { Volume2, Check, Loader2, Clock } from 'lucide-react'
import { VOICE_OPTIONS, getVoice } from '@/lib/voice-catalog'

interface VoiceSettingsProps {
  restaurantId: string
  isSuperAdmin?: boolean
}

export default function VoiceSettings({ restaurantId, isSuperAdmin }: VoiceSettingsProps) {
  const [voiceId, setVoiceId] = useState<string>('')
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [remainingMs, setRemainingMs] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [serverLocked, setServerLocked] = useState(false)

  // Kalan süre sayacı — her saniye güncellenir
  useEffect(() => {
    if (lockedUntil === null) return
    const tick = () => {
      const rem = lockedUntil - Date.now()
      if (rem <= 0) {
        setLockedUntil(null)
        setRemainingMs(0)
        setServerLocked(false)
        return
      }
      setRemainingMs(rem)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockedUntil])

  const formatRemaining = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000))
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${h} saat ${String(m).padStart(2, '0')} dk ${String(s).padStart(2, '0')} sn`
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/panel/voice-settings?restaurant_id=${restaurantId}`)
      const json = await res.json()
      if (res.ok) {
        setVoiceId(json.voice_id ?? '')
        setServerLocked(!!json.locked)
        setLockedUntil(json.locked_until ?? null)
        setRemainingMs(json.remaining_ms ?? 0)
      } else {
        setError(json.error ?? 'Ses ayarları yüklenemedi')
      }
    } catch {
      setError('Ses ayarları yüklenemedi')
    }
    setLoading(false)
  }, [restaurantId])

  useEffect(() => { load() }, [load])

  // Ses önizleme — ElevenLabs TTS ile kısa cümle oynat
  const preview = async (voiceKey: string) => {
    setPlaying(voiceKey)
    setError(null)
    try {
      const voice = getVoice(voiceKey)
      const res = await fetch('/api/ai-assistant/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Merhaba, ben asistanınızım. Size nasıl yardımcı olabilirim?',
          voice_id: voice.elevenLabsId,
          restaurant_id: restaurantId,
        }),
      })
      if (!res.ok) {
        setError('Ses önizlemesi alınamadı')
        setPlaying(null)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => { URL.revokeObjectURL(url); setPlaying(null) }
      audio.onerror = () => { URL.revokeObjectURL(url); setPlaying(null) }
      await audio.play()
    } catch {
      setError('Ses önizlemesi alınamadı')
      setPlaying(null)
    }
  }

  const selectVoice = async (voiceKey: string) => {
    if (voiceKey === voiceId || saving) return
    setSaving(true)
    setError(null)
    setInfo(null)
    try {
      const res = await fetch('/api/panel/voice-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: restaurantId, voice_id: voiceKey }),
      })
      const json = await res.json()
      if (res.ok) {
        setVoiceId(json.voice_id)
        setServerLocked(false)
        setLockedUntil(null)
        setRemainingMs(0)
        setInfo('Ses kaydedildi ✓')
        setTimeout(() => setInfo(null), 3000)
      } else {
        // 429: kilit aktif
        setError(json.error ?? 'Ses değiştirilemedi')
        if (json.locked) {
          setServerLocked(true)
          setLockedUntil(json.locked_until ?? null)
          setRemainingMs(json.remaining_ms ?? 0)
        }
      }
    } catch {
      setError('Ses değiştirilemedi')
    }
    setSaving(false)
  }

  const locked = serverLocked && !isSuperAdmin

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-800">
        <h2 className="text-sm font-bold text-white flex items-center gap-2"><Volume2 size={15} /> Asistan Sesi</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Sesli asistanın kullanacağı sesi seçin. İşletme sahibi 24 saatte bir değiştirebilir.
          {isSuperAdmin && <span className="text-amber-400 ml-1">(Super admin — kısıtlama yok)</span>}
        </p>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-stone-500">
            <Loader2 size={18} className="animate-spin mr-2" /> Yükleniyor...
          </div>
        ) : (
          <>
            {/* Kilit durumu */}
            {locked && lockedUntil !== null && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                <Clock size={14} className="shrink-0" />
                Ses değiştirme kilidi aktif. <strong className="ml-1">{formatRemaining(remainingMs)}</strong> sonra tekrar değiştirebilirsiniz.
              </div>
            )}

            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">{error}</div>}
            {info && <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">{info}</div>}

            {/* Ses seçenekleri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VOICE_OPTIONS.map(v => {
                const active = voiceId === v.key
                return (
                  <div
                    key={v.key}
                    className={`flex items-center justify-between gap-2 px-3 py-3 rounded-xl border transition-colors ${
                      active
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-stone-800/50 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    <button
                      onClick={() => selectVoice(v.key)}
                      disabled={locked || saving || active}
                      className="flex items-center gap-2 flex-1 text-left disabled:cursor-not-allowed"
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        v.gender === 'kadın' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {v.label[0]}
                      </span>
                      <span className="flex-1">
                        <span className={`block text-sm font-medium ${active ? 'text-emerald-300' : 'text-white'}`}>
                          {v.label}
                        </span>
                        <span className="block text-[10px] text-stone-500 capitalize">{v.gender}</span>
                      </span>
                      {active && <Check size={16} className="text-emerald-400 shrink-0" />}
                    </button>
                    <button
                      onClick={() => preview(v.key)}
                      disabled={saving}
                      className="shrink-0 p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-700 transition-colors disabled:opacity-40"
                      aria-label={`${v.label} sesini önizle`}
                    >
                      {playing === v.key ? <Loader2 size={15} className="animate-spin" /> : <Volume2 size={15} />}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
