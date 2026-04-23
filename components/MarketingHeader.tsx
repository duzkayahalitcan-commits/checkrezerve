'use client'
import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/ozellikler',        label: 'Özellikler' },
  { href: '/kullanim-alanlari', label: 'Kullanım Alanları' },
  { href: '/#fiyatlar',         label: 'Fiyatlar' },
  { href: '/blog',              label: 'Blog' },
  { href: '/hakkimizda',        label: 'Hakkımızda' },
  { href: '/iletisim',          label: 'İletişim' },
]

export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-sm">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-sm group-hover:bg-red-700 transition-colors">
            <span className="text-white text-xs font-bold">CR</span>
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-900">CheckRezerve</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm text-zinc-500">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="hover:text-zinc-900 transition-colors font-medium">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-3">
          <Link href="/kayit"
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm">
            Ücretsiz Başlayın →
          </Link>
          <Link href="/panel/login"
            className="hidden sm:block rounded-full border border-zinc-300 text-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-50 transition-colors">
            Giriş Yap
          </Link>
          <button
            className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menüyü aç/kapat"
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
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 py-2 border-b border-zinc-50 last:border-0">
              {l.label}
            </Link>
          ))}
          <div className="pt-4 flex gap-3">
            <Link href="/panel/login" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center rounded-full border border-red-600 text-red-600 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors">
              Giriş Yap
            </Link>
            <Link href="/kayit" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center rounded-full bg-red-600 text-white py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors">
              Ücretsiz Deneyin
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
