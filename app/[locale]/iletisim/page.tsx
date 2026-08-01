import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import WhatsAppFloatButton from '@/components/WhatsAppFloatButton'
import ContactForm from './ContactForm'
import {
  Zap, BadgeDollarSign, HeadphonesIcon, Shield, Globe,
  FileText, Headset, CalendarCheck, Handshake, Mail,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'İletişim — CheckRezerve',
  description: 'CheckRezerve ile iletişime geçin. Demo talep edin, fiyat sorun veya destek alın.',
}

/* ── Inline SVG logos ─────────────────────────────────────────── */
const WhatsAppSVG = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
    <circle cx="16" cy="16" r="16" fill="#25D366" />
    <path d="M16 7.5C11.306 7.5 7.5 11.306 7.5 16c0 1.624.442 3.143 1.21 4.447L7.5 24.5l4.163-1.195A8.432 8.432 0 0016 24.5c4.694 0 8.5-3.806 8.5-8.5S20.694 7.5 16 7.5zm4.908 11.757c-.207.578-1.196 1.107-1.646 1.149-.42.04-.812.2-2.73-.568-2.316-.909-3.8-3.26-3.915-3.412-.115-.152-.938-1.248-.938-2.38 0-1.133.593-1.689.804-1.921.21-.232.458-.29.611-.29.152 0 .305.001.438.008.14.007.328-.054.513.39.191.455.648 1.574.705 1.687.057.114.095.247.019.4-.077.152-.115.247-.228.38-.114.133-.24.298-.342.4-.114.114-.233.238-.1.467.133.228.59.973 1.267 1.576.87.776 1.6.996 1.867 1.11.228.095.38.08.52-.048.14-.128.59-.69.748-.928.157-.238.315-.198.533-.119.217.08 1.382.652 1.62.77.237.12.395.178.455.278.059.1.059.576-.148 1.05z" fill="#fff" />
  </svg>
)

const InstagramSVG = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#FCAF45" />
        <stop offset="50%" stopColor="#F77737" />
        <stop offset="75%" stopColor="#C13584" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#ig-grad)" />
    <rect x="9.5" y="9.5" width="13" height="13" rx="3.5" stroke="#fff" strokeWidth="1.8" />
    <circle cx="16" cy="16" r="3.2" stroke="#fff" strokeWidth="1.8" />
    <circle cx="21" cy="11" r="1" fill="#fff" />
  </svg>
)

const XSVG = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
    <rect width="32" height="32" rx="8" fill="#000" />
    <path d="M18.244 13.846L24.486 7h-1.48l-5.412 6.014L13.19 7H8l6.553 9.185L8 25h1.48l5.733-6.371L19.81 25H25l-6.756-11.154zm-2.028 2.254l-.664-.916L9.96 8.08h2.276l4.27 5.893.664.916 5.543 7.652h-2.276l-4.221-5.44z" fill="#fff" />
  </svg>
)

const LinkedInSVG = () => (
  <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
    <rect width="32" height="32" rx="6" fill="#0A66C2" />
    <path d="M11.5 13.5h-3v9h3v-9zM10 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM22.5 13.5c-1.7 0-2.8.9-3.2 1.5v-1.5h-3v9h3v-4.5c0-1.4.8-2 1.8-2 1 0 1.4.6 1.4 2v4.5h3v-5c0-3-1.6-4-3-4z" fill="#fff" />
  </svg>
)

/* ── CTA decorative SVG ───────────────────────────────────────── */
const CTADeco = () => (
  <svg viewBox="0 0 320 240" className="absolute right-0 top-0 h-full w-1/2 opacity-[0.08] pointer-events-none" fill="none" aria-hidden>
    {/* Calendar */}
    <rect x="100" y="30" width="80" height="70" rx="8" stroke="white" strokeWidth="2.5" />
    <line x1="100" y1="50" x2="180" y2="50" stroke="white" strokeWidth="2.5" />
    <line x1="120" y1="20" x2="120" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="160" y1="20" x2="160" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="112" y="60" width="10" height="10" rx="2" fill="white" />
    <rect x="130" y="60" width="10" height="10" rx="2" fill="white" />
    <rect x="148" y="60" width="10" height="10" rx="2" fill="white" />
    <rect x="112" y="78" width="10" height="10" rx="2" fill="white" />
    <rect x="130" y="78" width="10" height="10" rx="2" fill="white" />
    {/* Clock */}
    <circle cx="220" cy="80" r="36" stroke="white" strokeWidth="2.5" />
    <line x1="220" y1="80" x2="220" y2="56" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="220" y1="80" x2="238" y2="90" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="220" cy="80" r="3" fill="white" />
    {/* Checkmark circle */}
    <circle cx="140" cy="170" r="30" stroke="white" strokeWidth="2.5" />
    <path d="M126 170l9 9 19-19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Connecting dots */}
    <circle cx="190" cy="130" r="3" fill="white" />
    <circle cx="200" cy="145" r="2" fill="white" />
    <circle cx="175" cy="140" r="2" fill="white" />
  </svg>
)

