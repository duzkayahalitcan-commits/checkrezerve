import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'accountDelete' })
  return {
    title: `${t('title')} | CheckRezerve`,
    description: t('intro'),
  }
}

export default async function HesapSilmePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <HesapSilmeContent />
}

function HesapSilmeContent() {
  const t = useTranslations('accountDelete')

  const mobileSteps = t.raw('mobileSteps.steps') as string[]
  const deletedDataItems = t.raw('deletedData.items') as string[]
  const consequenceItems = t.raw('consequences.items') as string[]

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#E53935] transition-colors">
              {t('breadcrumb.home')}
            </Link>
            <span>/</span>
            <Link href={'/kullanim-kosullari' as never} className="hover:text-[#E53935] transition-colors">
              {t('breadcrumb.legal')}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{t('breadcrumb.current')}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8">
            <nav className="space-y-1">
              {[
                { label: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
                { label: 'Gizlilik Politikası', href: '/gizlilik' },
                { label: 'Çerez Politikası', href: '/cerez-politikasi' },
                { label: 'KVKK Aydınlatma', href: '/kvkk' },
                { label: 'Hesap Silme', href: '/yasal/hesap-silme', active: true },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href as never}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.active
                      ? 'bg-red-50 text-[#E53935] font-medium border-l-2 border-[#E53935] pl-2'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{t('intro')}</p>

          {/* Mobile Steps */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('mobileSteps.title')}</h2>
            <ol className="space-y-3">
              {mobileSteps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#E53935] text-white text-xs font-semibold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Deleted Data */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('deletedData.title')}</h2>
            <ul className="space-y-2">
              {deletedDataItems.map((item, i) => (
                <li key={i} className="flex gap-2 items-start text-sm text-gray-700">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#E53935]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Consequences */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('consequences.title')}</h2>
            <ul className="space-y-2">
              {consequenceItems.map((item, i) => (
                <li key={i} className="flex gap-2 items-start text-sm text-gray-700">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#E53935]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Step Screenshots */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('screenSteps.title')}</h2>
            <p className="text-sm text-gray-500 mb-6">{t('screenSteps.subtitle')}</p>
            <div className="grid grid-cols-2 gap-4">
              {(['step1', 'step2', 'step3', 'step4'] as const).map((step, i) => (
                <div key={step} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Mock phone screen */}
                  <div className="bg-gray-50 aspect-[9/16] relative flex flex-col">
                    <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full" />
                      <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                    </div>
                    <div className="flex-1 flex items-center justify-center p-6">
                      {i === 0 && (
                        <div className="w-full space-y-2">
                          {['Rezervasyonlarım', 'Favorilerim', 'Ayarlar', 'Güvenlik'].map((label) => (
                            <div
                              key={label}
                              className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100"
                            >
                              <span className="text-xs text-gray-600">{label}</span>
                              <svg
                                className="w-3 h-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          ))}
                        </div>
                      )}
                      {i === 1 && (
                        <div className="w-full">
                          <p className="text-xs font-semibold text-gray-700 mb-3 text-center">
                            Hesap Güvenliği
                          </p>
                          <div className="space-y-2">
                            {['Telefon Değiştir', 'E-posta Değiştir', 'Hesap Ayarları'].map((label) => (
                              <div
                                key={label}
                                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100"
                              >
                                <span className="text-xs text-gray-600">{label}</span>
                                <svg
                                  className="w-3 h-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {i === 2 && (
                        <div className="w-full text-center">
                          <div className="w-10 h-10 rounded-full border-2 border-red-400 flex items-center justify-center mx-auto mb-3">
                            <svg
                              className="w-5 h-5 text-red-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-xs font-semibold text-gray-800 mb-1">
                            Sizi Kaybetmek Üzereyiz...
                          </p>
                          <p className="text-[10px] text-gray-500 mb-3">
                            Tüm rezervasyonlarınız iptal edilecek.
                          </p>
                          <button className="w-full text-xs text-[#E53935] border border-red-200 rounded-lg py-1.5">
                            Hesabımı Kalıcı Olarak Sil
                          </button>
                        </div>
                      )}
                      {i === 3 && (
                        <div className="w-full text-center">
                          <div className="w-10 h-10 rounded-full border-2 border-red-400 flex items-center justify-center mx-auto mb-3">
                            <svg
                              className="w-5 h-5 text-red-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-xs font-semibold text-gray-800 mb-1">
                            Silmeyi Onaylıyor musunuz?
                          </p>
                          <p className="text-[10px] text-gray-500 mb-3">Bu işlem geri alınamaz.</p>
                          <button className="w-full text-xs text-[#E53935] py-1.5 mb-1">
                            Hesabımı Sil
                          </button>
                          <button className="w-full text-xs bg-[#E53935] text-white rounded-lg py-1.5">
                            Vazgeç
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Step label */}
                  <div className="bg-white px-3 py-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500">
                      {t(`screenSteps.${step}.label`)}
                    </p>
                    <p className="text-xs text-gray-600">{t(`screenSteps.${step}.desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* KVKK Note */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-600">
            {t('kvkk')}{' '}
            <Link href={'/gizlilik' as never} className="text-[#E53935] hover:underline">
              {t('kvkkLink')}
            </Link>{' '}
            {t('kvkkEnd')}
          </div>

          {/* Contact */}
          <section className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">{t('contact.title')}</h2>
            <p className="text-sm text-gray-600 mb-3">{t('contact.desc')}</p>
            <a
              href={`mailto:${t('contact.email')}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#E53935] hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {t('contact.email')}
            </a>
          </section>
        </article>
      </div>
    </main>
  )
}
