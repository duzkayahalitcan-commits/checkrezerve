'use client'
import { motion } from 'motion/react'
import { Link } from '@/i18n/navigation'
import { BUSINESS_TYPE_ICONS, type BusinessType } from '@/types'

const TYPE_BG: Record<string, string> = {
  restaurant:   'bg-amber-50',
  barber:       'bg-sky-50',
  hairdresser:  'bg-fuchsia-50',
  beauty_salon: 'bg-rose-50',
  psychologist: 'bg-emerald-50',
  chiropractor: 'bg-green-50',
  spa:          'bg-teal-50',
  dentist:      'bg-blue-50',
  fitness:      'bg-orange-50',
  pilates:      'bg-orange-50',
  veterinary:   'bg-violet-50',
  other:        'bg-zinc-50',
}

const TYPE_ACCENT: Record<string, string> = {
  restaurant:   '#D97706',
  barber:       '#DB2777',
  hairdresser:  '#DB2777',
  beauty_salon: '#DB2777',
  spa:          '#DB2777',
  psychologist: '#059669',
  chiropractor: '#059669',
  dentist:      '#059669',
  veterinary:   '#059669',
  fitness:      '#EA580C',
  pilates:      '#EA580C',
}

type Biz = {
  id: string
  name: string
  slug: string | null
  business_type: string
  typeLabel: string
  address: string | null
  description: string | null
  is_active: boolean
}

interface Props {
  list: Biz[]
  activeCategory?: string
  emptyTitle: string
  emptySubtitle: string
  emptyLink: string
}

export default function AnimatedBusinessCards({ list, activeCategory: _activeCategory, emptyTitle, emptySubtitle, emptyLink }: Props) {
  if (list.length === 0) {
    return (
      <motion.div
        className="text-center py-20 bg-zinc-50 rounded-2xl"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-semibold text-zinc-700 mb-1">{emptyTitle}</p>
        <p className="text-sm text-zinc-400 mb-4">{emptySubtitle}</p>
        <Link href="/rezervasyon" className="inline-block text-sm text-red-600 hover:underline font-semibold">
          {emptyLink}
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((biz, i) => {
        const icon   = BUSINESS_TYPE_ICONS[biz.business_type as BusinessType] ?? '🏪'
        const label  = biz.typeLabel
        const bg     = TYPE_BG[biz.business_type] ?? 'bg-zinc-50'
        const accent = TYPE_ACCENT[biz.business_type] ?? '#E53935'
        return (
          <motion.div
            key={biz.id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -4, boxShadow: `0 16px 40px ${accent}28` }}
            className="rounded-2xl border border-zinc-100 bg-white"
            style={{ willChange: 'transform' }}
          >
            <Link
              href={{ pathname: '/rezervasyon/[id]', params: { id: biz.id } }}
              className="flex items-start gap-4 p-5 h-full group"
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-2xl`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors truncate">
                  {biz.name}
                </p>
                <span
                  className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 mb-2"
                  style={{ backgroundColor: `${accent}18`, color: accent }}
                >
                  {label}
                </span>
                {biz.address && (
                  <p className="text-xs text-zinc-400 truncate">{biz.address}</p>
                )}
              </div>
              <motion.span
                className="text-zinc-300 group-hover:text-red-400 text-xl mt-1"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                ›
              </motion.span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
