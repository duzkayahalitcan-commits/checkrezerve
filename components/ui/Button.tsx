'use client'
import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef, useState, useCallback } from 'react'
import { Check, Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?:  Variant
  size?:     Size
  loading?:  boolean
  success?:  boolean
  children:  React.ReactNode
}

type Ripple = { id: number; x: number; y: number; size: number }

const BASE = 'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden select-none'

const SIZE: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const VARIANT: Record<Variant, string> = {
  primary:   'text-white shadow-lg shadow-red-500/25',
  secondary: 'bg-white text-zinc-800 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm',
  ghost:     'text-zinc-700 hover:bg-zinc-100',
  danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
}

let rippleCounter = 0

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, success, children, className = '', disabled, onClick, ...props },
  ref,
) {
  const isPrimary  = variant === 'primary'
  const isDisabled = disabled || loading
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const rect = e.currentTarget.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const x    = e.clientX - rect.left - size / 2
      const y    = e.clientY - rect.top  - size / 2
      const id   = ++rippleCounter
      setRipples(prev => [...prev, { id, x, y, size }])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700)
    }
    onClick?.(e)
  }, [isDisabled, onClick])

  const rippleColor = isPrimary ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)'

  return (
    <motion.button
      ref={ref}
      className={`${BASE} ${SIZE[size]} ${VARIANT[variant]} ${className}`}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled  ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {/* Gradient background for primary */}
      {isPrimary && (
        <span
          className="absolute inset-0 -z-0"
          style={{
            background: success
              ? 'linear-gradient(135deg,#16a34a,#15803d)'
              : 'linear-gradient(135deg,#E53935,#C62828)',
            transition: 'background 0.4s ease',
          }}
        />
      )}

      {/* Shine sweep on hover */}
      {isPrimary && (
        <motion.span
          className="absolute inset-0 -z-0 opacity-0"
          style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%)' }}
          whileHover={{ opacity: 1, x: ['-100%', '100%'] }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Ripple effects */}
      {ripples.map(r => (
        <motion.span
          key={r.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: r.x,
            top:  r.y,
            width: r.size,
            height: r.size,
            background: rippleColor,
            willChange: 'transform, opacity',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
        />
      ))}

      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <Check className="w-4 h-4" />
        ) : null}
        {!loading && children}
        {loading && <span className="opacity-0 absolute">{children}</span>}
      </span>
    </motion.button>
  )
})
