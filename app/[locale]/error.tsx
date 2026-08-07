'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error')

  useEffect(() => { console.error(error) }, [error])

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
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-[#E53935] hover:bg-red-700 text-white px-8 py-3 text-sm font-semibold transition-colors"
        >
          {t('retry')}
        </button>
        <a
          href="/"
          className="rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-8 py-3 text-sm font-semibold transition-colors"
        >
          {t('home')}
        </a>
      </div>
    </div>
  )
}
