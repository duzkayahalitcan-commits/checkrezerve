import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'Terms of Service — checkrezerve',
  description: 'checkrezerve application terms of service and service agreement.',
}

export default async function KullanimSartlariPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const tLegal = await getTranslations('legal')
  const t = await getTranslations('kullanimSartlari')
  return (
    <main className="min-h-screen bg-white text-stone-800 px-4 py-12">
      <div className="mx-auto max-w-6xl py-4">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">{tLegal('backHome')}</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/kullanim-sartlari" />

          <article className="max-w-2xl prose prose-stone flex-1 min-w-0">
            <h1>{t('title')}</h1>
            <p className="text-sm text-stone-500">{t('lastUpdated')}</p>

            <h2>{t('s1Title')}</h2>
            <p>{t('s1Body')}</p>

            <h2>{t('s2Title')}</h2>
            <p>{t('s2Body')}</p>

            <h2>{t('s3Title')}</h2>
            <ul>
              <li>{t('s3Item1')}</li>
              <li>{t('s3Item2')}</li>
              <li>{t('s3Item3')}</li>
            </ul>

            <h2>{t('s4Title')}</h2>
            <p>{t('s4Intro')}</p>
            <ul>
              <li>{t('s4Item1')}</li>
              <li>{t('s4Item2')}</li>
              <li>{t('s4Item3')}</li>
              <li>{t('s4Item4')}</li>
              <li>{t('s4Item5')}</li>
            </ul>

            <h2>{t('s5Title')}</h2>
            <p>{t('s5Body')}</p>

            <h2>{t('s6Title')}</h2>
            <p>{t('s6Body')}</p>

            <h2>{t('s7Title')}</h2>
            <p>{t('s7Body')}</p>

            <h2>{t('s8Title')}</h2>
            <p>{t('s8Body')}</p>

            <h2>{t('s9Title')}</h2>
            <p>{t('s9Body')}</p>

            <h2>{t('s10Title')}</h2>
            <p>{t('s10Body')}</p>

            <h2>{t('s11Title')}</h2>
            <p>{t('s11Body')}</p>

            <h2>{t('s12Title')}</h2>
            <p>{t('s12Body')}</p>

            <h2>{t('s13Title')}</h2>
            <p>
              <a href="mailto:destek@checkrezerve.com">destek@checkrezerve.com</a>
            </p>
          </article>
        </div>
      </div>
    </main>
  )
}
