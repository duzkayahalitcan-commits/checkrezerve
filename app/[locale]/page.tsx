import type { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import DiagonalSplit from '@/components/DiagonalSplit'
import LanguageSelector from '@/components/LanguageSelector'

export const metadata: Metadata = {
  title: 'CheckRezerve — Rezervasyon',
  description: 'Restoran, güzellik salonu ve spa rezervasyonu — saniyeler içinde.',
  openGraph: {
    title: 'CheckRezerve — Rezervasyon',
    description: 'Restoran, güzellik salonu ve spa rezervasyonu — saniyeler içinde.',
    url: 'https://checkrezerve.com',
    siteName: 'CheckRezerve',
    images: [{ url: 'https://checkrezerve.com/images/og-home.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
}

export default async function PortalPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('diagonal')

  return (
    <div className="relative overflow-hidden bg-[#060606]" style={{ height: '100dvh' }}>

      {/* ── Logo — sol üst ── */}
      <div className="absolute top-5 left-6 z-[100] flex items-center">
        <Link href="/home" className="flex items-center gap-2 group">
          <Image
            src="/logo-icon.png"
            alt="CheckRezerve"
            width={30}
            height={30}
            className="rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
            priority
          />
          <span className="text-white text-sm font-extrabold tracking-tight opacity-90 group-hover:opacity-100 transition-opacity">
            CheckRezerve
          </span>
        </Link>
      </div>

      {/* ── Dil seçici — sağ üst ── */}
      <div className="absolute top-4 right-6 z-[100]">
        <LanguageSelector />
      </div>

      {/* ── Ana içerik ── */}
      <DiagonalSplit fullscreen />

      {/* ── İşletmeler için — sağ alt ── */}
      <div className="absolute bottom-6 right-7 z-[100]">
        <Link
          href="/home"
          className="text-white/50 hover:text-white/90 text-xs font-semibold tracking-wide transition-colors"
        >
          {t('forBusiness')} →
        </Link>
      </div>
    </div>
  )
}
