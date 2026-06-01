'use client'
import { motion, useAnimation } from 'motion/react'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Props {
  initialFaved?: boolean
  onChange?:     (faved: boolean) => void
  size?:         'sm' | 'md' | 'lg'
  className?:    string
}

const SIZES = { sm: 16, md: 20, lg: 24 }
const PAD   = { sm: 'p-1.5', md: 'p-2', lg: 'p-2.5' }

export default function FavoriteButton({ initialFaved = false, onChange, size = 'md', className = '' }: Props) {
  const [faved, setFaved]     = useState(initialFaved)
  const controls              = useAnimation()

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !faved
    setFaved(next)
    onChange?.(next)

    await controls.start({
      scale: [1, 1.45, 0.88, 1.15, 1],
      rotate: [0, -12, 8, -4, 0],
      transition: { duration: 0.42, ease: 'easeInOut' },
    })

    if (next) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      confetti({
        particleCount: 20,
        startVelocity: 14,
        spread: 55,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top  + rect.height / 2) / window.innerHeight,
        },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
        scalar: 0.7,
        gravity: 1.4,
        ticks: 55,
      })
    }
  }

  return (
    <motion.button
      animate={controls}
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      className={`inline-flex items-center justify-center rounded-full transition-colors duration-200 ${PAD[size]} ${
        faved ? 'bg-red-50 text-red-500' : 'bg-white/80 text-zinc-400 hover:text-red-400'
      } ${className}`}
      aria-label={faved ? 'Favorilerden çıkar' : 'Favorilere ekle'}
    >
      <Heart
        style={{ width: SIZES[size], height: SIZES[size] }}
        fill={faved ? 'currentColor' : 'none'}
        strokeWidth={faved ? 0 : 2}
      />
    </motion.button>
  )
}
