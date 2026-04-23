import type { Metadata } from 'next'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import SectorTabs from './SectorTabs'

export const metadata: Metadata = {
  title: 'Kullanım Alanları — CheckRezerve',
  description: 'Restoran, spa, kuaför, otel, etkinlik mekanı ve daha fazlası için CheckRezerve rezervasyon altyapısı.',
}

export default function KullanimAlanlariPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="pt-28 pb-16 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white text-center">
        <div className="mx-auto max-w-3xl px-6">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            Her Sektöre Uygun
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Sektörünüze Özel<br />Rezervasyon Altyapısı
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Restorandan spa&apos;ya, kuaförden etkinlik mekanına kadar CheckRezerve her işletme tipine kolayca adapte olur.
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
