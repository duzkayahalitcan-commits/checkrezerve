import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Özellikler — CheckRezerve',
  description: 'AI sesli onay, anlık takip, ön ödeme, CRM ve daha fazlası. CheckRezerve\'in tüm güçlü özellikleriyle tanışın.',
}

export default async function OzelliklerPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('features')

  const FEATURES = [
    {
      num: '01',
      img: '/images/feat-ai-voice-new.jpg',
      titleKey: 'feat1Title',
      descKey: 'feat1Desc',
      items: ['feat1Item1', 'feat1Item2', 'feat1Item3', 'feat1Item4'],
      reverse: false,
    },
    {
      num: '02',
      img: '/images/feat-human-agent-new.jpg',
      titleKey: 'feat2Title',
      descKey: 'feat2Desc',
      items: ['feat2Item1', 'feat2Item2', 'feat2Item3', 'feat2Item4'],
      reverse: true,
    },
    {
      num: '03',
      img: '/images/designer-15.png',
      imgClass: 'object-bottom',
      titleKey: 'feat3Title',
      descKey: 'feat3Desc',
      items: ['feat3Item1', 'feat3Item2', 'feat3Item3', 'feat3Item4'],
      reverse: false,
    },
    {
      num: '04',
      img: '/images/designer-5.png',
      titleKey: 'feat4Title',
      descKey: 'feat4Desc',
      items: ['feat4Item1', 'feat4Item2', 'feat4Item3', 'feat4Item4'],
      reverse: true,
    },
    {
      num: '05',
      img: '/images/feature-calisan.jpg',
      titleKey: 'feat5Title',
      descKey: 'feat5Desc',
      items: ['feat5Item1', 'feat5Item2', 'feat5Item3', 'feat5Item4'],
      reverse: false,
    },
    {
      num: '06',
      img: '/images/feature-online.jpg',
      titleKey: 'feat6Title',
      descKey: 'feat6Desc',
      items: ['feat6Item1', 'feat6Item2', 'feat6Item3', 'feat6Item4'],
      reverse: true,
    },
    {
      num: '07',
      img: '/images/designer-4.png',
      titleKey: 'feat7Title',
      descKey: 'feat7Desc',
      items: ['feat7Item1', 'feat7Item2', 'feat7Item3', 'feat7Item4'],
      reverse: false,
    },
    {
      num: '08',
      img: '/images/feature-analitik.jpg',
      titleKey: 'feat8Title',
      descKey: 'feat8Desc',
      items: ['feat8Item1', 'feat8Item2', 'feat8Item3', 'feat8Item4'],
      reverse: true,
    },
  ]

  const FAQS = [
    { qKey: 'faq1Q', aKey: 'faq1A' },
    { qKey: 'faq2Q', aKey: 'faq2A' },
    { qKey: 'faq3Q', aKey: 'faq3A' },
    { qKey: 'faq4Q', aKey: 'faq4A' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-28 pb-16 text-white text-center relative" style={{backgroundImage:"linear-gradient(135deg,rgba(13,18,26,0.87) 0%,rgba(13,110,110,0.68) 100%),url('/images/designer-7.png')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="mx-auto max-w-3xl px-6 relative z-10">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            {t('heroBadge')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Feature Rows */}
      <section className="py-4">
        {FEATURES.map((f, i) => (
          <div
            key={f.num}
            className={`py-20 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}
          >
            <div className={`mx-auto max-w-6xl px-6 flex flex-col ${f.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 items-center`}>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-red-600 tracking-widest uppercase">{f.num} — {t('featureLabel')}</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2 mb-4">{t(f.titleKey as Parameters<typeof t>[0])}</h2>
                <p className="text-zinc-600 leading-relaxed mb-6">{t(f.descKey as Parameters<typeof t>[0])}</p>
                <ul className="space-y-3">
                  {f.items.map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-zinc-600">
                      <span className="mt-0.5 text-red-500 font-bold shrink-0">✓</span>
                      {t(item as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-shrink-0 w-full lg:w-[480px]">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-zinc-100">
                  <Image
                    src={f.img}
                    alt={t(f.titleKey as Parameters<typeof t>[0])}
                    width={480}
                    height={340}
                    className={`w-full h-72 object-cover ${f.imgClass ?? ''}`}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">{t('faqTitle')}</h2>
            <p className="text-zinc-500">{t('faqSubtitle')}</p>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => (
              <details key={faq.qKey} className="rounded-2xl border border-zinc-100 bg-zinc-50 group">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-sm font-semibold text-zinc-800 list-none gap-4">
                  {t(faq.qKey as Parameters<typeof t>[0])}
                  <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs font-bold group-open:bg-red-600 group-open:text-white transition-colors">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-zinc-600 leading-relaxed">{t(faq.aKey as Parameters<typeof t>[0])}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-900 text-white text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-white/60 mb-8">{t('ctaSubtitle')}</p>
          <Link href="/kayit"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 font-semibold text-white transition-colors">
            {t('ctaButton')}
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
