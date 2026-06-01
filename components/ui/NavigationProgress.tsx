'use client'

import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NavigationProgress() {
  const pathname  = usePathname()
  const [pct, setPct]     = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setPct(0)

    const t1 = setTimeout(() => setPct(65),  80)
    const t2 = setTimeout(() => setPct(90),  500)
    const t3 = setTimeout(() => setPct(100), 700)
    const t4 = setTimeout(() => setVisible(false), 1050)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 z-[99999] h-[2.5px] bg-[#E53935]"
          style={{
            width: `${pct}%`,
            willChange: 'width',
            boxShadow: '0 0 8px rgba(229,57,53,0.7)',
          }}
          initial={{ opacity: 1 }}
          animate={{ width: `${pct}%` }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        />
      )}
    </AnimatePresence>
  )
}
