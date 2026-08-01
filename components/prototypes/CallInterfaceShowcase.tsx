'use client'

import { motion } from 'motion/react'
import { Phone, Mic, Volume2 } from 'lucide-react'
import { SECTOR_GRADIENTS } from '@/lib/backgrounds'

/**
 * Prototip vitrin: Çağrı asistanı arayüzünün 3 tasarım varyantı.
 * (apple-design + hallmark ilkeleri: temiz, minimal, ferah, buzlubuz
 * derinlik, tutarlı vurgu, yumuşak mikro etkileşimler.)
 * Üretimde kullanılan gerçek bileşen: components/FloatingAIAssistant.tsx
 * (variant prop: 'glass' | 'dark' | 'brand'). Bu sayfa yalnızca önizleme içindir.
 */

type VariantDef = {
  id: 'glass' | 'dark' | 'brand'
  title: string
  desc: string
  border: string
  overlay: string
  accent: string
}

const VARIANTS: VariantDef[] = [
  {
    id: 'glass',
    title: 'Glass (Varsayılan)',
    desc: 'Buzlu cam (frosted glass), işletme arka planı üstünde derinlik. Apple tarzı minimal.',
    border: 'border-white/20',
    overlay: 'bg-white/10 backdrop-blur-xl',
    accent: 'from-emerald-400 to-teal-400',
  },
  {
    id: 'dark',
    title: 'Dark',
    desc: 'Koyu, sade ve sofistike. İşletme görseli üstünde hafif karartma, sessiz zarafet.',
    border: 'border-white/10',
    overlay: 'bg-black/30',
    accent: 'from-stone-200 to-stone-400',
  },
  {
    id: 'brand',
    title: 'Brand',
    desc: 'Sıcak amber vurgular — işletme kimliğini öne çıkaran prestijli görünüm.',
    border: 'border-amber-500/25',
    overlay: 'bg-black/45',
    accent: 'from-amber-500 to-orange-500',
  },
]

function MockCall({ v, phase }: { v: VariantDef; phase: 'idle' | 'mic' | 'speaking' }) {
  const gradient = SECTOR_GRADIENTS.restaurant
  return (
    <div
      className={`relative w-full max-w-[300px] rounded-[28px] overflow-hidden border ${v.border} shadow-2xl`}
      style={{ background: gradient }}
    >
      <div className={`absolute inset-0 ${v.overlay} pointer-events-none`} />
      <div className="relative px-6 pt-10 pb-6 flex flex-col items-center text-center">
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br ${v.accent} shadow-lg`}>
          {phase === 'speaking' ? (
            <Volume2 size={22} className="text-white" />
          ) : phase === 'mic' ? (
            <Mic size={22} className="text-white" />
          ) : (
            <Phone size={22} className="text-white/80" />
          )}
          {phase === 'mic' && <span className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-50" />}
        </div>
        {phase === 'speaking' && (
          <div className="flex items-center gap-1 mb-3 h-6">
            {[1,2,3,4,5].map(i => (
              <motion.div key={i} animate={{ height: [6, 20 - i * 2, 6] }} transition={{ repeat: Infinity, duration: 0.8 + i * 0.1 }} className="w-1 rounded-full bg-gradient-to-t from-white/70 to-white" />
            ))}
          </div>
        )}
        <p className="text-white font-semibold text-base mb-0.5">Asistan</p>
        <p className="text-white/60 text-xs mb-4">İşletme Adı</p>
        <button className={`px-6 py-2 rounded-full text-white text-xs font-semibold bg-gradient-to-r ${v.accent} shadow`}>
          Sesli Görüşme
        </button>
      </div>
    </div>
  )
}

export default function CallInterfaceShowcase() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Çağrı Asistanı Arayüzü — 3 Varyant</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Üretimde kullanılan bileşen <code className="text-zinc-300">FloatingAIAssistant</code> <code className="text-zinc-300">variant</code> prop&apos;u ile
          bu 3 tasarımı destekler. Varsayılan: <strong className="text-white">glass</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VARIANTS.map(v => (
            <div key={v.id} className="flex flex-col items-center gap-3">
              <MockCall v={v} phase="idle" />
              <div className="text-center">
                <p className="font-semibold text-white">{v.title}</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