const CTADots = () => (
  <svg viewBox="0 0 100 240" className="absolute left-0 top-0 h-full w-28 opacity-[0.06] pointer-events-none" fill="none" aria-hidden>
    {Array.from({ length: 6 }, (_, row) =>
      Array.from({ length: 4 }, (_, col) => (
        <circle key={`${row}-${col}`} cx={10 + col * 22} cy={20 + row * 36} r="3" fill="white" />
      ))
    )}
  </svg>
)

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
      icon: <Zap className="h-6 w-6 text-amber-600" />,
      title: t('rightFeature1Title'),
      desc: t('rightFeature1Desc'),
    },
    {
      icon: <BadgeDollarSign className="h-6 w-6 text-green-600" />,
      title: t('rightFeature2Title'),
      desc: t('rightFeature2Desc'),
    },
    {
      icon: <HeadphonesIcon className="h-6 w-6 text-blue-600" />,
      title: t('rightFeature3Title'),
      desc: t('rightFeature3Desc'),
    },
  ]

  const QUICK_LINKS = [
    { Icon: FileText,     title: t('quickDocTitle'),     desc: t('quickDocDesc'),     href: '/docs' },
    { Icon: Headset,      title: t('quickSupportTitle'), desc: t('quickSupportDesc'), href: '/destek' },
    { Icon: CalendarCheck,title: t('quickDemoTitle'),    desc: t('quickDemoDesc'),    href: '/demo' },
    { Icon: Handshake,    title: t('quickSectorTitle'),  desc: t('quickSectorDesc'),  href: '/sektorler' },
    { Icon: Mail,         title: t('quickContactTitle'), desc: t('quickContactDesc'), href: 'mailto:info@checkrezerve.com' },
  ]

  const SOCIALS = [
    {
      Logo: WhatsAppSVG,
      name: t('socialWhatsappName'),
      desc: t('socialWhatsappDesc'),
      btn: t('socialWhatsappBtn'),
      btnColor: 'bg-[#25D366] hover:bg-[#1da851]',
      href: 'https://wa.me/905555555555',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
    },
    {
      Logo: InstagramSVG,
      name: t('socialInstagramName'),
      desc: t('socialInstagramDesc'),
      btn: t('socialInstagramBtn'),
      btnColor: 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600',
      href: '#',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    },
    {
      Logo: XSVG,
      name: t('socialTwitterName'),
      desc: t('socialTwitterDesc'),
      btn: t('socialTwitterBtn'),
      btnColor: 'bg-zinc-900 hover:bg-zinc-700',
      href: '#',
      image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
    },
    {
      Logo: LinkedInSVG,
      name: t('socialLinkedinName'),
      desc: t('socialLinkedinDesc'),
      btn: t('socialLinkedinBtn'),
      btnColor: 'bg-[#0A66C2] hover:bg-[#004182]',
      href: '#',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    },
  ]

  const PARTNERS = ['Zeytin', 'Lotus', 'Kahve+', 'Barber Co', 'Fit Zone', 'Peri Spa']

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
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white">
            {t('heroBadge')}
          </span>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight sm:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="mb-10 text-lg text-white/70">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-white" /> {t('heroStat1')}</span>
            <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-white" /> {t('heroStat2')}</span>
            <span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-white" /> {t('heroStat3')}</span>
          </div>
        </div>
      </section>

      {/* ── 2. TWO-COLUMN ────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">

            {/* LEFT: Form card */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-8 shadow-md">
              <div className="mb-7">
                <h2 className="text-3xl font-extrabold text-zinc-900">{t('formCardTitle')}</h2>
                <p className="mt-1.5 text-sm text-zinc-500">{t('formCardSubtitle')}</p>
              </div>
              <ContactForm />
            </div>

            {/* RIGHT: Feature cards + partners */}
            <div className="space-y-6">

              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-5 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}

              {/* Partners - DM Serif Display font */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  {t('partnersTitle')}
                </p>
                <p className="mb-5 text-sm font-medium text-zinc-500">{t('partnersDesc')}</p>
                <div className="grid grid-cols-3 gap-3">
                  {PARTNERS.map(name => (
                    <div
                      key={name}
                      className="flex items-center justify-center rounded-xl bg-white px-3 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:shadow-md"
                      style={{
                        fontFamily: 'var(--font-display), serif',
                        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #e5393520, #7c3aed20) border-box',
                        border: '1.5px solid transparent',
                      }}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {QUICK_LINKS.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-md"
              >
                <link.Icon
                  size={32}
                  strokeWidth={1.5}
                  className="text-neutral-900 dark:text-neutral-100"
                />
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 text-sm">{link.title}</p>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">{link.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform duration-200 group-hover:translate-x-1" />
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
                className="group relative overflow-hidden rounded-2xl"
                style={{ minHeight: '220px' }}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${s.image})` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 transition-all duration-300 group-hover:from-black/90 group-hover:via-black/60" />

                {/* Content */}
                <div className="relative flex h-full flex-col justify-between p-5" style={{ minHeight: '220px' }}>
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-white/10 p-2 backdrop-blur-sm transition-all duration-200 group-hover:bg-white/20">
                      <s.Logo />
                    </div>
                  </div>

                  <div>
                    <p className="text-base font-bold text-white">{s.name}</p>
                    <p className="mt-1 text-xs text-white/70 leading-relaxed">{s.desc}</p>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all duration-200 ${s.btnColor}`}
                    >
                      {s.btn}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CTA BANNER ────────────────────────────────────────── */}
      <section className="mx-6 mb-20 sm:mx-auto sm:max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-red-950 to-red-900 px-8 py-14 text-center text-white">
          <CTADots />
          <CTADeco />
          <div className="relative z-10">
            <h2 className="mb-3 text-3xl font-extrabold sm:text-4xl">{t('ctaTitle')}</h2>
            <p className="mb-8 text-white/70 text-base">{t('ctaDesc')}</p>
            <Link
              href="/basvuru"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-red-500 active:scale-[.98] hover:shadow-lg hover:shadow-red-600/30"
            >
              {t('ctaBtn')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
      <WhatsAppFloatButton />
    </div>
  )
}
