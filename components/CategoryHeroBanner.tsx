'use client'
import { useSearchParams } from 'next/navigation'
import { getCategoryForKey } from '@/app/[locale]/rezervasyon/categories'

interface Props {
  badgeText: string
  defaultTitle: string
  defaultSubtitle: string
}

const CATEGORY_LABELS: Record<string, string> = {
  'yeme-icme':    'Yeme & İçme',
  'guzellik':     'Güzellik & Bakım',
  'saglik':       'Sağlık',
  'spor':         'Spor & Fitness',
  'berber':       'Berber',
  'kuafor':       'Kuaför & Güzellik',
  'spa-masaj':    'Spa & Masaj',
  'psikoloji':    'Psikoloji & Terapi',
  'fizyoterapi':  'Kayropraktik',
  'dis':          'Diş Kliniği',
  'veteriner':    'Veteriner',
  'pilates-yoga': 'Pilates & Yoga',
  'restoran':     'Restoran & Kafe',
}

function hexToRgba(hex: string, alpha: number): string {
  const c = parseInt(hex.replace('#', ''), 16)
  const r = (c >> 16) & 255
  const g = (c >> 8) & 255
  const b = c & 255
  return `rgba(${r},${g},${b},${alpha})`
}

export default function CategoryHeroBanner({ badgeText, defaultTitle, defaultSubtitle }: Props) {
  const params      = useSearchParams()
  const activeKey   = params.get('kategori') ?? ''
  const cat         = getCategoryForKey(activeKey)
  const accentColor = cat?.accentColor ?? '#E53935'
  const title       = activeKey ? (CATEGORY_LABELS[activeKey] ?? defaultTitle) : defaultTitle

  return (
    <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 text-white overflow-hidden bg-[#1A1412]">
      {/* Accent corner glow — category color softly illuminates from top-right */}
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.5)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Subtle second glow bottom-left */}
      <div
        className="absolute -bottom-32 -left-32 w-[350px] h-[350px] rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.3)} 0%, transparent 65%)`,
          filter: 'blur(50px)',
        }}
      />

      {/* Bottom fade to white */}
      <div
        className="absolute bottom-0 inset-x-0 h-24"
        style={{ background: 'linear-gradient(to top, #ffffff 0%, transparent 100%)' }}
      />

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className="inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase mb-4"
            style={{
              backgroundColor: `${hexToRgba(accentColor, 0.12)}`,
              border: `1px solid ${hexToRgba(accentColor, 0.2)}`,
              color: activeKey ? '#f0f0f0' : '#fca5a5',
            }}
          >
            {badgeText}
          </div>

          {/* Title */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.15] mb-3"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
            {defaultSubtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
