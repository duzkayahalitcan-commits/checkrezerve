'use client'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

const PANELS = [
  {
    id: 'restoran',
    img: '/images/split-restoran.jpg',
    accent: '#E53935',
    labelKey: 'restoran',
    subKey: 'restoranSub',
  },
  {
    id: 'guzellik',
    img: '/images/split-guzellik.jpg',
    accent: '#E53935',
    labelKey: 'guzellik',
    subKey: 'guzellikSub',
  },
  {
    id: 'saglik',
    img: '/images/split-spa.jpg',
    accent: '#E53935',
    labelKey: 'spa',
    subKey: 'spaSub',
  },
]

export default function DiagonalSplit({ fullscreen = false }: { fullscreen?: boolean }) {
  const router = useRouter()
  const t = useTranslations('diagonal')

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={fullscreen ? { height: '100dvh' } : { minHeight: '100vh' }}
    >
      {/* Global top gradient — keeps logo + hero text readable, no hard edges */}
      <div className="absolute top-0 inset-x-0 h-56 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(43,27,23,0.65) 0%, rgba(43,27,23,0.25) 45%, transparent 100%)' }}
      />

      {/* Hero header — centered at top */}
      <div className="absolute inset-x-0 top-0 z-20 pt-12 md:pt-16 text-center px-6 pointer-events-none">
        <div className="relative inline-block px-6 py-4">
          {/* Value proposition eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 mb-4 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--cr-primary)' }} />
            <span className="text-[0.65rem] md:text-xs font-bold tracking-wider text-white/85 uppercase">
              {t('heroEyebrow')}
            </span>
          </div>
          <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]"
            style={{ fontFamily: 'var(--font-outfit)' }}>
            {t('heroTitle')}
          </h1>
          <p className="text-sm md:text-base mt-2 drop-shadow-[0_1px_14px_rgba(0,0,0,0.85)] font-semibold"
            style={{ fontFamily: 'var(--font-outfit)', color: '#E6A47E' }}>
            {t('heroSlogan')}
          </p>
          {/* Strong primary CTA */}
          <button
            type="button"
            onClick={() => router.push('/home' as never)}
            className="pointer-events-auto mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm md:text-base font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
            style={{ background: 'var(--cr-primary)' }}
          >
            {t('ctaLabel')}
            <span className="text-base leading-none">→</span>
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="flex flex-col md:flex-row h-full w-full">
        {PANELS.map((panel) => (
          <div
            key={panel.id}
            onClick={() => router.push(`/rezervasyon?kategori=${panel.id}` as never)}
            className="relative flex-1 cursor-pointer min-h-[33vh] md:min-h-0 md:h-full group"
          >
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${panel.img})` }}
            />

            {/* Gradient overlay: dark at bottom, fades upward */}
            <div
              className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 40%, transparent 65%)',
              }}
            />

            {/* Subtle extra darken on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            {/* Content — bottom-aligned */}
            <div className="absolute bottom-0 inset-x-0 z-10 p-6 md:p-8 lg:p-10">
              <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-outfit)' }}>
                {t(panel.labelKey)}
              </h2>
              <p className="text-white/60 text-sm md:text-base mt-1 max-w-[90%]">
                {t(panel.subKey)}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[#E53935] font-semibold text-sm">
                <span>{t('discover')}</span>
                <span className="text-lg leading-none">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
