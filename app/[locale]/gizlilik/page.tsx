import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'CheckRezerve Privacy Policy',
  description: 'CheckRezerve privacy policy regarding the protection of personal data.',
}

export default async function GizlilikPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const tLegal = await getTranslations('legal')
  const t = await getTranslations('privacy')
  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">{tLegal('backHome')}</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/gizlilik" />

          <article className="flex-1 min-w-0 prose prose-zinc max-w-none">
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">{t('title')}</h1>
            <p className="text-sm text-zinc-400 mb-8">{t('lastUpdated')} {t('updateDate')}</p>

            <h2 className="font-bold">{t('s1Title')}</h2>
            <p>{t('s1Body')}</p>

            <h2 className="font-bold">{t('s2Title')}</h2>
            <p>{t('s2Intro')}</p>
            <ul className="list-disc pl-5">
              <li><strong>{t('s2Item1Label')}</strong> {t('s2Item1')}</li>
              <li><strong>{t('s2Item2Label')}</strong> {t('s2Item2')}</li>
              <li><strong>{t('s2Item3Label')}</strong> {t('s2Item3')}</li>
              <li><strong>{t('s2Item4Label')}</strong> {t('s2Item4')}</li>
            </ul>

            <h2 className="font-bold">{t('s3Title')}</h2>
            <ul className="list-disc pl-5">
              <li>{t('s3Item1')}</li>
              <li>{t('s3Item2')}</li>
              <li>{t('s3Item3')}</li>
            </ul>

            <h2 className="font-bold">{t('s4Title')}</h2>
            <p>{t('s4Intro')}</p>
            <ul className="list-disc pl-5">
              <li><strong>{t('s4Item1Label')}</strong> {t('s4Item1')}</li>
              <li><strong>{t('s4Item2Label')}</strong> {t('s4Item2')}</li>
              <li><strong>{t('s4Item3Label')}</strong> {t('s4Item3')}</li>
            </ul>

            <h2 className="font-bold">{t('s5Title')}</h2>
            <p>{t('s5Body')}</p>

            <h2 className="font-bold">{t('s6Title')}</h2>
            <p>{t('s6Body')}</p>

            <h2 className="font-bold">{t('s7Title')}</h2>
            <p>{t('s7Intro')}</p>
            <ul className="list-disc pl-5">
              <li>{t('s7Item1')}</li>
              <li>{t('s7Item2')}</li>
              <li>{t('s7Item3')}</li>
              <li>{t('s7Item4')}</li>
              <li>{t('s7Item5')}</li>
              <li>{t('s7Item6')}</li>
            </ul>
            <p>
              {t('s7ContactPrefix')}{' '}
              <a href="mailto:kvkk@checkrezerve.com">kvkk@checkrezerve.com</a>{' '}
              {t('s7ContactSuffix')}
            </p>

            <h2 className="font-bold">{t('s8Title')}</h2>
            <p>{t('s8Body')}</p>

            <h2 className="font-bold">{t('s9Title')}</h2>
            <p>{t('s9Body')}</p>

            <h2 className="font-bold">{t('s10Title')}</h2>
            <p>
              {t('s10Prefix')}{' '}
              <a href="mailto:info@checkrezerve.com" className="text-red-600">info@checkrezerve.com</a>
            </p>

            <h2 className="font-bold">{t('s11Title')}</h2>
            <p>{t('s11Body')}</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>{t('s11Step1')}</li>
              <li>{t('s11Step2')}</li>
              <li>{t('s11Step3')}</li>
            </ol>
            <p className="text-sm text-zinc-500 italic">{t('s11Note')}</p>

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
