import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Hakkımızda — CheckRezerve',
  description: 'CheckRezerve ekibi, hikâyemiz ve misyonumuz. Rezervasyon yönetimini kolaylaştırmak için buradayız.',
}

export default async function HakkimizdaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')

  const VALUES = [
    { icon: '🎯', titleKey: 'value1Title', descKey: 'value1Desc' },
    { icon: '🔒', titleKey: 'value2Title', descKey: 'value2Desc' },
    { icon: '⚡', titleKey: 'value3Title', descKey: 'value3Desc' },
    { icon: '🌱', titleKey: 'value4Title', descKey: 'value4Desc' },
  ]

  const TEAM = [
    { initials: 'AY', nameKey: 'team1Name', roleKey: 'team1Role', bioKey: 'team1Bio' },
    { initials: 'ZK', nameKey: 'team2Name', roleKey: 'team2Role', bioKey: 'team2Bio' },
    { initials: 'CD', nameKey: 'team3Name', roleKey: 'team3Role', bioKey: 'team3Bio' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-28 pb-16 text-white text-center relative" style={{backgroundImage:"linear-gradient(135deg,rgba(13,18,26,0.85) 0%,rgba(13,110,110,0.60) 100%),url('/images/ideogram-v3.0_A_high-quality_wide-angle_shot_of_a_modern_sun-lit_boutique_office_in_Istanbul._-0.jpg')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="mx-auto max-w-3xl px-6 relative z-10">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            {t('heroBadge')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl font-bold text-red-600 mb-5">{t('storyTitle')}</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                {t('storyP1')}
              </p>
              <p className="text-zinc-600 leading-relaxed mb-4">
                {t('storyP2')}
              </p>
              <p className="text-zinc-600 leading-relaxed">
                {t('storyP3')}
              </p>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl bg-red-50 border border-red-100 p-6">
                <h3 className="font-bold text-zinc-900 mb-2">{t('missionTitle')}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {t('missionDesc')}
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-6">
                <h3 className="font-bold text-zinc-900 mb-2">{t('visionTitle')}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {t('visionDesc')}
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-900 text-white p-6">
                <div className="text-2xl font-bold mb-1">{t('earlyStageTitle')}</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('earlyStageDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-3">{t('valuesLabel')}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">{t('valuesTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.titleKey} className="bg-white rounded-2xl border border-zinc-100 p-6 text-center hover:border-red-100 hover:shadow-sm transition-all">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-zinc-900 mb-2 text-sm">{t(v.titleKey as Parameters<typeof t>[0])}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{t(v.descKey as Parameters<typeof t>[0])}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-3">{t('teamLabel')}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">{t('teamTitle')}</h2>
          <p className="text-zinc-500 max-w-xl mx-auto mb-12">{t('teamSubtitle')}</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {TEAM.map(m => (
              <div key={m.nameKey} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8">
                <div className="w-20 h-20 rounded-full border-2 border-zinc-200 bg-zinc-100 overflow-hidden mx-auto mb-4">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect width="100" height="100" fill="#f4f4f5" />
                    <circle cx="50" cy="38" r="18" fill="#d4d4d8" />
                    <ellipse cx="50" cy="85" rx="30" ry="20" fill="#d4d4d8" />
                  </svg>
                </div>
                <h3 className="font-bold text-zinc-900 mb-1">{t(m.nameKey as Parameters<typeof t>[0])}</h3>
                <p className="text-xs font-semibold text-red-600 mb-3">{t(m.roleKey as Parameters<typeof t>[0])}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{t(m.bioKey as Parameters<typeof t>[0])}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Photo */}
      <div className="w-full h-80 overflow-hidden">
        <Image
          src="/images/ideogram-v3.0_A_high-quality_wide-angle_shot_of_a_modern_sun-lit_boutique_office_in_Istanbul._-0.jpg"
          alt="Office"
          width={1440}
          height={320}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* CTA */}
      <section className="py-20 bg-zinc-900 text-white text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-white/60 mb-8 leading-relaxed">{t('ctaSubtitle')}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/kayit"
              className="rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 font-semibold text-white transition-colors">
              {t('ctaStart')}
            </Link>
            <Link href="/iletisim"
              className="rounded-full border border-white/30 hover:border-white/60 px-8 py-4 font-semibold text-white transition-colors">
              {t('ctaContact')}
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
