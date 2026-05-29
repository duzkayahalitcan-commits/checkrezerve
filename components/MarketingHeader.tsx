'use client'
import { useState, useEffect } from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'motion/react'
import LanguageSelector from './LanguageSelector'

export default function MarketingHeader() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const NAV_LINKS = [
    { href: '/ozellikler',        label: t('features') },
    { href: '/kullanim-alanlari', label: t('useCases') },
    { href: '/pricing',           label: t('pricing') },
    { href: '/rezervasyon',       label: t('makeReservation') },
  ]

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2.5 group flex-shrink-0">
            <Image src="/logo-icon.png" alt="CheckRezerve" width={36} height={36} className="rounded-xl" priority />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-zinc-900">CheckRezerve</span>
              <span className="text-[10px] italic text-zinc-400 font-normal mt-0.5">Saniyeler içinde rezervasyon</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm text-zinc-500">
            {NAV_LINKS.map(l => {
              const isActive = pathname.startsWith(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href as never}
                  className={`relative font-medium transition-colors pb-0.5 ${isActive ? 'text-zinc-900' : 'hover:text-zinc-900'}`}
                >
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* CTA + Language + Hamburger */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link href="/kayit"
              className="hidden sm:block rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm">
              {t('startFree')}
            </Link>
            <NextLink href="/panel/login"
              className="hidden sm:block rounded-full border border-zinc-300 text-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition-colors">
              {t('login')}
            </NextLink>
            <button
              className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors z-[60] relative"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={t('openMenu')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden flex flex-col"
            style={{ background: '#0a0a0a' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col justify-center h-full px-8 pt-20 pb-10 gap-2">
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link
                    href={l.href as never}
                    onClick={() => setMobileOpen(false)}
                    className="block py-4 text-3xl font-black text-white hover:text-red-400 transition-colors border-b border-white/10"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="flex flex-col gap-3 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + NAV_LINKS.length * 0.07 + 0.05, duration: 0.4 }}
              >
                <Link href="/kayit" onClick={() => setMobileOpen(false)}
                  className="w-full text-center rounded-full bg-red-600 text-white py-3.5 text-base font-bold hover:bg-red-700 transition-colors">
                  {t('startFree')}
                </Link>
                <NextLink href="/panel/login" onClick={() => setMobileOpen(false)}
                  className="w-full text-center rounded-full border border-white/20 text-white py-3.5 text-base font-semibold hover:bg-white/10 transition-colors">
                  {t('login')}
                </NextLink>
              </motion.div>

              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08 + (NAV_LINKS.length + 1) * 0.07, duration: 0.4 }}
              >
                <LanguageSelector />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  )
}
