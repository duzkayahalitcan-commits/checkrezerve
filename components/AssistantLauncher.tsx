'use client'

import { useState } from 'react'
import { Sparkles, Phone, MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import FloatingAIAssistant, { type CallVariant } from '@/components/FloatingAIAssistant'
import AIChatbot from '@/components/AIChatbot'

interface AssistantLauncherProps {
  restaurantId: string
  restaurantName: string
  restaurantSlug: string
  assistantName?: string | null
  assistantVoice?: string | null
  backgroundImage?: string | null
  businessType?: string | null
  /** Çağrı arayüzü tasarım varyantı */
  variant?: CallVariant
}

type Mode = 'closed' | 'menu' | 'voice' | 'chat'

/**
 * Tek bir premium AI asistan butonu: kullanıcı tıklayınca sesli görüşme
 * veya yazılı sohbet seçebilir. (Apple/Hallmark: tek odak, sade, yumuşak mikro
 * etkileşimler.) WhatsApp'ı ve diğer butonları rezervasyon sayfasından
 * kaldırarak kalabalığı önler.
 */
export default function AssistantLauncher({
  restaurantId,
  restaurantName,
  restaurantSlug,
  assistantName,
  assistantVoice,
  backgroundImage,
  businessType,
  variant = 'glass',
}: AssistantLauncherProps) {
  const [mode, setMode] = useState<Mode>('closed')

  // Sesli görüşme ya da yazılı sohbet açılınca alt bileşeni mount et
  const showVoice = mode === 'voice'
  const showChat = mode === 'chat'

  return (
    <>
      {/* Tek premium tetikleyici buton */}
      <AnimatePresence>
        {mode === 'closed' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setMode('menu')}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-zinc-900 to-black text-white shadow-xl flex items-center justify-center border border-white/15 hover:scale-105 active:scale-95 transition-all"
            aria-label="AI asistanı aç"
          >
            <Sparkles size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mod seçim menüsü (voice birincil, chat ikincil) */}
      <AnimatePresence>
        {mode === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setMode('closed')}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs rounded-3xl bg-white shadow-2xl p-5 text-center"
            >
              <button
                onClick={() => setMode('closed')}
                className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 transition-colors"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-white" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">AI Asistan</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-5">Nasıl yardımcı olabilirim?</p>

              <div className="space-y-2">
                <button
                  onClick={() => setMode('voice')}
                  className="w-full flex items-center gap-3 rounded-2xl bg-zinc-900 text-white px-4 py-3.5 text-sm font-semibold transition-all hover:bg-zinc-800 active:scale-[0.98]"
                >
                  <Phone size={18} />
                  Sesli Görüşme
                </button>
                <button
                  onClick={() => setMode('chat')}
                  className="w-full flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm font-semibold text-zinc-800 transition-all hover:bg-zinc-50 active:scale-[0.98]"
                >
                  <MessageCircle size={18} />
                  Yazılı Sohbet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sesli görüşme (FloatingAIAssistant) — mount edilince açılır */}
      {showVoice && (
        <FloatingAIAssistant
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          restaurantSlug={restaurantSlug}
          assistantName={assistantName}
          assistantVoice={assistantVoice}
          backgroundImage={backgroundImage}
          businessType={businessType}
          variant={variant}
          initialOpen
          onCloseRequest={() => setMode('closed')}
        />
      )}

      {/* Yazılı sohbet (AIChatbot) */}
      {showChat && (
        <AIChatbot
          restaurantId={restaurantId}
          hasVoice={true}
          initialOpen
          onCloseRequest={() => setMode('closed')}
        />
      )}
    </>
  )
}
