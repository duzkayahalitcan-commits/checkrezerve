'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { Phone, Mic, X, Loader, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

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
  assistantVoice = 'yunus',
}: Props) {
  const [open, setOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [turnNumber, setTurnNumber] = useState(1)
  const sessionIdRef = useRef<string>('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Generate session ID once
  if (!sessionIdRef.current) {
    sessionIdRef.current = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
  }

  const displayName = assistantName || restaurantName || 'Asistan'

  // Pick best supported mime type
  const preferredMimeType = useMemo(() => {
    if (typeof window === 'undefined') return 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
    return ''
  }, [])
  const fileExt = preferredMimeType.includes('mp4') ? 'mp4' : 'webm'
  const fileType = preferredMimeType || 'audio/webm'

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const startRecordAndProcess = useCallback(async () => {
    if (listening) {
      stopRecording()
      return
    }

    setConnecting(true)
    setStatus('Mikrofon açılıyor...')
    setTranscript(null)
    setResponse(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })
      setStatus('🎤 Dinliyorum...')
      setListening(true)
      setConnecting(false)

      // Use supported mime type with fallback
      let recorder: MediaRecorder
      if (!preferredMimeType) {
        recorder = new MediaRecorder(stream)
      } else {
        recorder = new MediaRecorder(stream, { mimeType: preferredMimeType })
      }
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        setListening(false)
        setStatus('Ses işleniyor...')
        stream.getTracks().forEach(t => t.stop())

        const blob = new Blob(chunksRef.current, { type: fileType })
        if (blob.size < 1000) {
          setStatus('Ses algılanamadı, tekrar deneyin')
          return
        }

        try {
          // 1. Transcribe
          const formData = new FormData()
          formData.append('audio_file', blob, `audio.${fileExt}`)
          const transRes = await fetch('/api/ai-assistant/transcribe', {
            method: 'POST',
            body: formData,
          })
          const transData = await transRes.json()
          const userText = (transData.text as string) ?? ''
          setTranscript(userText)

          if (!userText) {
            setStatus('Ses anlaşılamadı')
            return
          }

          // 2. Chat (response now includes cached & cacheUrl)
          setStatus('Yanıt hazırlanıyor...')
          const currentTurn = turnNumber
          setTurnNumber(n => n + 1)
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
          const reply = (chatData.response as string) ?? 'Yanıt alınamadı.'
          setResponse(reply)
          setStatus(null)

          // 3. Play audio — speak API is backed by disk cache (x-cache: HIT in ~0.2s)
          setStatus('🔊 Sesli yanıt hazırlanıyor...')
          try {
            const speakRes = await fetch('/api/ai-assistant/speak', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: reply,
                voice_id: assistantVoice === 'yunus' ? undefined : assistantVoice,
              }),
            })
            if (speakRes.ok) {
              const audioBlob = await speakRes.blob()
              const audioUrl = URL.createObjectURL(audioBlob)
              const audio = new Audio(audioUrl)
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl)
                setStatus(null)
              }
              audio.play().catch(() => setStatus(null))
            } else {
              setStatus(null)
            }
          } catch {
            // TTS hatası — konuşma metni zaten gösteriliyor, sessiz devam
            setStatus(null)
          }
        } catch {
          setStatus('Bağlantı hatası')
          setListening(false)
        }
      }

      recorder.start()

      // Auto-stop after 7 seconds of silence
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording()
        }
      }, 7000)
    } catch {
      setStatus('Mikrofon izni reddedildi')
      setConnecting(false)
    }
  }, [restaurantSlug, listening, stopRecording, preferredMimeType, fileType, fileExt, assistantVoice])

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
                {restaurantName} — {displayName} ile sesli rezervasyon
              </p>

              {/* Transkript */}
              {transcript && (
                <div className="bg-stone-800 rounded-lg p-3 mb-3">
                  <p className="text-xs text-stone-500 mb-1">Söylenen:</p>
                  <p className="text-sm text-white">&ldquo;{transcript}&rdquo;</p>
                </div>
              )}

              {/* Yanıt */}
              {response && (
                <div className="bg-emerald-500/10 rounded-lg p-3 mb-3">
                  <p className="text-xs text-emerald-400 mb-1">{displayName}:</p>
                  <p className="text-sm text-white">{response}</p>
                </div>
              )}

              {/* Buton */}
              <button
                onClick={startRecordAndProcess}
                disabled={connecting}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                  listening
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                }`}
              >
                {connecting ? (
                  <Loader size={16} className="animate-spin" />
                ) : listening ? (
                  <Mic size={16} />
                ) : (
                  <Mic size={16} />
                )}
                {connecting ? 'Bağlanıyor...' : listening ? 'Durdur' : '🎤 Sesli Konuş'}
              </button>

              {status && (
                <p className="text-xs text-stone-500 mt-3 text-center">{status}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
