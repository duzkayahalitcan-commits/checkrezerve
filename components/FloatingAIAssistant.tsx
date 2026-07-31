'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Phone, Mic, X, Loader, Volume2, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

type State = 'idle' | 'connecting' | 'listening' | 'transcribing' | 'responding' | 'speaking'

interface Props {
  restaurantId: string
  restaurantName: string
  restaurantSlug: string
  assistantName?: string | null
  assistantVoice?: string | null
}

export default function FloatingAIAssistant({
  restaurantId,
  restaurantName,
  restaurantSlug,
  assistantName,
  assistantVoice,
}: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [statusText, setStatusText] = useState<string | null>(null)

  // Refs for mutable values that must not be stale in callbacks
  const turnRef = useRef(1)
  const sessionIdRef = useRef('')
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef<State>('idle')
  const rafRef = useRef<number>(0)

  const displayName = (assistantName && assistantName !== 'null') ? assistantName : 'Asistan'

  // Keep stateRef in sync
  useEffect(() => { stateRef.current = state }, [state])

  // Generate session ID once
  if (!sessionIdRef.current) {
    sessionIdRef.current = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
  }

  // Pick best supported mime type
  const preferredMimeType = useCallback(() => {
    if (typeof window === 'undefined') return 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
    return ''
  }, [])

  const setStatus = useCallback((s: string | null) => {
    if (stateRef.current === 'idle') return // don't update if cancelled
    setStatusText(s)
  }, [])

  // ─── VAD: detect silence and auto-stop recording ────────────────
  const startVAD = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext()
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      src.connect(analyser)
      audioCtxRef.current = ctx
      analyserRef.current = analyser

      const buffer = new Float32Array(analyser.fftSize)
      let silenceStart = 0
      const SILENCE_THRESHOLD = 0.02  // RMS threshold for silence
      const SILENCE_DURATION_MS = 1200 // 1.2s of silence triggers stop

      const detectSilence = () => {
        if (stateRef.current !== 'listening') return
        analyser.getFloatTimeDomainData(buffer)
        let sum = 0
        for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i]
        const rms = Math.sqrt(sum / buffer.length)

        if (rms < SILENCE_THRESHOLD) {
          if (silenceStart === 0) silenceStart = Date.now()
          else if (Date.now() - silenceStart > SILENCE_DURATION_MS) {
            // Silence detected long enough → stop recording
            stopRecording()
            return
          }
        } else {
          silenceStart = 0 // reset on sound
        }
        rafRef.current = requestAnimationFrame(detectSilence)
      }
      rafRef.current = requestAnimationFrame(detectSilence)
    } catch {
      // VAD not available, fall back to time-based stop
    }
  }, [])

  const stopVAD = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    analyserRef.current = null
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }, [])

  // ─── Main voice interaction pipeline ────────────────────────────
  const startInteraction = useCallback(async () => {
    if (state !== 'idle') return

    // Update turn
    const currentTurn = turnRef.current
    turnRef.current += 1

    setState('connecting')
    setTranscript(null)
    setResponse(null)
    setStatusText('Mikrofon açılıyor...')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      })
      streamRef.current = stream
      setState('listening')
      setStatusText('Dinliyorum...')

      const mimeType = preferredMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []

      const fileExt = mimeType.includes('mp4') ? 'mp4' : 'webm'
      const fileType = mimeType || 'audio/webm'

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stopVAD()
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null

        const blob = new Blob(chunksRef.current, { type: fileType })
        if (blob.size < 1000) {
          setState('idle')
          setStatusText('Ses algılanamadı')
          return
        }

        // ── 1) Transcribe ───────────────────────────────────────
        setState('transcribing')
        setStatusText('Ses işleniyor...')
        let userText = ''
        try {
          const formData = new FormData()
          formData.append('audio_file', blob, `audio.${fileExt}`)
          const transRes = await fetch('/api/ai-assistant/transcribe', {
            method: 'POST',
            body: formData,
          })
          const transData = await transRes.json()
          userText = (transData.text as string) ?? ''
        } catch {
          setState('idle')
          setStatusText('Bağlantı hatası')
          return
        }

        if (!userText) {
          setState('idle')
          setStatusText('Anlaşılamadı, tekrar deneyin')
          return
        }
        setTranscript(userText)

        // ── 2) Chat ─────────────────────────────────────────────
        setState('responding')
        setStatusText('Yanıt hazırlanıyor...')
        let reply = ''
        try {
          const chatRes = await fetch('/api/ai-assistant/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: userText,
              restaurant_slug: restaurantSlug,
              session_id: sessionIdRef.current,
              turn_number: currentTurn,
              channel: 'web_voice',
            }),
          })
          const chatData = await chatRes.json()
          reply = (chatData.response as string) ?? 'Yanıt alınamadı.'
        } catch {
          setState('idle')
          setStatusText('Bağlantı hatası')
          return
        }
        setResponse(reply)

        // ── 3) Speak (TTS) ──────────────────────────────────────
        setState('speaking')
        setStatusText('Yanıt seslendiriliyor...')
        try {
          const speakRes = await fetch('/api/ai-assistant/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: reply,
              voice_id: assistantVoice && assistantVoice !== 'yunus' ? assistantVoice : undefined,
            }),
          })
          if (speakRes.ok) {
            const audioBlob = await speakRes.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            await new Promise<void>((resolve, reject) => {
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl)
                resolve()
              }
              audio.onerror = () => {
                URL.revokeObjectURL(audioUrl)
                reject()
              }
              audio.play().catch(reject)
            })
          }
        } catch {
          // TTS error — silently continue
        }

        // ── Done — offer to continue ────────────────────────────
        setState('idle')
        setStatusText('Tekrar konuşmak için mikrofon butonuna basın')
      }

      recorder.start()

      // Start VAD silence detection
      startVAD(stream)

      // Safety timeout: if user is silent for too long
      const safetyTimeout = setTimeout(() => {
        if (recorderRef.current?.state === 'recording') {
          stopRecording()
        }
      }, 15000) // 15s max recording
      silenceTimerRef.current = safetyTimeout

    } catch {
      setState('idle')
      setStatusText('Mikrofon izni yok')
    }
  }, [state, restaurantSlug, assistantVoice, preferredMimeType, startVAD, stopVAD])

  const handleToggle = useCallback(() => {
    if (state === 'idle') {
      startInteraction()
    } else {
      // Cancel current interaction
      stopVAD()
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop()
      } else {
        recorderRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      setState('idle')
      setStatusText(null)
      setTranscript(null)
      setResponse(null)
    }
  }, [state, startInteraction, stopVAD])

  const isActive = state !== 'idle'

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="Sesli asistan"
      >
        <Phone size={22} className="text-white" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-6 z-40 w-80 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-white" />
                <span className="text-white font-semibold text-sm">{displayName}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-xs text-stone-400 mb-3">
                {restaurantName || 'İşletme'} — Sesli Rezervasyon Asistanı
              </p>

              {/* Status indicator */}
              {isActive && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-stone-800/50">
                  <span className={`w-2 h-2 rounded-full ${
                    state === 'listening' ? 'bg-red-400 animate-pulse' :
                    state === 'speaking' ? 'bg-green-400' :
                    'bg-amber-400 animate-pulse'
                  }`} />
                  <span className="text-xs text-stone-400">
                    {state === 'listening' && 'Dinliyor...'}
                    {state === 'transcribing' && 'Ses çözümleniyor...'}
                    {state === 'responding' && 'Yanıt hazırlanıyor...'}
                    {state === 'speaking' && 'Yanıt seslendiriliyor...'}
                    {state === 'connecting' && 'Bağlanıyor...'}
                  </span>
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="bg-stone-800 rounded-lg p-3 mb-3">
                  <p className="text-xs text-stone-500 mb-1">Söylenen:</p>
                  <p className="text-sm text-white">&ldquo;{transcript}&rdquo;</p>
                </div>
              )}

              {/* Response */}
              {response && (
                <div className="bg-emerald-500/10 rounded-lg p-3 mb-3">
                  <p className="text-xs text-emerald-400 mb-1">{displayName}:</p>
                  <p className="text-sm text-white">{response}</p>
                </div>
              )}

              {/* Main action button */}
              <button
                onClick={handleToggle}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  state === 'listening'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse'
                    : isActive
                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                }`}
              >
                {state === 'connecting' ? (
                  <Loader size={16} className="animate-spin" />
                ) : state === 'listening' ? (
                  <Mic size={16} />
                ) : isActive ? (
                  <Pause size={16} />
                ) : (
                  <Mic size={16} />
                )}
                {state === 'connecting' ? 'Bağlanıyor...' :
                 state === 'listening' ? 'Durdur' :
                 isActive ? 'İptal' : 'Sesli Konuş'}
              </button>

              {statusText && (
                <p className="text-xs text-stone-500 mt-3 text-center">{statusText}</p>
              )}

              {/* History summary */}
              {!isActive && (transcript || response) && (
                <p className="text-[10px] text-stone-600 text-center mt-2">
                  {transcript && response ? 'Görüşme tamamlandı' : ''}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}