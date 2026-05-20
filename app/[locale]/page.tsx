import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { UtensilsCrossed, Scissors, Sparkles, BedDouble, CalendarRange, Dumbbell } from 'lucide-react'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import BasvuruModal from '@/components/BasvuruModal'
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
  const t = await getTranslations('hero')
  const hp = await getTranslations('homepage')

  const SECTORS = [
    {
      Icon: UtensilsCrossed,
      titleKey: 'useCaseRestaurant',
      descKey: 'sectorRestaurantDesc',
    },
    {
      Icon: Scissors,
      titleKey: 'useCaseBarber',
      descKey: 'sectorBarberDesc',
    },
    {
      Icon: Sparkles,
      titleKey: 'useCaseSpa',
      descKey: 'sectorSpaDesc',
    },
    {
      Icon: BedDouble,
      titleKey: 'useCaseHotel',
      descKey: 'sectorHotelDesc',
    },
    {
      Icon: CalendarRange,
      titleKey: 'useCaseEvent',
      descKey: 'sectorEventDesc',
    },
    {
      Icon: Dumbbell,
      titleKey: 'useCaseFitness',
      descKey: 'sectorFitnessDesc',
    },
  ]

  const HOW_STEPS = [
    { num: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
    { num: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
    { num: '3', titleKey: 'step3Title', descKey: 'step3Desc' },
  ]

  const FEATURES = [
    {
      icon: '📅',
      img: '/images/feature-rezervasyon.jpg',
      titleKey: 'featureReservationTitle',
      descKey: 'featureReservationDesc',
    },
    {
      icon: '💳',
      img: '/images/feature-odeme-new.png',
      titleKey: 'featurePaymentTitle',
      descKey: 'featurePaymentDesc',
    },
    {
      icon: '📲',
      img: '/images/feature-bildirim.jpg',
      titleKey: 'featureSmsTitle',
      descKey: 'featureSmsDesc',
    },
    {
      icon: '👥',
      img: '/images/feature-calisan.jpg',
      titleKey: 'featureStaffTitle',
      descKey: 'featureStaffDesc',
    },
    {
      icon: '📊',
      img: '/images/blog-banner.jpg',
      titleKey: 'featureReportsTitle',
      descKey: 'featureReportsDesc',
    },
    {
      icon: '🖥️',
      img: '/images/feature-online.jpg',
      titleKey: 'featureOnlineTitle',
      descKey: 'featureOnlineDesc',
    },
  ]

  const TESTIMONIALS = [
    {
      quoteKey: 'testimonial1Quote',
      name: 'Mehmet Arslan',
      business: 'Zeytin Restoran',
      typeKey: 'testimonial1Type',
      initials: 'MA',
    },
    {
      quoteKey: 'testimonial2Quote',
      name: 'Ayşe Yıldız',
      business: 'Lotus Güzellik Salonu',
      typeKey: 'testimonial2Type',
      initials: 'AY',
    },
    {
      quoteKey: 'testimonial3Quote',
      name: 'Kemal Özcan',
      business: 'Kahve Durağı',
      typeKey: 'testimonial3Type',
      initials: 'KÖ',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="pt-24 pb-24 text-white relative" style={{backgroundImage:"linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url('/images/hero-premium.jpg')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm mb-8 text-red-300 font-medium">
            {t('badge')}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            {t('mainTitle1')}<br />
            <span className="text-red-400">{t('mainTitle2')}</span>
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('mainSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 text-sm text-white/70">
            {[
              t('benefit1'),
              t('benefit2'),
              t('benefit3'),
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5 justify-center">
                <span className="text-red-400 font-bold">✓</span> {item}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BasvuruModal className="rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 text-base font-semibold text-white transition-colors shadow-lg shadow-red-900/30">
              {t('ctaPrimary')}
            </BasvuruModal>
            <a href="#nasil-calisir"
              className="rounded-full border border-white/30 hover:border-white/60 px-8 py-4 text-base font-semibold text-white transition-colors">
              {t('howItWorks')}
            </a>
          </div>
        </div>
      </section>

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
          <p className="text-white font-semibold text-base">
            {t('demoCta')}
          </p>
          <Link href="/iletisim"
            className="shrink-0 rounded-full bg-white text-red-600 hover:bg-red-50 px-7 py-2.5 text-sm font-bold transition-colors shadow">
            {t('demoButton')}
          </Link>
        </div>
      </section>

      {/* ── Kullanım Alanları ── */}
      <section id="kullanim-alanlari" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              {hp('sectorsTitle')}
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              {hp('sectorsSubtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTORS.map(s => (
              <div key={s.titleKey}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-7 hover:border-red-100 hover:shadow-sm transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <s.Icon className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{hp(s.titleKey as Parameters<typeof hp>[0])}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{hp(s.descKey as Parameters<typeof hp>[0])}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nasıl Çalışır ── */}
      <section id="nasil-calisir" className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{hp('howTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 mb-16">
            {HOW_STEPS.map(step => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-extrabold mb-5 shadow-lg shadow-red-200">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{hp(step.titleKey as Parameters<typeof hp>[0])}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{hp(step.descKey as Parameters<typeof hp>[0])}</p>
              </div>
            ))}
          </div>

          {/* Demo Video Placeholder */}
          <div className="rounded-2xl overflow-hidden border border-zinc-200 max-w-3xl mx-auto relative aspect-video">
            <Image
              src="/images/hero-restaurant.jpg"
              alt="CheckRezerve demo"
              fill
              className="object-cover"
            />
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
            🔒 Rezervasyonunuz, garantide.
          </span>
        </div>
      </div>

      {/* ── Ön Ödeme / No-Show ── */}
      <section className="py-20 bg-red-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 leading-snug">
                {hp('noshowTitle')}
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                {hp('noshowP1')}
              </p>
              <p className="text-zinc-600 leading-relaxed mb-4">
                {hp('noshowP2')}
              </p>
              <p className="text-zinc-600 leading-relaxed mb-8">
                {hp('noshowP3')}
              </p>
              <BasvuruModal className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer p-0">
                {hp('noshowCta')}
              </BasvuruModal>
            </div>

            <div className="flex-shrink-0 w-full lg:w-96">
              <Image
                src="/images/feature-rezervasyon.jpg"
                alt="CheckRezerve reservation management"
                width={600}
                height={420}
                className="w-full rounded-2xl shadow-xl object-cover"
                style={{ height: '340px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section id="ozellikler" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              {hp('featuresTitle')}
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              {hp('featuresSubtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.titleKey}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 overflow-hidden hover:border-red-100 hover:shadow-md transition-all duration-200">
                <Image
                  src={f.img}
                  alt={hp(f.titleKey as Parameters<typeof hp>[0])}
                  width={400}
                  height={160}
                  className="w-full object-cover"
                  style={{ height: '160px' }}
                />
                <div className="p-7">
                  <h3 className="text-base font-bold text-zinc-900 mb-2">{hp(f.titleKey as Parameters<typeof hp>[0])}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{hp(f.descKey as Parameters<typeof hp>[0])}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
            <p className="text-zinc-500 max-w-xl mx-auto">
              {hp('testimonialsSubtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(tm => (
              <div key={tm.name} className="bg-white rounded-2xl border border-zinc-100 p-7 hover:border-red-100 hover:shadow-md transition-all duration-200 flex flex-col">
                <div className="flex-1">
                  <div className="text-red-500 text-2xl mb-4 leading-none">&ldquo;</div>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-6">{hp(tm.quoteKey as Parameters<typeof hp>[0])}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-400 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {tm.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900">{tm.name}</div>
                    <div className="text-xs text-zinc-500">{tm.business} · {hp(tm.typeKey as Parameters<typeof hp>[0])}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plan CTA ── */}
      <section id="pricing" className="py-20 bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Hangi plan size uygun?</h2>
          <p className="text-zinc-500 mb-8">İşletmenizin büyüklüğüne göre hazırlanmış esnek planlarımızı inceleyin.</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/pricing' as any}
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
