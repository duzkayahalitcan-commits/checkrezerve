import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'Terms of Use — checkrezerve',
  description: 'CheckRezerve Teknoloji terms of use and privacy policy.',
}

export default async function KullanimKosullariPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const tLegal = await getTranslations('legal')
  const t = await getTranslations('terms')
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">{tLegal('backHome')}</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/kullanim-kosullari" />

          <article className="flex-1 min-w-0 prose prose-zinc max-w-none">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">
              {t('title')}
            </h1>
            <p className="text-sm text-zinc-400 mb-8">{t('lastUpdated')}</p>

            <h2>{t('s1Title')}</h2>
            <p>{t('s1Body')}</p>

            <h2>{t('s2Title')}</h2>
            <p>{t('s2Body')}</p>

            <h2>{t('s3Title')}</h2>
            <ul>
              <li>{t('s3Item1')}</li>
              <li>{t('s3Item2')}</li>
              <li>{t('s3Item3')}</li>
              <li>{t('s3Item4')}</li>
            </ul>

            <h2>{t('s4Title')}</h2>
            <p>{t('s4Body')}</p>

            <h2>{t('s5Title')}</h2>
            <p>{t('s5Body')}</p>

            <h2>{t('s6Title')}</h2>
            <p>{t('s6Body')}</p>

            <h2>{t('s7Title')}</h2>
            <p>{t('s7Body')}</p>

            <h2>{t('s8Title')}</h2>
            <p>
              {t('s8Prefix')}{' '}
              <a href="mailto:info@checkrezerve.com" className="text-red-600">
                info@checkrezerve.com
              </a>
              {t('s8Suffix') ? ` ${t('s8Suffix')}` : ''}
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
