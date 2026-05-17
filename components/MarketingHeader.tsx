'use client'
import { useState } from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import LanguageSelector from './LanguageSelector'

export default function MarketingHeader() {
  const t = useTranslations('nav')
  const [mobileOpen, setMobileOpen] = useState(false)

  const NAV_LINKS = [
    { href: '/ozellikler',        label: t('features') },
    { href: '/kullanim-alanlari', label: t('useCases') },
    { href: '/#pricing',           label: t('pricing') },
    { href: '/rezervasyon',       label: t('makeReservation') },
    { href: '/blog',              label: t('blog') },
    { href: '/hakkimizda',        label: t('about') },
    { href: '/iletisim',          label: t('contact') },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-sm">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <NextLink href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <Image src="/logo-icon.png" alt="CheckRezerve" width={36} height={36} className="rounded-xl" priority />
          <span className="text-base font-bold tracking-tight text-zinc-900">CheckRezerve</span>
        </NextLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm text-zinc-500">
          {NAV_LINKS.map(l => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link key={l.href} href={l.href as any}
              className="hover:text-zinc-900 transition-colors font-medium">
              {l.label}
            </Link>
          ))}
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
            className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-100 bg-white px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(l => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link key={l.href} href={l.href as any} onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 py-2 border-b border-zinc-50 last:border-0">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 pb-1">
            <LanguageSelector />
          </div>
          <div className="pt-2 flex gap-3">
            <NextLink href="/panel/login" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center rounded-full border border-red-600 text-red-600 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors">
              {t('login')}
            </NextLink>
            <Link href="/kayit" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center rounded-full bg-red-600 text-white py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors">
              {t('startFree')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
