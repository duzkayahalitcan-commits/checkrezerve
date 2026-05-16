'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { routing } from '@/i18n/routing'

const FLAGS: Record<string, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  de: '🇩🇪',
}

const LABELS: Record<string, string> = {
  tr: 'TR',
  en: 'EN',
  de: 'DE',
}

export default function LanguageSelector() {
  const t = useTranslations('langSelector')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchLocale(next: string) {
    if (next === locale) { setOpen(false); return }

    // Strip current locale prefix from pathname.
    // With localePrefix:'always', pathname is e.g. /tr/rezervasyon or /en/
    let pathWithoutLocale = '/'
    for (const loc of routing.locales) {
      if (pathname.startsWith(`/${loc}/`)) {
        // /tr/rezervasyon → /rezervasyon
        pathWithoutLocale = pathname.slice(loc.length + 1)
        break
      } else if (pathname === `/${loc}`) {
        pathWithoutLocale = '/'
        break
      }
    }

    const target = pathWithoutLocale === '/'
      ? `/${next}`
      : `/${next}${pathWithoutLocale}`

    router.push(target)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('label')}
        className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
      >
        <span>{FLAGS[locale]}</span>
        <span>{LABELS[locale]}</span>
        <svg
          className={`w-3 h-3 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-zinc-100 bg-white py-1 shadow-lg z-50">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 ${
                loc === locale ? 'font-semibold text-zinc-900' : 'text-zinc-600'
              }`}
            >
              <span>{FLAGS[loc]}</span>
              <span>{t(loc as 'tr' | 'en' | 'de')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
