'use client'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  value?:     number        // current rating (0-5)
  max?:       number
  onChange?:  (v: number) => void
  readOnly?:  boolean
  size?:      number
  className?: string
}

export default function RatingStars({ value = 0, max = 5, onChange, readOnly = false, size = 18, className = '' }: Props) {
  const [hovered, setHovered] = useState(0)
  const display = readOnly ? value : (hovered || value)

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      onMouseLeave={() => !readOnly && setHovered(0)}
      aria-label={`${value} / ${max} yıldız`}
    >
      {Array.from({ length: max }, (_, i) => {
        const index  = i + 1
        const filled = index <= display
        return (
          <motion.button
            key={i}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(index)}
            onClick={() => !readOnly && onChange?.(index)}
            whileHover={!readOnly ? { scale: 1.25, y: -2 } : undefined}
            whileTap={!readOnly  ? { scale: 0.9  }         : undefined}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="focus:outline-none disabled:cursor-default"
            style={{ color: filled ? '#f59e0b' : '#e4e4e7' }}
          >
            <Star
              style={{ width: size, height: size }}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={filled ? 0 : 1.5}
            />
          </motion.button>
        )
      })}
    </div>
  )
}
