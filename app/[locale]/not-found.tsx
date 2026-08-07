'use client'

import { useTranslations } from 'next-intl'

export default function LocaleNotFound() {
  const t = useTranslations('notFound')
  const tRez = useTranslations('rezervasyon')

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <img
        src="/images/404-keys.png"
        alt=""
        loading="eager"
        className="max-w-[400px] w-full mb-8 select-none pointer-events-none"
      />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-zinc-400 mb-8 max-w-md">{t('subtitle')}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/"
          className="rounded-full bg-[#E53935] hover:bg-red-700 text-white px-8 py-3 text-sm font-semibold transition-colors"
        >
          {t('button')}
        </a>
        <a
          href="/rezervasyon"
          className="rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white px-8 py-3 text-sm font-semibold transition-colors"
        >
          {tRez('makeReservation')}
        </a>
      </div>
    </div>
  )
}
