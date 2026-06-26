'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { completeOnboarding } from './actions'
import { motion } from 'motion/react'

export default function Step5Complete({
  slug,
  summary,
}: {
  slug: string
  summary: { services: number; staff: number; tables: number }
}) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleComplete() {
    setLoading(true)
    const res = await completeOnboarding()
    setLoading(false)
    if (res.success) {
      setDone(true)
      toast.show('Kurulum tamamlandı! 🎉', 'success')
      // Redirect to panel dashboard
      setTimeout(() => router.push(`/panel/${slug}`), 1200)
    } else {
      toast.show(res.error ?? 'Hata', 'error')
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
        >
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-2">Panele yönlendiriliyorsunuz...</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#2B1B17] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/20">
          <span className="text-3xl font-black text-white">✓</span>
        </div>
      </motion.div>

      <h1 className="text-2xl font-bold text-white">Kurulum Tamamlandı!</h1>
      <p className="text-stone-400 text-sm">İşletmeniz hazır. İşte özet:</p>

      <div className="bg-stone-800 border border-stone-700 rounded-2xl p-6 space-y-4 text-left">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Özet</h2>

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard icon="📋" label="Hizmet" count={summary.services} />
          <SummaryCard icon="👤" label="Çalışan" count={summary.staff} />
          <SummaryCard icon="🪑" label="Masa" count={summary.tables} />
        </div>

        {summary.services > 0 && (
          <p className="text-xs text-stone-500 text-center mt-2">
            Müşterileriniz artık online rezervasyon yapabilir!
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleComplete}
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-[#E53935] to-red-700 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-500 hover:to-red-800 disabled:opacity-60"
        >
          {loading ? 'Açılıyor...' : '🚀 Panele Geç'}
        </button>

        {summary.services > 0 && (
          <a
            href={`/${slug}`}
            target="_blank"
            className="text-sm text-[#D4A373] hover:text-amber-400 transition-colors underline underline-offset-2"
          >
            Rezervasyon sayfanı gör →
          </a>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-white">{count}</div>
      <div className="text-xs text-stone-400">{label}</div>
    </div>
  )
}
