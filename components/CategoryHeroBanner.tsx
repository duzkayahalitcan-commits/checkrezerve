'use client'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { CATEGORIES, getCategoryForKey } from '@/app/[locale]/rezervasyon/categories'

interface Props {
  badgeText: string
  defaultTitle: string
  defaultSubtitle: string
}

const DEFAULT_OVERLAY =
  "linear-gradient(135deg,rgba(13,18,26,0.92) 0%,rgba(13,110,110,0.70) 100%)"

export default function CategoryHeroBanner({ badgeText, defaultTitle, defaultSubtitle }: Props) {
  const params     = useSearchParams()
  const activeKey  = params.get('kategori') ?? ''
  const cat        = getCategoryForKey(activeKey)
  const overlay    = cat?.heroOverlay ?? DEFAULT_OVERLAY
  const accentColor = cat?.accentColor ?? '#E53935'

  const title = activeKey
    ? (CATEGORIES.find(c => c.key === activeKey)?.labelKey
        ? CATEGORY_LABELS[activeKey] ?? defaultTitle
        : getCategorySubLabel(activeKey) ?? defaultTitle)
    : defaultTitle

  return (
    <section
      className="pt-28 pb-14 text-white text-center relative overflow-hidden"
      style={{
        backgroundImage: `${overlay},url('/images/hero-premium.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.6s ease',
      }}
    >
      {/* Animated gradient overlay for cross-fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey || 'default'}
          className="absolute inset-0"
          style={{ background: overlay }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        />
      </AnimatePresence>

      <div className="mx-auto max-w-2xl px-6 relative z-10">
        <motion.span
          key={`badge-${activeKey}`}
          initial={{ opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="inline-block rounded-full px-4 py-1.5 text-sm font-medium mb-6 border"
          style={{
            backgroundColor: `${accentColor}33`,
            borderColor: `${accentColor}55`,
            color: activeKey ? '#fff' : '#fca5a5',
          }}
        >
          {badgeText}
        </motion.span>

        <AnimatePresence mode="wait">
          <motion.h1
            key={`title-${activeKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
          >
            {title}
          </motion.h1>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-white/70 text-lg"
        >
          {defaultSubtitle}
        </motion.p>
      </div>
    </section>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  'yeme-icme':   'Yeme & İçme',
  'guzellik':    'Güzellik & Bakım',
  'saglik':      'Sağlık',
  'spor':        'Spor & Fitness',
  'berber':      'Berber',
  'kuafor':      'Kuaför & Güzellik',
  'spa-masaj':   'Spa & Masaj',
  'psikoloji':   'Psikoloji & Terapi',
  'fizyoterapi': 'Kayropraktik & Fizyoterapi',
  'dis':         'Diş Kliniği',
  'veteriner':   'Veteriner',
  'spor-salonu': 'Spor Salonu & PT',
  'pilates-yoga':'Pilates & Yoga',
  'restoran':    'Restoran & Kafe',
}

function getCategorySubLabel(key: string): string | null {
  return CATEGORY_LABELS[key] ?? null
}
