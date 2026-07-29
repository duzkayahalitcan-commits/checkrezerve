// KURAL: Hero ve above-the-fold bileşenler whileInView KULLANMAZ. Scroll trigger sadece sayfanın alt yarısındaki section'lar için. Image wrapper'da opacity animasyonu yasak.

'use client'

import { motion } from 'motion/react'

export default function RevealSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
