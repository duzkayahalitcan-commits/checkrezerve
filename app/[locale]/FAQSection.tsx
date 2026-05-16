'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function FAQSection() {
  const t = useTranslations('faq')
  const [open, setOpen] = useState<number | null>(null)

  const FAQS = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
    { q: t('q6'), a: t('a6') },
    { q: t('q7'), a: t('a7') },
    { q: t('q8'), a: t('a8') },
  ]

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className={`rounded-2xl border transition-colors ${
              isOpen ? 'border-red-200 bg-red-50' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
            >
              <span className={`text-sm font-semibold leading-snug ${isOpen ? 'text-red-700' : 'text-zinc-800'}`}>
                {faq.q}
              </span>
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isOpen ? 'bg-red-600 text-white' : 'bg-zinc-200 text-zinc-500'
              }`}>
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-sm text-zinc-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
