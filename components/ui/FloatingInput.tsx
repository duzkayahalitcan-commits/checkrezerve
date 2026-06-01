'use client'
import { motion, AnimatePresence } from 'motion/react'
import { useId, useState, forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label:    string
  error?:   string
  hint?:    string
}

export const FloatingInput = forwardRef<HTMLInputElement, Props>(function FloatingInput(
  { label, error, hint, className = '', id: propId, ...rest },
  ref,
) {
  const autoId  = useId()
  const id      = propId ?? autoId
  const [focused, setFocused] = useState(false)
  const hasValue = Boolean(rest.value || rest.defaultValue)
  const lifted   = focused || hasValue

  return (
    <div className="relative">
      <div
        className={[
          'relative rounded-xl border transition-all duration-200',
          focused ? 'border-red-500 shadow-[0_0_0_3px_rgba(229,57,53,0.12)]' : 'border-zinc-200',
          error   ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : '',
          'bg-white',
        ].join(' ')}
      >
        <label
          htmlFor={id}
          className={[
            'absolute left-3.5 transition-all duration-200 pointer-events-none select-none z-10',
            lifted
              ? 'text-[11px] font-semibold top-2 ' + (error ? 'text-red-500' : focused ? 'text-red-600' : 'text-zinc-500')
              : 'text-sm top-1/2 -translate-y-1/2 text-zinc-400',
          ].join(' ')}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          onFocus={e => { setFocused(true); rest.onFocus?.(e) }}
          onBlur={e  => { setFocused(false); rest.onBlur?.(e)  }}
          className={[
            'block w-full rounded-xl bg-transparent px-3.5 pb-2.5 pt-5 text-sm text-zinc-900',
            'outline-none placeholder:text-transparent',
            className,
          ].join(' ')}
          placeholder={label}
          {...rest}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            className="text-xs text-red-500 mt-1.5 ml-1"
            initial={{ opacity: 0, y: -4, x: 0 }}
            animate={{ opacity: 1, y: 0, x: [0, -4, 4, -3, 3, 0] }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4, x: { duration: 0.35, ease: 'easeInOut' } }}
          >
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <motion.p
            key="hint"
            className="text-xs text-zinc-400 mt-1.5 ml-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})
