import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { PricingToggle } from '../PricingToggle'
import FAQSection from '../FAQSection'
import { Link } from '@/i18n/navigation'

export const metadata: Metadata = {
  title: 'Fiyatlar — CheckRezerve',
  description:
    'Komisyon yok, gizli ücret yok. Küçük işletmeden zincir restoran operasyonlarına kadar her büyüklük için şeffaf fiyatlandırma.',
}

const TRUST = [
  { icon: '🚫', label: 'Komisyon yok' },
  { icon: '🔒', label: 'Gizli ücret yok' },
  { icon: '↩️', label: '30 gün iade garantisi' },
  { icon: '📞', label: 'Ücretsiz kurulum desteği' },
]

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const p = await getTranslations('pricing')

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6 bg-white text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block bg-zinc-100 text-zinc-500 text-[11px] font-bold px-4 py-1.5 rounded-full tracking-[0.12em] uppercase mb-6">
            {p('pageHeroLabel')}
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-zinc-900 mb-5 leading-tight tracking-tight">
            {p('pageTitle')}
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
            {p('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* ── Pricing Cards + Toggle ── */}
      <section className="pb-24 px-6">
        <div className="mx-auto max-w-5xl">
          <PricingToggle />
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className="border-y border-zinc-100 bg-zinc-50 py-8 px-6">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
          {TRUST.map(item => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-semibold text-zinc-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comparison Highlight ── */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-900 mb-3">Neden CheckRezerve?</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Rezervasyon başına komisyon alan platformların aksine, CheckRezerve sabit ücretle çalışır.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Diğer Platformlar</p>
              <ul className="space-y-3">
                {[
                  '%5–15 komisyon her rezervasyonda',
                  'İptal ücretleri',
                  'Zorunlu reklam paketi',
                  'Müşteri veriniz platforma ait',
                ].map(item => (
                  <li key={item} className="text-sm text-zinc-500 flex items-start gap-2.5">
                    <span className="text-zinc-300 mt-0.5 shrink-0 font-bold text-base leading-none">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-4">CheckRezerve</p>
              <ul className="space-y-3">
                {[
                  'Sabit aylık ücret, sıfır komisyon',
                  'Sınırsız rezervasyon',
                  'Müşteri verisi tamamen size ait',
                  'Türkiye desteği, Türkçe panel',
                ].map(item => (
                  <li key={item} className="text-sm text-zinc-300 flex items-start gap-2.5">
                    <span className="text-red-500 mt-0.5 shrink-0 font-bold text-base leading-none">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 bg-zinc-50">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-900 mb-3">Sık Sorulan Sorular</h2>
            <p className="text-zinc-500">Her şeyi netleştiriyoruz.</p>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="py-24 px-6 text-center"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(220,38,38,0.92) 0%, rgba(0,0,0,0.85) 100%), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto max-w-2xl">
          <span className="inline-block bg-white/20 border border-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            ✦ 14 gün ücretsiz
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            İşletmenizi dijitalleştirin
          </h2>
          <p className="text-white/70 mb-10 text-lg leading-relaxed">
            Kredi kartı gerekmez. Kurulum 5 dakika. İstediğinizde iptal edin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/kayit"
              className="rounded-full bg-white hover:bg-white/90 px-9 py-4 text-base font-bold text-red-600 transition-colors shadow-lg w-full sm:w-auto text-center"
            >
              Ücretsiz Başla →
            </Link>
            <Link
              href="/iletisim"
              className="rounded-full border border-white/50 text-white hover:bg-white/10 px-9 py-4 text-base font-semibold transition-colors w-full sm:w-auto text-center"
            >
              Demo İste
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm">
            <span>✓ 500+ İşletme</span>
            <span>✓ 50K+ Rezervasyon</span>
            <span>✓ %98 Memnuniyet</span>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
