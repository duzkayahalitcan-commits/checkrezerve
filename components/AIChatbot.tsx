'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Send, Mic, MicOff, Sparkles } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

interface AIChatbotProps {
  /** İşletme ID'si — API'ye gönderilir, feature flag + bilgi çekilir */
  restaurantId?: string
  /** Sesli giriş (mikrofon butonu) gösterilsin mi? */
  hasVoice?: boolean
}

const WELCOME_GENERAL: Message = {
  role: 'assistant',
  content: 'Merhaba! Ben CheckRezerve\'in AI asistanıyım. Size nasıl yardımcı olabilirim? ✨',
}

const WELCOME_BUSINESS: Message = {
  role: 'assistant',
  content: 'Merhaba! Bu işletme hakkında sorularınızı yanıtlayabilirim. Size nasıl yardımcı olabilirim? ✨',
}

const QUICK_REPLIES = [
  'Rezervasyon nasıl yapılır?',
  'Müsait saatler neler?',
  'İptal politikası nedir?',
]

export default function AIChatbot({
  restaurantId,
  hasVoice = false,
}: AIChatbotProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(
    restaurantId ? [WELCOME_BUSINESS] : [WELCOME_GENERAL]
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Re-initialize welcome message if restaurantId changes
  useEffect(() => {
    setMessages(restaurantId ? [WELCOME_BUSINESS] : [WELCOME_GENERAL])
  }, [restaurantId])

  // Scroll to bottom when messages change or open
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [messages, open])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const apiMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          restaurant_id: restaurantId ?? null,
        }),
      })

      const json = await res.json()
      if (res.status === 403) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'AI asistanı bu işletme için şu anda aktif değil.' }])
      } else if (json.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: json.message }])
      } else if (json.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Bir hata oluştu, lütfen tekrar deneyin.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.' }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // Sesli giriş (hasVoice)
  const handleVoiceToggle = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, tarayıcınız sesli girişi desteklemiyor.' }])
      return
    }

    if (!listening) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition: any = new SpeechRecognition()
      recognition.lang = 'tr-TR'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => setListening(true)
      recognition.onend = () => setListening(false)
      recognition.onerror = () => setListening(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (transcript.trim()) {
          setInput(transcript.trim())
          sendMessage(transcript.trim())
        }
      }

      recognition.start()
    } else {
      setListening(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center hover:shadow-purple-500/50 hover:scale-110 transition-all active:scale-95"
            aria-label="AI Asistanı Aç"
          >
            <Sparkles size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] max-h-[600px] max-h-[calc(100vh-120px)] rounded-2xl bg-white shadow-2xl shadow-purple-500/15 border border-purple-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-tight">
                    {restaurantId ? 'İşletme Asistanı' : 'CheckRezerve AI'}
                  </div>
                  <div className="text-[10px] text-purple-200 leading-tight">
                    Yapay Zeka Asistanı
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-purple-50/30">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-md'
                        : 'bg-white text-zinc-700 rounded-bl-md border border-purple-100 shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-md border border-purple-100 shadow-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0 bg-purple-50/50 border-t border-purple-50">
                {QUICK_REPLIES.map(reply => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    disabled={loading}
                    className="flex-none px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-purple-100 bg-white shrink-0">
              {hasVoice && (
                <button
                  onClick={handleVoiceToggle}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    listening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                  title={listening ? 'Dinleniyor...' : 'Sesli mesaj'}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mesajınızı yazın..."
                disabled={loading}
                className="flex-1 bg-purple-50 border border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
