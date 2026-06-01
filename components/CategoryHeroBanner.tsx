'use client'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { CATEGORIES, getCategoryForKey } from '@/app/[locale]/rezervasyon/categories'

interface Props {
  badgeText: string
  defaultTitle: string
  defaultSubtitle: string
}

const HERO_BY_KEY: Record<string, string> = {
  '':             'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
  'yeme-icme':    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
  'restoran':     'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
  'guzellik':     'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=80',
  'kuafor':       'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=80',
  'berber':       'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&q=80',
  'spa-masaj':    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80',
  'saglik':       'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80',
  'spor':         'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
  'pilates-yoga': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
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

const DEFAULT_OVERLAY = 'linear-gradient(135deg,rgba(13,31,45,0.92) 0%,rgba(13,31,45,0.62) 100%)'

function resolveHeroImage(activeKey: string): string {
  if (!activeKey) return HERO_BY_KEY['']
  if (HERO_BY_KEY[activeKey]) return HERO_BY_KEY[activeKey]
  const parent = CATEGORIES.find(c => c.subCategories.some(s => s.key === activeKey))
  if (parent && HERO_BY_KEY[parent.key]) return HERO_BY_KEY[parent.key]
  return HERO_BY_KEY['']
}

export default function CategoryHeroBanner({ badgeText, defaultTitle, defaultSubtitle }: Props) {
  const params      = useSearchParams()
  const activeKey   = params.get('kategori') ?? ''
  const cat         = getCategoryForKey(activeKey)
  const overlay     = cat?.heroOverlay ?? DEFAULT_OVERLAY
  const accentColor = cat?.accentColor ?? '#E53935'
  const heroImage   = resolveHeroImage(activeKey)
  const title       = activeKey ? (CATEGORY_LABELS[activeKey] ?? defaultTitle) : defaultTitle

  return (
    <section className="pt-28 pb-14 text-white text-center relative overflow-hidden">
      {/* Background image — crossfade on category change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={heroImage}
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${heroImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        />
      </AnimatePresence>

      {/* Gradient overlay — crossfade on category change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`overlay-${activeKey}`}
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
            borderColor:     `${accentColor}55`,
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
