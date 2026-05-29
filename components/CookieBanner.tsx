'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookie-consent')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie-consent', 'false')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-0"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="sm:max-w-2xl sm:mx-auto sm:mb-6 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-700 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-2xl shrink-0">🍪</div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-0.5">Çerez Politikası</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                KVKK kapsamında deneyiminizi iyileştirmek için çerezler kullanıyoruz.{' '}
                <Link href="/cerez-politikasi" className="text-red-400 hover:underline">
                  Çerez Politikası
                </Link>
                {' '}ve{' '}
                <Link href="/gizlilik" className="text-red-400 hover:underline">
                  Gizlilik Politikası
                </Link>
                'mızı inceleyebilirsiniz.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 rounded-full border border-zinc-600 text-zinc-300 text-sm hover:border-zinc-400 transition-colors"
              >
                Reddet
              </button>
              <motion.button
                onClick={accept}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Kabul Et
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
