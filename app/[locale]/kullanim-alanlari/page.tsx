import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import SectorTabs from './SectorTabs'

export const metadata: Metadata = {
  title: 'Kullanım Alanları — CheckRezerve',
  description: 'Restoran, spa, kuaför, otel, etkinlik mekanı ve daha fazlası için CheckRezerve rezervasyon altyapısı.',
}

export default async function KullanimAlanlariPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('useCases')
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="pt-28 pb-16 text-white text-center relative" style={{backgroundImage:"linear-gradient(135deg,rgba(13,31,45,0.90) 0%,rgba(13,31,45,0.65) 100%),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80')",backgroundSize:'cover',backgroundPosition:'center'}}>
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

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectorTabs />
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
