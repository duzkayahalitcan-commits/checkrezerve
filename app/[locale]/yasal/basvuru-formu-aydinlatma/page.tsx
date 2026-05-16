import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'Application Form Data Protection Notice — checkrezerve',
  description:
    'CheckRezerve Teknoloji data protection notice regarding the processing of personal data collected through the business application form.',
}

export default async function BasvuruFormuAydinlatmaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const tLegal = await getTranslations('legal')
  const t = await getTranslations('basvuruAydinlatma')
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">{tLegal('backHome')}</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/yasal/basvuru-formu-aydinlatma" />

          <article className="flex-1 min-w-0 prose prose-zinc max-w-none">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">
              {t('title')}
            </h1>
            <p className="text-sm text-zinc-400 mb-8">{t('lastUpdated')}</p>

            <p>{t('intro')}</p>

            <h2>{t('s1Title')}</h2>
            <p>
              {t('s1Body')}{' '}
              <a href="mailto:info@checkrezerve.com" className="text-red-600">
                info@checkrezerve.com
              </a>
            </p>

            <h2>{t('s2Title')}</h2>
            <p>{t('s2Intro')}</p>
            <ul>
              <li>{t('s2Item1')}</li>
              <li>{t('s2Item2')}</li>
              <li>{t('s2Item3')}</li>
              <li>{t('s2Item4')}</li>
            </ul>

            <h2>{t('s3Title')}</h2>
            <p>{t('s3Intro')}</p>
            <ul>
              <li>
                <strong>{t('s3Legal1Label')}</strong> {t('s3Legal1')}
              </li>
              <li>
                <strong>{t('s3Legal2Label')}</strong> {t('s3Legal2')}
              </li>
              <li>
                <strong>{t('s3Legal3Label')}</strong> {t('s3Legal3')}
              </li>
            </ul>

            <h2>{t('s4Title')}</h2>
            <ul>
              <li><strong>{t('s4Item1Label')}</strong> {t('s4Item1')}</li>
              <li><strong>{t('s4Item2Label')}</strong> {t('s4Item2')}</li>
              <li><strong>{t('s4Item3Label')}</strong> {t('s4Item3')}</li>
            </ul>

            <h2>{t('s5Title')}</h2>
            <p>{t('s5Body')}</p>

            <h2>{t('s6Title')}</h2>
            <p>{t('s6Intro')}</p>
            <ul>
              <li>{t('s6Item1')}</li>
              <li>{t('s6Item2')}</li>
              <li>{t('s6Item3')}</li>
              <li>{t('s6Item4')}</li>
              <li>{t('s6Item5')}</li>
              <li>{t('s6Item6')}</li>
              <li>{t('s6Item7')}</li>
              <li>{t('s6Item8')}</li>
              <li>{t('s6Item9')}</li>
            </ul>
            <p>
              {t('s6ContactPrefix')}{' '}
              <a href="mailto:info@checkrezerve.com" className="text-red-600">
                info@checkrezerve.com
              </a>{' '}
              {t('s6ContactMiddle')}{' '}
              <Link href="/kvkk-basvuru" className="text-red-600">
                {t('s6FormLink')}
              </Link>
              {t('s6ContactSuffix') ? ` ${t('s6ContactSuffix')}` : ''}
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
