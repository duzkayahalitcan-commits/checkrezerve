'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Phone, Mic, Volume2, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { resolveBackground } from '@/lib/backgrounds'

type Phase = 'idle' | 'mic' | 'processing' | 'speaking'

export type CallVariant = 'glass' | 'dark' | 'brand'

interface Props {
  restaurantId: string
  restaurantName: string
  restaurantSlug: string
  assistantName?: string | null
  assistantVoice?: string | null
  /** İşletme sahibinin yüklediği arka plan görseli (opsiyonel) */
  backgroundImage?: string | null
  businessType?: string | null
  /** Çağrı arayüzü tasarım varyantı (prototipler: glass | dark | brand) */
  variant?: CallVariant
}

export default function FloatingAIAssistant({
  restaurantId,
  restaurantName,
  restaurantSlug,
  assistantName,
  assistantVoice,
  backgroundImage,
  businessType,
  variant = 'glass',
}: Props) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [timer, setTimer] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('')

  // Refs
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const phaseRef = useRef<Phase>('idle')
  const turnRef = useRef(1)
  const sessionId = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15)
  )
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number>(0)
  const activeRef = useRef(false)

  // Sync phase → ref
  useEffect(() => { phaseRef.current = phase }, [phase])

  const name = (assistantName && assistantName !== 'null') ? assistantName : 'Asistan'
  const biz = restaurantName || 'İşletme'
  // İşletmeye özel arka plan — özel görsel yoksa sektör degradası
  const bg = resolveBackground(backgroundImage, businessType)
  const accentClass = variant === 'brand'
    ? 'from-amber-500 to-orange-500'
    : variant === 'dark'
    ? 'from-stone-200 to-stone-400'
    : 'from-emerald-400 to-teal-400'

  // ─── Timer (çağrı başından bitişine kadar kesintisiz akar) ─────
  const startTimer = useCallback(() => {
    setTimer(0)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
  }, [])
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ─── VAD (sessizlik algılama) — yalnızca phase 'mic' iken çalışır ──
  const startVAD = useCallback((stream: MediaStream, onSilence: () => void) => {
    try {
      const ctx = new AudioContext()
      const src = ctx.createMediaStreamSource(stream)
      const an = ctx.createAnalyser()
      an.fftSize = 512
      src.connect(an)
      ctxRef.current = ctx

      const buf = new Float32Array(an.fftSize)
      let silenceAt = 0

      const check = () => {
        if (phaseRef.current !== 'mic') return
        an.getFloatTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
        const rms = Math.sqrt(sum / buf.length)

        if (rms < 0.02) {
          if (!silenceAt) silenceAt = Date.now()
          else if (Date.now() - silenceAt > 1400) {
            onSilence()
            return
          }
        } else silenceAt = 0

        rafRef.current = requestAnimationFrame(check)
      }
      rafRef.current = requestAnimationFrame(check)
    } catch { /* VAD not available */ }
  }, [])

  const stopVAD = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
  }, [])

  const preferredMimeType = useCallback(() => {
    if (typeof window === 'undefined') return 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
    return ''
  }, [])

  const speak = useCallback(async (text: string) => {
    try {
      const res = await fetch('/api/ai-assistant/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice_id: assistantVoice && assistantVoice !== 'yunus' ? assistantVoice : undefined,
          restaurant_id: restaurantId,
        }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        await new Promise<void>((resolve) => {
          audio.onended = () => { URL.revokeObjectURL(url); resolve() }
          audio.onerror = () => { URL.revokeObjectURL(url); resolve() }
          audio.play().catch(() => resolve())
        })
      }
    } catch { /* audio may fail silently */ }
  }, [assistantVoice])

  // ─── Bir tur: dinle → çöz → yanıtla → (devam) ─────────────────
  const beginTurn = (stream: MediaStream) => {
    if (!activeRef.current) return
    setPhase('mic')

    const mimeType = preferredMimeType() || 'audio/webm'
    const recorder = new MediaRecorder(stream, { mimeType })
    recRef.current = recorder

    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

    const currentTurn = turnRef.current
    turnRef.current += 1
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'

    recorder.onstop = async () => {
      if (!activeRef.current) return
      stopVAD()

      const blob = new Blob(chunks, { type: mimeType })
      if (blob.size < 1000) {
        // Sessizlik — dinlemeye devam et
        if (activeRef.current) beginTurn(stream)
        return
      }

      setPhase('processing')

      // 1) Whisper transcribe
      let text = ''
      try {
        const fd = new FormData()
        fd.append('audio_file', blob, `audio.${ext}`)
        const res = await fetch('/api/ai-assistant/transcribe', { method: 'POST', body: fd })
        const data = await res.json()
        text = (data.text as string) ?? ''
      } catch {
        if (activeRef.current) beginTurn(stream)
        return
      }
      if (!text) {
        if (activeRef.current) beginTurn(stream)
        return
      }
      setTranscript(text)

      // 2) Chat API
      let ans = ''
      let shouldEnd = false
      try {
        const res = await fetch('/api/ai-assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            restaurant_slug: restaurantSlug,
            session_id: sessionId.current,
            turn_number: currentTurn,
            channel: 'web_voice',
          }),
        })
        const data = await res.json()
        ans = (data.response as string) ?? ''
        shouldEnd = !!data.end_call
      } catch {
        if (activeRef.current) beginTurn(stream)
        return
      }
      if (!ans) {
        if (activeRef.current) beginTurn(stream)
        return
      }
      setReply(ans)

      // 3) Speak (TTS) — ses dalgası animasyonu bu fazda görünür
      setPhase('speaking')
      await speak(ans)

      // Asistan vedalaştı / rezervasyon tamamlandı → çağrıyı otomatik kapat
      if (shouldEnd) {
        endCall()
        return
      }

      // Devam et
      if (activeRef.current) beginTurn(stream)
    }

    recorder.start()
    startVAD(stream, () => {
      if (recorder.state === 'recording') recorder.stop()
    })

    // Güvenlik: 15 saniye sonra otomatik durdur
    setTimeout(() => {
      if (activeRef.current && recorder.state === 'recording') recorder.stop()
    }, 15000)
  }

  // ─── Çağrıyı başlat (buton press → getUserMedia) ──────────────
  const startCall = useCallback(async () => {
    if (activeRef.current || phase !== 'idle') return
    activeRef.current = true
    setTranscript('')
    setReply('')
    setPhase('mic')
    startTimer()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      })
      if (!activeRef.current) {
        stream.getTracks().forEach(t => t.stop())
        return
      }
      mediaStreamRef.current = stream
      beginTurn(stream)
    } catch {
      activeRef.current = false
      setPhase('idle')
      stopTimer()
    }
  }, [phase, beginTurn, startTimer, stopTimer])

  // ─── Çağrıyı sonlandır ─────────────────────────────────────────
  const endCall = useCallback(() => {
    activeRef.current = false
    stopVAD()
    stopTimer()
    if (recRef.current && recRef.current.state !== 'inactive') {
      try { recRef.current.stop() } catch { /* ignore */ }
    }
    mediaStreamRef.current?.getTracks().forEach(t => t.stop())
    mediaStreamRef.current = null
    recRef.current = null
    setPhase('idle')
  }, [stopVAD, stopTimer])

  // Cleanup on unmount
  useEffect(() => () => {
    activeRef.current = false
    stopVAD()
    stopTimer()
    mediaStreamRef.current?.getTracks().forEach(t => t.stop())
  }, [stopVAD, stopTimer])

  const active = phase !== 'idle'

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Sesli asistan"
      >
        <Phone size={20} className="text-white" />
      </button>

      {/* Phone-call overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className={`relative w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden border ${
                variant === 'dark'
                  ? 'border-white/10'
                  : variant === 'brand'
                  ? 'border-amber-500/25'
                  : 'border-white/20'
              }`}
              style={{
                background: bg.isImage
                  ? `linear-gradient(rgba(10,10,25,0.55), rgba(10,10,25,0.85)), url("${bg.imageUrl}") center/cover`
                  : bg.gradient,
              }}
            >
              {/* Frosted / dim overlay — işletme arka planı üstünde okunabilirlik */}
              <div
                className={`absolute inset-0 pointer-events-none ${
                  variant === 'glass'
                    ? 'bg-white/10 backdrop-blur-xl'
                    : variant === 'dark'
                    ? 'bg-black/30'
                    : 'bg-black/45'
                }`}
              />

              <div className="relative px-8 pt-12 pb-8 flex flex-col items-center text-center">

                {/* Avatar — fazı yalnızca animasyonla belli eder */}
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${accentClass} shadow-lg ${
                  phase === 'speaking' ? 'scale-105' : ''
                } transition-transform`}>
                  {/* Dinlerken pulse */}
                  {phase === 'mic' && (
                    <span className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-50" />
                  )}
                  {phase === 'speaking' ? (
                    <Volume2 size={32} className="text-white relative" />
                  ) : phase === 'processing' ? (
                    <Loader size={28} className="text-white animate-spin relative" />
                  ) : phase === 'mic' ? (
                    <Mic size={32} className="text-white relative" />
                  ) : (
                    <Phone size={32} className="text-white/80 relative" />
                  )}
                </div>

                {/* Konuşurken ses dalgası animasyonu */}
                {phase === 'speaking' && (
                  <div className="flex items-center gap-1 mb-4 h-8">
                    {[1,2,3,4,5].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, 30 - i * 4, 8] }}
                        transition={{ repeat: Infinity, duration: 0.8 + i * 0.1, ease: 'easeInOut' }}
                        className="w-1 rounded-full bg-gradient-to-t from-white/70 to-white"
                      />
                    ))}
                  </div>
                )}

                {/* Asistan adı + işletme adı — gerçek telefon görüşmesi gibi */}
                <p className="text-white font-semibold text-xl tracking-tight mb-1">{name}</p>
                <p className="text-white/60 text-sm mb-6">{biz}</p>

                {/* Timer — çağrı başında 00:00, bitene kadar akar */}
                {active && (
                  <div className="text-white/70 text-xs font-mono tabular-nums mb-6">{fmt(timer)}</div>
                )}

                {/* Çağrı başlat / sonlandır */}
                {!active ? (
                  <button
                    type="button"
                    onClick={startCall}
                    className={`mt-2 px-9 py-3 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${accentClass} shadow-lg transition-transform hover:scale-105 active:scale-95`}
                  >
                    Sesli Görüşme
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={endCall}
                    className="mt-2 px-7 py-3 rounded-full text-white text-sm font-medium bg-red-500/90 hover:bg-red-500 transition-colors select-none"
                  >
                    Görüşmeyi Sonlandır
                  </button>
                )}

                <button
                  onClick={() => setOpen(false)}
                  className="mt-6 text-white/50 hover:text-white text-xs transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
