'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Send, Trash2 } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const WELCOME: Message = {
  role: 'assistant',
  content: 'Merhaba! Rezervasyon için yardımcı olabilirim 👋 Nasıl yardımcı olabilirim?',
}
const STORAGE_KEY     = 'cr_chat_history'
const STORAGE_TS_KEY  = 'cr_chat_ts'
const STORAGE_EXPIRY  = 4 * 60 * 60 * 1000 // 4 saat
const MAX_STORED      = 50

const QUICK_REPLIES = ['Rezervasyon yaptır', 'İşletme bul', 'Nasıl çalışır?']

export default function ChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  // Load chat history with expiry check
  useEffect(() => {
    try {
      const ts = sessionStorage.getItem(STORAGE_TS_KEY)
      if (ts) {
        const elapsed = Date.now() - Number(ts)
        if (elapsed > STORAGE_EXPIRY) {
          sessionStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(STORAGE_TS_KEY)
          return // keep fresh welcome
        }
      }
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Message[]
        if (parsed.length > 0) setMessages(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  // Persist to sessionStorage + update timestamp
  useEffect(() => {
    if (messages.length === 1 && messages[0].content === WELCOME.content) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)))
      sessionStorage.setItem(STORAGE_TS_KEY, String(Date.now()))
    } catch { /* ignore */ }
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open, messages])

  const resetChat = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_TS_KEY)
    setMessages([WELCOME])
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const userMsg: Message = { role: 'user', content: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          businessName: 'CheckRezerve',
          businessType: 'platform',
        }),
      })
      const data = (await res.json()) as { message?: string }
      setMessages(prev => [...prev, { role: 'assistant', content: data.message ?? 'Bir hata oluştu.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bağlantı hatası. Lütfen tekrar deneyin.' }])
    } finally {
      setLoading(false)
    }
  }

  const showQuickReplies = messages.length <= 2

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="w-full sm:w-96 rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/12 overflow-hidden flex flex-col"
            style={{ maxHeight: '72vh', willChange: 'transform' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-white text-xs tracking-tight">
                  CR
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">CheckRezerve</p>
                  <p className="text-red-200 text-[10px] mt-0.5">Online · Hemen yanıt verir</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    onClick={resetChat}
                    title="Yeni sohbet"
                    className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-red-600 text-white rounded-br-sm'
                        : 'bg-zinc-100 text-zinc-800 rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {showQuickReplies && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
                {QUICK_REPLIES.map(r => (
                  <button
                    key={r}
                    onClick={() => send(r)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-zinc-100 px-3 py-3 flex gap-2 items-center flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
                placeholder="Mesajınızı yazın…"
                className="flex-1 text-sm bg-zinc-50 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 border border-zinc-200 focus:border-red-400 transition-all"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-red-700 transition-colors flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <div className="relative">
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 z-10 animate-ping" />
        )}
        <motion.button
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center"
          style={{ willChange: 'transform', boxShadow: '0 8px 32px rgba(229,57,53,0.4)' }}
          aria-label="Chatbot'u aç/kapat"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}
