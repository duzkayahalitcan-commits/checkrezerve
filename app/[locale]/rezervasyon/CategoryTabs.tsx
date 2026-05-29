'use client'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CATEGORIES } from './categories'

export default function CategoryTabs() {
  const params    = useSearchParams()
  const activeKey = params.get('kategori') ?? ''
  const t         = useTranslations('rezervasyon')

  // Find if the active key is a parent or sub-category
  const activeParent = CATEGORIES.find(c =>
    c.key === activeKey || c.subCategories.some(s => s.key === activeKey)
  )

  const tabs = [
    { key: '', label: t('allBusinesses'), icon: '🏪', href: '/rezervasyon' as const },
    ...CATEGORIES.map(cat => ({
      key: cat.key,
      label: t(cat.labelKey as Parameters<typeof t>[0]),
      icon: cat.icon,
      href: { pathname: '/rezervasyon' as const, query: { kategori: cat.key } },
      accentColor: cat.accentColor,
    })),
  ]

  return (
    <div className="space-y-3">
      {/* Parent tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => {
          const isActive = activeKey === tab.key || (tab.key !== '' && activeParent?.key === tab.key)
          return (
            <motion.div
              key={tab.key}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            >
              <Link
                href={tab.href as never}
                className={`relative shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-md border-transparent'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50'
                }`}
                style={isActive && (tab as { accentColor?: string }).accentColor ? {
                  background: (tab as { accentColor?: string }).accentColor,
                  borderColor: (tab as { accentColor?: string }).accentColor,
                  boxShadow: `0 4px 14px ${(tab as { accentColor?: string }).accentColor}55`,
                } : isActive ? {
                  background: '#18181B',
                  borderColor: '#18181B',
                } : {}}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Sub-category chips — animate in when parent is selected */}
      <AnimatePresence>
        {activeParent && (
          <motion.div
            key={activeParent.key}
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide pl-1">
              {activeParent.subCategories.map((sub, i) => {
                const isSubActive = activeKey === sub.key
                return (
                  <motion.div
                    key={sub.key}
                    initial={{ opacity: 0, scale: 0.85, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link
                      href={{ pathname: '/rezervasyon' as const, query: { kategori: sub.key } } as never}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                        isSubActive
                          ? 'bg-zinc-900 border-zinc-900 text-white'
                          : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400'
                      }`}
                    >
                      <span>{sub.icon}</span>
                      {sub.label}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
