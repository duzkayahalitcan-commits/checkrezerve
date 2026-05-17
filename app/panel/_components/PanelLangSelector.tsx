'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'

const LOCALES = [
  { code: 'tr', flag: '🇹🇷', label: 'TR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'ar', flag: '🇸🇦', label: 'AR' },
  { code: 'da', flag: '🇩🇰', label: 'DA' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
]

export default function PanelLangSelector() {
  const locale  = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function switchLocale(next: string) {
    document.cookie = `panel_locale=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=strict`
    window.location.reload()
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-stone-400 hover:text-white text-sm
                   transition px-2 py-1.5 rounded-lg border border-stone-700 hover:border-stone-500"
      >
        <span>{current.flag}</span>
        <span className="font-mono text-xs">{current.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-10 bg-stone-800 border border-stone-700
                        rounded-xl shadow-xl py-1 w-28 z-50">
          {LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors
                          hover:bg-stone-700 ${l.code === locale ? 'text-amber-400 font-semibold' : 'text-stone-300'}`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
