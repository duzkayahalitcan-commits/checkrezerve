import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import BasvuruModal from '@/components/BasvuruModal'
import HomeHero from '@/components/HomeHero'
import FeaturesSection from '@/components/FeaturesSection'
import { AnimatedSectors, AnimatedHowSteps, AnimatedTestimonials } from '@/components/AnimatedSections'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'CheckRezerve — Randevu & Rezervasyon Yönetim Sistemi',
  description:
    'Doluluk oranınızı artırın, gelir kaybını önleyin. CheckRezerve ile işletmenizin rezervasyonlarını tek panelden yönetin. Komisyon yok.',
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const hp = await getTranslations('homepage')

  const SECTORS = [
    { iconName: 'UtensilsCrossed', titleKey: 'useCaseRestaurant', descKey: 'sectorRestaurantDesc' },
    { iconName: 'Scissors',        titleKey: 'useCaseBarber',     descKey: 'sectorBarberDesc' },
    { iconName: 'Sparkles',        titleKey: 'useCaseSpa',        descKey: 'sectorSpaDesc' },
    { iconName: 'BedDouble',       titleKey: 'useCaseHotel',      descKey: 'sectorHotelDesc' },
    { iconName: 'CalendarRange',   titleKey: 'useCaseEvent',      descKey: 'sectorEventDesc' },
    { iconName: 'Dumbbell',        titleKey: 'useCaseFitness',    descKey: 'sectorFitnessDesc' },
  ]

  const HOW_STEPS = [
    { num: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
    { num: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
    { num: '3', titleKey: 'step3Title', descKey: 'step3Desc' },
  ]

  const FEATURES = [
    { icon: 'CalendarCheck', img: '/images/feature-rezervasyon.jpg', titleKey: 'featureReservationTitle', descKey: 'featureReservationDesc' },
    { icon: 'CreditCard',    img: '/images/feature-odeme-new.png',   titleKey: 'featurePaymentTitle',      descKey: 'featurePaymentDesc' },
    { icon: 'Bell',          img: '/images/feature-bildirim.jpg',    titleKey: 'featureSmsTitle',          descKey: 'featureSmsDesc' },
    { icon: 'Users',         img: '/images/feature-calisan.jpg',     titleKey: 'featureStaffTitle',        descKey: 'featureStaffDesc' },
    { icon: 'BarChart3',     img: '/images/feature-analitik.jpg',    titleKey: 'featureReportsTitle',      descKey: 'featureReportsDesc' },
    { icon: 'Globe',         img: '/images/feature-online.jpg',      titleKey: 'featureOnlineTitle',       descKey: 'featureOnlineDesc' },
  ]

  const TESTIMONIALS = [
    { quoteKey: 'testimonial1Quote', name: 'Mehmet Arslan',  business: 'Zeytin Restoran',       typeKey: 'testimonial1Type', initials: 'MA' },
    { quoteKey: 'testimonial2Quote', name: 'Ayşe Yıldız',   business: 'Lotus Güzellik Salonu', typeKey: 'testimonial2Type', initials: 'AY' },
    { quoteKey: 'testimonial3Quote', name: 'Kemal Özcan',   business: 'Kahve Durağı',          typeKey: 'testimonial3Type', initials: 'KÖ' },
  ]

  const FEATURES_RESOLVED = FEATURES.map(f => ({
    icon: f.icon,
    img:  f.img,
    title: hp(f.titleKey as Parameters<typeof hp>[0]),
    desc:  hp(f.descKey  as Parameters<typeof hp>[0]),
  }))

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── Hero ── */}
      <HomeHero
        title={hp('heroTitle')}
        subtitle={hp('heroSubtitle')}
        badge={hp('heroBadge')}
        ctaPrimary={hp('heroCtaPrimary')}
        ctaSecondary={hp('heroCtaSecondary')}
        locale={locale}
      />

      {/* ── Slogan Band ── */}
      <section className="bg-zinc-900 py-6">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-white text-xl sm:text-2xl font-bold tracking-tight">
            Bekleme yok. Sıra yok. Sadece rezervasyon.
          </p>
        </div>
      </section>

      {/* ── Demo İste CTA ── */}
      <section className="bg-red-600 py-5">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white font-semibold text-base">{hp('demoCta')}</p>
          <Link href="/iletisim"
            className="shrink-0 rounded-full bg-white text-red-600 hover:bg-red-50 px-7 py-2.5 text-sm font-bold transition-colors shadow">
            {hp('demoButton')}
          </Link>
        </div>
      </section>

      {/* ── Kullanım Alanları ── */}
      <section id="kullanim-alanlari" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{hp('sectorsTitle')}</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">{hp('sectorsSubtitle')}</p>
          </div>
          <AnimatedSectors sectors={SECTORS.map(s => ({
            iconName: s.iconName,
            title: hp(s.titleKey as Parameters<typeof hp>[0]),
            desc: hp(s.descKey as Parameters<typeof hp>[0]),
          }))} />
        </div>
      </section>

      {/* ── Nasıl Çalışır ── */}
      <section id="nasil-calisir" className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{hp('howTitle')}</h2>
          </div>
          <AnimatedHowSteps steps={HOW_STEPS.map(step => ({
            num: step.num,
            title: hp(step.titleKey as Parameters<typeof hp>[0]),
            desc: hp(step.descKey as Parameters<typeof hp>[0]),
          }))} />
          <div className="rounded-2xl overflow-hidden border border-zinc-200 max-w-3xl mx-auto relative aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero-restaurant-new.jpg" alt="CheckRezerve demo" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            <div className="absolute inset-0 bg-zinc-900/65 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg shadow-red-900/40">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="text-center px-4">
                <p className="text-white font-bold text-xl mb-2">{hp('demoVideoTitle')}</p>
                <p className="text-zinc-300 text-sm mb-5">{hp('demoVideoSubtitle')}</p>
                <Link href="/kayit"
                  className="rounded-full bg-red-600 hover:bg-red-700 px-6 py-2.5 text-sm font-bold text-white transition-colors inline-block">
                  {hp('demoVideoButton')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Slogan — Güvenlik ── */}
      <div className="bg-white py-4 border-y border-zinc-100">
        <div className="mx-auto max-w-4xl px-6 flex justify-center">
          <span className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-5 py-2 text-red-700 font-bold text-sm tracking-wide">
            <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            Rezervasyonunuz, garantide.
          </span>
        </div>
      </div>

      {/* ── Ön Ödeme / No-Show ── */}
      <section className="py-20 bg-red-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 leading-snug">{hp('noshowTitle')}</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">{hp('noshowP1')}</p>
              <p className="text-zinc-600 leading-relaxed mb-4">{hp('noshowP2')}</p>
              <p className="text-zinc-600 leading-relaxed mb-8">{hp('noshowP3')}</p>
              <BasvuruModal className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer p-0">
                {hp('noshowCta')}
              </BasvuruModal>
            </div>
            <div className="flex-shrink-0 w-full lg:w-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/feature-rezervasyon.jpg" alt="CheckRezerve reservation management"
                loading="lazy" style={{ width: '100%', height: '340px', objectFit: 'cover' }} className="w-full rounded-2xl shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section id="ozellikler" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{hp('featuresTitle')}</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">{hp('featuresSubtitle')}</p>
        </div>
        <FeaturesSection features={FEATURES_RESOLVED} />
      </section>

      {/* ── Slogan — Deneyim ── */}
      <div className="bg-zinc-50 py-8">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-zinc-500 text-lg italic font-light tracking-wide">
            &ldquo;Deneyim başlamadan önce başlar.&rdquo;
          </p>
        </div>
      </div>

      {/* ── Müşteri Yorumları ── */}
      <section className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-3">{hp('testimonialsLabel')}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{hp('testimonialsTitle')}</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">{hp('testimonialsSubtitle')}</p>
          </div>
          <AnimatedTestimonials testimonials={TESTIMONIALS.map(tm => ({
            quote: hp(tm.quoteKey as Parameters<typeof hp>[0]),
            name: tm.name,
            business: tm.business,
            type: hp(tm.typeKey as Parameters<typeof hp>[0]),
            initials: tm.initials,
          }))} />
        </div>
      </section>

      {/* ── Plan CTA ── */}
      <section id="pricing" className="py-20 bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Hangi plan size uygun?</h2>
          <p className="text-zinc-500 mb-8">İşletmenizin büyüklüğüne göre hazırlanmış esnek planlarımızı inceleyin.</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/pricing' as never}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-700 text-white px-8 py-4 text-base font-bold transition-colors">
            Fiyatları Karşılaştır →
          </Link>
        </div>
      </section>

      {/* ── Ücretsiz Dene CTA ── */}
      <section className="py-20 bg-zinc-900 text-white text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold mb-4">{hp('ctaTitle')}</h2>
          <p className="text-white/60 mb-8">{hp('ctaSubtitle')}</p>
          <BasvuruModal className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 font-semibold text-white transition-colors shadow-lg shadow-red-900/40">
            {hp('ctaButton')}
          </BasvuruModal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
