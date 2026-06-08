'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from '@/i18n/navigation'

// Kill browser scroll restoration ASAP — before React even hydrates
if (typeof window !== 'undefined') {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
}

interface LenisInstance {
  destroy(): void
  raf(t: number): void
  scrollTo(y: number, opts: { immediate: boolean }): void
}

export default function SmoothScroll() {
  const pathname = usePathname()
  const lenisRef = useRef<LenisInstance | null>(null)

  useEffect(() => {
    if (pathname.startsWith('/panel') || pathname.startsWith('/rezervasyon')) return

    window.scrollTo(0, 0)
    let stopped = false

    async function start() {
      const raw = await initLenis()
      if (stopped || !raw) return
      const lenis = raw as unknown as LenisInstance
      lenisRef.current = lenis
      lenis.scrollTo(0, { immediate: true })

      function raf(time: number) {
        if (stopped) return
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
    }

    start()

    return () => {
      stopped = true
      lenisRef.current?.destroy()
      lenisRef.current = null
      document.documentElement.classList.remove('lenis', 'lenis-smooth')
    }
  }, [pathname])

  return null
}

let cachedLenis: Promise<unknown> | null = null

async function initLenis(): Promise<unknown> {
  if (cachedLenis) return cachedLenis
  cachedLenis = (async () => {
    const mod = await import('lenis')
    return new mod.default({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    })
  })()
  return cachedLenis
}
