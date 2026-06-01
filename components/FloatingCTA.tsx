'use client'
import { motion, useScroll, useMotionValueEvent } from 'motion/react'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { CalendarPlus } from 'lucide-react'

interface Props {
  href:  string
  label: string
}

export default function FloatingCTA({ href, label }: Props) {
  const [visible, setVisible] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setVisible(y > 300)
  })

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <Link href={href as never}>
        <motion.div
          className="flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl px-5 py-3.5 shadow-xl shadow-red-500/35 font-semibold text-sm"
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(229,57,53,0.4)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        >
          <CalendarPlus className="w-4 h-4" />
          {label}
        </motion.div>
      </Link>
    </motion.div>
  )
}
