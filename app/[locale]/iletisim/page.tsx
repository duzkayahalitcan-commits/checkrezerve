import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import ContactForm from './ContactForm'
import {
  Zap, BadgeDollarSign, HeadphonesIcon,
  BookOpen, LifeBuoy, Info, Briefcase, Mail,
  MessageCircle, Camera, AtSign, Network,
  ChevronRight, ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'İletişim — CheckRezerve',
  description: 'CheckRezerve ile iletişime geçin. Demo talep edin, fiyat sorun veya destek alın.',
}

export default async function IletisimPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')

  const FEATURES = [
    {
      icon: <Zap className="h-5 w-5 text-amber-600" />,
      bg: 'bg-amber-50',
      title: t('rightFeature1Title'),
      desc: t('rightFeature1Desc'),
    },
    {
      icon: <BadgeDollarSign className="h-5 w-5 text-green-600" />,
      bg: 'bg-green-50',
      title: t('rightFeature2Title'),
      desc: t('rightFeature2Desc'),
    },
    {
      icon: <HeadphonesIcon className="h-5 w-5 text-blue-600" />,
      bg: 'bg-blue-50',
      title: t('rightFeature3Title'),
      desc: t('rightFeature3Desc'),
    },
  ]

  const QUICK_LINKS = [
    { icon: <BookOpen className="h-5 w-5" />, title: t('quickDocTitle'), desc: t('quickDocDesc'), href: '#' },
    { icon: <LifeBuoy className="h-5 w-5" />, title: t('quickSupportTitle'), desc: t('quickSupportDesc'), href: '#' },
    { icon: <Info className="h-5 w-5" />, title: t('quickAboutTitle'), desc: t('quickAboutDesc'), href: '/hakkimizda' },
    { icon: <Briefcase className="h-5 w-5" />, title: t('quickCareerTitle'), desc: t('quickCareerDesc'), href: '#' },
    { icon: <Mail className="h-5 w-5" />, title: t('quickContactTitle'), desc: t('quickContactDesc'), href: 'mailto:info@checkrezerve.com' },
  ]

  const SOCIALS = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      color: 'bg-green-50 text-green-600',
      border: 'border-green-100 hover:border-green-300',
      name: t('socialWhatsappName'),
      desc: t('socialWhatsappDesc'),
      btn: t('socialWhatsappBtn'),
      btnColor: 'bg-green-600 hover:bg-green-700',
      href: 'https://wa.me/905555555555',
    },
    {
      icon: <Camera className="h-6 w-6" />,
      color: 'bg-pink-50 text-pink-600',
      border: 'border-pink-100 hover:border-pink-300',
      name: t('socialInstagramName'),
      desc: t('socialInstagramDesc'),
      btn: t('socialInstagramBtn'),
      btnColor: 'bg-pink-600 hover:bg-pink-700',
      href: '#',
    },
    {
      icon: <AtSign className="h-6 w-6" />,
      color: 'bg-zinc-50 text-zinc-800',
      border: 'border-zinc-200 hover:border-zinc-400',
      name: t('socialTwitterName'),
      desc: t('socialTwitterDesc'),
      btn: t('socialTwitterBtn'),
      btnColor: 'bg-zinc-800 hover:bg-zinc-900',
      href: '#',
    },
    {
      icon: <Network className="h-6 w-6" />,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100 hover:border-blue-300',
      name: t('socialLinkedinName'),
      desc: t('socialLinkedinDesc'),
      btn: t('socialLinkedinBtn'),
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      href: '#',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── 1. HERO ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-28 pb-20 text-white text-center"
        style={{
          backgroundImage:
            'linear-gradient(135deg,rgba(15,23,42,0.90) 0%,rgba(185,28,28,0.75) 100%),url(\'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80\')',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <span className="mb-6 inline-block rounded-full border border-red-400/30 bg-red-600/20 px-4 py-1.5 text-sm font-medium text-red-200">
            {t('heroBadge')}
          </span>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight sm:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="mb-10 text-lg text-white/70">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-2">⚡ {t('heroStat1')}</span>
            <span className="flex items-center gap-2">🔒 {t('heroStat2')}</span>
            <span className="flex items-center gap-2">🌍 {t('heroStat3')}</span>
          </div>
        </div>
      </section>

      {/* ── 2. TWO-COLUMN ────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">

            {/* LEFT: Form card */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-8 shadow-sm">
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-zinc-900">{t('formCardTitle')}</h2>
                <p className="mt-1.5 text-sm text-zinc-500">{t('formCardSubtitle')}</p>
              </div>
              <ContactForm />
            </div>

            {/* RIGHT: Feature cards + partners */}
            <div className="space-y-6">

              {/* Feature cards */}
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${f.bg}`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{f.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}

              {/* Partners placeholder */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  {t('partnersTitle')}
                </p>
                <p className="mb-5 text-sm font-medium text-zinc-600">{t('partnersDesc')}</p>
                <div className="grid grid-cols-3 gap-3">
                  {['Zeytin', 'Lotus', 'Kahve+', 'Barber Co', 'Fit Zone', 'Peri Spa'].map(name => (
                    <div
                      key={name}
                      className="flex items-center justify-center rounded-xl bg-white border border-zinc-100 px-3 py-3 text-xs font-semibold text-zinc-500 shadow-sm"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. QUICK LINKS ───────────────────────────────────────── */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-900">{t('quickLinksTitle')}</h2>
            <p className="mt-2 text-sm text-zinc-500">{t('quickLinksDesc')}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_LINKS.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-red-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                  {link.icon}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">{link.title}</p>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{link.desc}</p>
                </div>
                <ChevronRight className="mt-auto h-4 w-4 text-zinc-300 transition-colors group-hover:text-red-500" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. SOCIAL MEDIA ──────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-900">{t('socialTitle')}</h2>
            <p className="mt-2 text-sm text-zinc-500">{t('socialDesc')}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SOCIALS.map((s, i) => (
              <div
                key={i}
                className={`flex flex-col gap-4 rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md ${s.border}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                  {s.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-zinc-900">{s.name}</p>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-colors ${s.btnColor}`}
                >
                  {s.btn}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CTA BANNER ────────────────────────────────────────── */}
      <section className="mx-6 mb-20 overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 to-red-900 px-8 py-14 text-center text-white sm:mx-auto sm:max-w-6xl">
        <h2 className="mb-3 text-3xl font-extrabold sm:text-4xl">{t('ctaTitle')}</h2>
        <p className="mb-8 text-white/70 text-base">{t('ctaDesc')}</p>
        <Link
          href="/basvuru"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-red-500 active:scale-[.98]"
        >
          {t('ctaBtn')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
