'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link }            from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, X, MapPin } from 'lucide-react'
import { BUSINESS_TYPE_ICONS, type BusinessType } from '@/types'
import { CATEGORIES, getTypesForKey } from './categories'

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

const TYPE_ACCENT: Record<string, string> = {
  restaurant:   '#D97706',
  barber:       '#7C3AED',
  hairdresser:  '#DB2777',
  beauty_salon: '#DB2777',
  spa:          '#0D9488',
  psychologist: '#059669',
  chiropractor: '#059669',
  dentist:      '#2563EB',
  fitness:      '#EA580C',
  pilates:      '#EA580C',
  veterinary:   '#7C3AED',
}
const TYPE_BG: Record<string, string> = {
  restaurant:   'bg-amber-50',
  barber:       'bg-violet-50',
  hairdresser:  'bg-fuchsia-50',
  beauty_salon: 'bg-rose-50',
  spa:          'bg-teal-50',
  psychologist: 'bg-emerald-50',
  chiropractor: 'bg-green-50',
  dentist:      'bg-blue-50',
  fitness:      'bg-orange-50',
  pilates:      'bg-orange-50',
  veterinary:   'bg-violet-50',
}

export default function SearchableBusinessList({ allBusinesses }: { allBusinesses: Biz[] }) {
  const params    = useSearchParams()
  const t         = useTranslations('rezervasyon')
  const activeKey = params.get('kategori') ?? ''
  const [query, setQuery] = useState('')

  // Reset search when category changes
  useEffect(() => { setQuery('') }, [activeKey])

  const filtered = useMemo(() => {
    const activeTypes = getTypesForKey(activeKey)
    let list = activeTypes ? allBusinesses.filter(b => activeTypes.includes(b.business_type)) : allBusinesses

    if (query.trim().length > 0) {
      const q = query.trim().toLowerCase()
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.typeLabel.toLowerCase().includes(q)
      )
    }
    return list
  }, [allBusinesses, activeKey, query])

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
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="İşletme, adres veya hizmet ara…"
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="space-y-3">
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

        {/* Sub-category chips */}
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

      {/* Results header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900">
          {query
            ? `"${query}" için sonuçlar`
            : activeKey
            ? (tabs.find(t => t.key === activeKey)?.label ?? t('allBusinesses'))
            : t('allBusinesses')}
        </h2>
        <span className="text-sm text-zinc-400">{filtered.length} işletme</span>
      </div>

      {/* Business grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="text-center py-20 bg-zinc-50 rounded-2xl"
        >
          <div className="text-5xl mb-4">{query ? '🔍' : '📅'}</div>
          <p className="font-semibold text-zinc-700 mb-1">
            {query ? 'Eşleşen işletme bulunamadı' : t('emptyTitle')}
          </p>
          <p className="text-sm text-zinc-400">
            {query ? 'Farklı bir arama deneyin' : t('emptySubtitle')}
          </p>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mt-4 text-sm text-red-600 font-semibold hover:underline"
            >
              Aramayı temizle
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((biz, i) => {
              const icon   = BUSINESS_TYPE_ICONS[biz.business_type as BusinessType] ?? '🏪'
              const accent = TYPE_ACCENT[biz.business_type] ?? '#E53935'
              const bg     = TYPE_BG[biz.business_type] ?? 'bg-zinc-50'
              return (
                <motion.div
                  key={biz.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3), ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -3, boxShadow: `0 12px 32px ${accent}22` }}
                  className="rounded-2xl border border-zinc-100 bg-white overflow-hidden group cursor-pointer"
                  style={{ willChange: 'transform' }}
                >
                  <Link
                    href={{ pathname: '/rezervasyon/[id]', params: { id: biz.id } }}
                    className="flex items-start gap-4 p-5 h-full"
                  >
                    {/* Icon area */}
                    <div
                      className={`shrink-0 w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-2xl`}
                      style={{ boxShadow: `inset 0 0 0 1px ${accent}20` }}
                    >
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors truncate leading-snug">
                        {biz.name}
                      </p>
                      <span
                        className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 mb-2"
                        style={{ backgroundColor: `${accent}15`, color: accent }}
                      >
                        {biz.typeLabel}
                      </span>
                      {biz.address && (
                        <p className="flex items-center gap-1 text-xs text-zinc-400 truncate">
                          <MapPin size={10} className="flex-shrink-0 text-zinc-300" />
                          {biz.address}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <motion.span
                      className="text-zinc-300 group-hover:text-red-400 text-xl mt-1 flex-shrink-0"
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
        </AnimatePresence>
      )}
    </div>
  )
}
