'use client'
import { motion } from 'motion/react'
import { Link } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CATEGORIES } from './categories'

export default function CategoryTabs() {
  const params = useSearchParams()
  const active = params.get('kategori') ?? ''
  const t = useTranslations('rezervasyon')

  const tabs = [
    { key: '', label: t('allBusinesses'), icon: '🏪', href: '/rezervasyon' as const },
    ...CATEGORIES.map(cat => ({
      key: cat.key,
      label: t(cat.labelKey as Parameters<typeof t>[0]),
      icon: cat.icon,
      href: { pathname: '/rezervasyon' as const, query: { kategori: cat.key } },
    })),
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {tabs.map(tab => {
        const isActive = active === tab.key
        return (
          <motion.div
            key={tab.key}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          >
            <Link
              href={tab.href as never}
              className={`relative shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
