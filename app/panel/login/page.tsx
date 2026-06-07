export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import LoginForm from './LoginForm'
import PanelLangSelector from '../_components/PanelLangSelector'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('panel')
  return { title: t('pageTitle') }
}

export default async function PanelLoginPage() {
  const t = await getTranslations('panel')

  const CATEGORIES = ['Restoran', 'Spa', 'Kuaför', 'Psikolog', 'Pilates', 'Klinik']

  return (
    <div className={`min-h-screen flex ${playfair.variable} ${dmSans.variable}`}>
      {/* ─── SOL: Görsel Panel (lg+) ─── */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Katmanlı gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Grain texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />

        {/* İçerik — sol alt */}
        <div className="relative z-10 flex flex-col justify-end p-12 sm:p-16 w-full">
          <h1
            className="text-5xl sm:text-6xl font-black text-white leading-[1.1] mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
            dangerouslySetInnerHTML={{ __html: t.raw('heroTitle') }}
          />
          <p className="text-white/65 text-base sm:text-lg max-w-md leading-relaxed font-medium">
            {t('heroSubtitle')}
          </p>

          {/* Kategori badge'leri — sağ alt */}
          <div className="absolute bottom-8 right-8 flex flex-wrap gap-2 justify-end max-w-[260px]">
            {CATEGORIES.map(cat => (
              <span
                key={cat}
                className="text-[10px] font-semibold text-white/40 tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.04]"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SAĞ: Form Panel ─── */}
      <div
        className="w-full lg:w-[40%] flex flex-col justify-center px-6 sm:px-10 py-12 relative"
        style={{ backgroundColor: '#0A0A0C' }}
      >
        {/* Dil seçici */}
        <div className="absolute top-6 right-6 z-10">
          <PanelLangSelector />
        </div>

        {/* Anasayfa linki — sol üst */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Anasayfa
          </Link>
        </div>

        <div className="max-w-sm mx-auto w-full">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/40 flex-shrink-0">
                <span className="text-white text-sm font-black">CR</span>
              </div>
              <div>
                <span
                  className="text-white text-lg font-black tracking-tight block leading-tight"
                  style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}
                >
                  checkrezerve
                </span>
                <span className="text-zinc-500 text-xs font-medium">{t('businessPanel')}</span>
              </div>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-1 tracking-tight">{t('welcomeTitle')}</h2>
          <p className="text-zinc-500 text-sm mb-8">{t('welcomeSubtitle')}</p>

          <Suspense fallback={<div className="text-zinc-500 text-sm">Yükleniyor...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
