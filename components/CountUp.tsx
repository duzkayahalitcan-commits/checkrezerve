'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  to: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export default function CountUp({ to, duration = 1.2, suffix = '', prefix = '', className }: Props) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const step = (now: number) => {
          const progress = Math.min((now - start) / (duration * 1000), 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(eased * to))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }, { threshold: 0.5 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [to, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{value}{suffix}
    </span>
  )
}
