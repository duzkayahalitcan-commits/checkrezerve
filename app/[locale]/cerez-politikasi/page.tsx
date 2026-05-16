import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'Cookie Policy — checkrezerve',
  description: 'CheckRezerve Teknoloji cookie notice and cookie policy.',
}

export default async function CerezPolitikasiPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const tLegal = await getTranslations('legal')
  const t = await getTranslations('cerezPolitikasi')
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">{tLegal('backHome')}</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/cerez-politikasi" />

          <article className="flex-1 min-w-0 prose prose-zinc max-w-none">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">{t('title')}</h1>
            <p className="text-sm text-zinc-400 mb-8">{t('lastUpdated')}</p>

            <h2 className="font-bold">{t('s1Title')}</h2>
            <p>{t('s1Body')}</p>

            <h2 className="font-bold">{t('s2Title')}</h2>

            <h3 className="font-bold">{t('s2MandatoryTitle')}</h3>
            <p>{t('s2MandatoryBody')}</p>

            <h3 className="font-bold">{t('s2PerformanceTitle')}</h3>
            <p>{t('s2PerformanceBody')}</p>

            <h3 className="font-bold">{t('s2FunctionalTitle')}</h3>
            <p>{t('s2FunctionalBody')}</p>

            <h2 className="font-bold">{t('s3Title')}</h2>
            <p>{t('s3Intro')}</p>
            <ul>
              <li><strong>Chrome:</strong> {t('s3Chrome')}</li>
              <li><strong>Safari:</strong> {t('s3Safari')}</li>
              <li><strong>Firefox:</strong> {t('s3Firefox')}</li>
            </ul>
            <p>{t('s3Warning')}</p>

            <h2 className="font-bold">{t('s4Title')}</h2>
            <p>
              {t('s4Prefix')}{' '}
              <a href="mailto:info@checkrezerve.com" className="text-red-600">
                info@checkrezerve.com
              </a>
              {t('s4Suffix') ? ` ${t('s4Suffix')}` : ''}
            </p>

            <div className="not-prose mt-10 p-5 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-600 space-y-1">
              <p><strong>{t('dataControllerLabel')}</strong> {t('dataControllerName')}</p>
              <p>
                <strong>{t('emailLabel')}</strong>{' '}
                <a href="mailto:info@checkrezerve.com" className="text-red-600">
                  info@checkrezerve.com
                </a>
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
