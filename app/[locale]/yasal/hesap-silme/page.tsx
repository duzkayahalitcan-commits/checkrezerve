import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import LegalSidebar from '@/components/LegalSidebar'

export const metadata: Metadata = {
  title: 'Hesap Silme — CheckRezerve',
  description:
    'CheckRezerve hesabınızı nasıl sileceğinizi ve silinen verilerinizin nasıl işleneceğini öğrenin.',
}

export default async function HesapSilmePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const tLegal = await getTranslations('legal')
  const t = await getTranslations('accountDeletion')

  const steps = [t('step1'), t('step2'), t('step3'), t('step4')]

  const mockups = [
    {
      label: t('mockup1Label'),
      desc: t('mockup1Desc'),
      screen: <ProfileTabMockup />,
    },
    {
      label: t('mockup2Label'),
      desc: t('mockup2Desc'),
      screen: <SettingsListMockup />,
    },
    {
      label: t('mockup3Label'),
      desc: t('mockup3Desc'),
      screen: <WarningScreenMockup />,
    },
    {
      label: t('mockup4Label'),
      desc: t('mockup4Desc'),
      screen: <ConfirmDialogMockup />,
    },
  ]

  return (
    <main className="min-h-screen bg-white text-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-red-600 hover:underline">
            {tLegal('backHome')}
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <LegalSidebar activePath="/yasal/hesap-silme" />

          <article className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-zinc-900 mb-4">{t('title')}</h1>
            <p className="text-zinc-600 mb-10 leading-relaxed">{t('intro')}</p>

            {/* Mobil Uygulama Üzerinden */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">{t('s1Title')}</h2>
              <ol className="space-y-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-zinc-700">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Silinen Veriler */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">{t('s2Title')}</h2>
              <ul className="space-y-3">
                {[t('data1'), t('data2'), t('data3')].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Mockup Adımları */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">{t('s3Title')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockups.map((m) => (
                  <div key={m.label} className="flex flex-col items-center gap-3">
                    <div className="text-center">
                      <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                        {m.label}
                      </span>
                      <p className="text-xs text-zinc-500 leading-snug">{m.desc}</p>
                    </div>
                    {/* Phone frame */}
                    <div className="relative w-32 h-56 bg-zinc-900 rounded-[18px] border-2 border-zinc-700 shadow-lg overflow-hidden flex flex-col">
                      {/* notch */}
                      <div className="w-16 h-4 bg-zinc-900 rounded-b-full mx-auto z-10 relative" />
                      <div className="flex-1 bg-white overflow-hidden">{m.screen}</div>
                      {/* home bar */}
                      <div className="h-5 flex items-center justify-center">
                        <div className="w-10 h-1 rounded-full bg-zinc-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Alternatif Yöntem */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">{t('s4Title')}</h2>
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <svg className="flex-shrink-0 w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-zinc-700">
                  {t('altText').split('info@checkrezerve.com')[0]}
                  <a href="mailto:info@checkrezerve.com" className="text-red-600 font-medium hover:underline">
                    info@checkrezerve.com
                  </a>
                  {t('altText').split('info@checkrezerve.com')[1]}
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-10 p-5 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-600 space-y-1">
              <p>
                <strong>{t('dataControllerLabel')}</strong> {t('dataControllerName')}
              </p>
              <p>
                <strong>{t('emailLabel')}</strong>{' '}
                <a href="mailto:info@checkrezerve.com" className="text-red-600 hover:underline">
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

/* ── SVG Mockup Components ── */

function ProfileTabMockup() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center gap-1 bg-zinc-50">
        <div className="w-10 h-10 rounded-full bg-zinc-300" />
        <div className="w-16 h-2 rounded bg-zinc-300" />
        <div className="w-10 h-1.5 rounded bg-zinc-200" />
      </div>
      {/* bottom tab */}
      <div className="flex justify-around items-end pb-1 pt-1 border-t border-zinc-200 bg-white">
        {['🏠', '🔍', '📅', '👤'].map((icon, i) => (
          <div
            key={i}
            className={`flex flex-col items-center gap-0.5 ${i === 3 ? 'text-red-600' : 'text-zinc-400'}`}
          >
            <span className="text-xs">{icon}</span>
            {i === 3 && <div className="w-4 h-0.5 rounded-full bg-red-600" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsListMockup() {
  const items = ['Bildirimler', 'Gizlilik', 'Hesabımı Sil']
  return (
    <div className="h-full flex flex-col bg-zinc-50">
      <div className="px-2 py-1.5 text-xs font-bold text-zinc-700 bg-white border-b border-zinc-100">
        Ayarlar
      </div>
      <div className="flex-1 flex flex-col divide-y divide-zinc-100">
        {items.map((item) => (
          <div
            key={item}
            className={`flex items-center justify-between px-2 py-1.5 text-xs ${
              item === 'Hesabımı Sil' ? 'text-red-600 font-semibold bg-red-50' : 'text-zinc-700 bg-white'
            }`}
          >
            <span>{item}</span>
            <span className="text-zinc-300">›</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WarningScreenMockup() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 bg-white px-2 text-center">
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-xs font-semibold text-zinc-800 leading-tight">Hesabınızı silmek üzeresiniz</p>
      <div className="w-full h-5 rounded bg-red-600 flex items-center justify-center">
        <span className="text-white text-xs font-bold">Devam Et</span>
      </div>
    </div>
  )
}

function ConfirmDialogMockup() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-2 bg-black/20">
      <div className="bg-white rounded-xl p-2 w-full shadow-lg text-center flex flex-col gap-1.5">
        <p className="text-xs font-bold text-zinc-900 leading-tight">Emin misiniz?</p>
        <p className="text-xs text-zinc-500 leading-tight">Bu işlem geri alınamaz.</p>
        <button className="w-full py-1 rounded-lg bg-red-600 text-white text-xs font-bold">
          Sil
        </button>
        <button className="w-full py-1 rounded-lg bg-zinc-100 text-zinc-600 text-xs">
          İptal
        </button>
      </div>
    </div>
  )
}
