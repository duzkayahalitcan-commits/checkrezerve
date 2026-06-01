'use client'
import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function PageTransition({ children, className }: Props) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{    opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
