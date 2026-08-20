import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { headers } from 'next/headers'
import { hasLocale } from 'next-intl'

export default async function NotFound() {
  // Root not-found (global 404) — locale'i request'ten tespit et.
  // Öncelik: x-pathname (middleware yoksa boş) → Accept-Language → default.
  const h = await headers()
  const pathname = h.get('x-pathname') ?? h.get('x-invoke-path') ?? ''
  let locale = ''
  const seg = pathname.split('/')[1] ?? ''
  if (hasLocale(routing.locales, seg)) {
    locale = seg
  } else {
    const acceptLang = h.get('accept-language') ?? ''
    const preferred = acceptLang.split(',')[0].trim().split(/[-_]/)[0]
    locale = hasLocale(routing.locales, preferred) ? preferred : routing.defaultLocale
  }

  const t = await getTranslations({ locale, namespace: 'notFound' })

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
      <a
        href="/"
        className="rounded-full bg-[#E53935] hover:bg-red-700 text-white px-8 py-3 text-sm font-semibold transition-colors"
      >
        {t('button')}
      </a>
    </div>
  )
}
