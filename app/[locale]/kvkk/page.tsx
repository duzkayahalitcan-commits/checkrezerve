import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'Personal Data Protection Policy — CheckRezerve',
  description: 'CheckRezerve Teknoloji personal data protection and processing policy.',
}

export default async function KvkkPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const tLegal = await getTranslations('legal')
  const t = await getTranslations('kvkk')
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">{tLegal('backHome')}</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/kvkk" />

          <article className="flex-1 min-w-0 prose prose-zinc max-w-none">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">
              {t('title')}
            </h1>
            <p className="text-sm text-zinc-400 mb-8">{t('lastUpdated')}</p>

            <p>{t('intro')}</p>

            <h2 className="font-bold">{t('s1Title')}</h2>
            <p>{t('s1Body')}</p>

            <h2 className="font-bold">{t('s2Title')}</h2>
            <p>{t('s2Intro')}</p>
            <ul className="list-disc pl-5">
              <li>{t('s2Item1')}</li>
              <li>{t('s2Item2')}</li>
              <li>{t('s2Item3')}</li>
              <li>{t('s2Item4')}</li>
              <li>{t('s2Item5')}</li>
            </ul>
            <p>{t('s2Outro')}</p>

            <h2 className="font-bold">{t('s3Title')}</h2>
            <p>{t('s3Intro')}</p>
            <ul className="list-disc pl-5">
              <li>{t('s3Item1')}</li>
              <li>{t('s3Item2')}</li>
              <li>{t('s3Item3')}</li>
              <li>{t('s3Item4')}</li>
              <li>{t('s3Item5')}</li>
              <li>{t('s3Item6')}</li>
              <li>{t('s3Item7')}</li>
              <li>{t('s3Item8')}</li>
            </ul>

            <h2 className="font-bold">{t('s4Title')}</h2>
            <p>
              {t('s4Body')}{' '}
              <a href="mailto:info@checkrezerve.com" className="text-red-600">
                info@checkrezerve.com
              </a>{' '}
              {t('s4BodyMiddle')}{' '}
              <Link href="/kvkk-basvuru" className="text-red-600">
                {t('s4FormLink')}
              </Link>{' '}
              {t('s4BodyEnd')}
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
