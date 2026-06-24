'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link }            from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Search, X, MapPin, SlidersHorizontal,
  LayoutGrid, UtensilsCrossed, Sparkles, HeartPulse, Dumbbell,
  Scissors, Wand2, Waves, Brain, Activity, PawPrint, Stethoscope,
  type LucideIcon,
} from 'lucide-react'
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
  cover_image: string | null
  rating: number | null
  reviewCount: number
}

function StarRating({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || count === 0) {
    return <span className="text-[10px] text-zinc-400">Henüz değerlendirme yok</span>
  }
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating)
        const half   = !filled && i < rating
        return (
          <span key={i} className={`text-[11px] ${filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-zinc-300'}`}>
            ★
          </span>
        )
      })}
      <span className="text-[10px] text-zinc-400 ml-0.5">{rating.toFixed(1)} ({count})</span>
    </span>
  )
}

const CAT_ICON: Record<string, LucideIcon> = {
  '':           LayoutGrid,
  'yeme-icme':  UtensilsCrossed,
  'guzellik':   Sparkles,
  'saglik':     HeartPulse,
  'spor':       Dumbbell,
}

const SUB_ICON: Record<string, LucideIcon> = {
  'berber':       Scissors,
  'kuafor':       Wand2,
  'spa-masaj':    Waves,
  'psikoloji':    Brain,
  'fizyoterapi':  Activity,
  'dis':          Stethoscope,
  'veteriner':    PawPrint,
  'pilates-yoga': Activity,
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

const TYPE_UNSPLASH: Record<string, string> = {
  restaurant:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80',
  barber:       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80',
  hairdresser:  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80',
  beauty_salon: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=200&q=80',
  spa:          'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=200&q=80',
  fitness:      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=80',
  pilates:      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=80',
}

export default function SearchableBusinessList({ allBusinesses }: { allBusinesses: Biz[] }) {
  const params    = useSearchParams()
  const t         = useTranslations('rezervasyon')
  const activeKey = params.get('kategori') ?? ''
  const [query, setQuery]             = useState('')
  const [sehir, setSehir]             = useState('')
  const [filterOpen, setFilterOpen]   = useState(false)

  const rawSiralama = params.get('siralama') ?? 'yeni'
  const [siralama, setSiralama] = useState(rawSiralama)

  useEffect(() => { setQuery(''); setSehir('') }, [activeKey])

  // Extract unique city names from addresses
  const cities = useMemo(() => {
    const set = new Set<string>()
    for (const b of allBusinesses) {
      if (!b.address) continue
      const parts = b.address.split(/[,/]/).map(s => s.trim()).filter(Boolean)
      if (parts.length > 0) set.add(parts[parts.length - 1])
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [allBusinesses])

  const activeFilterCount = (sehir ? 1 : 0)

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

    if (sehir) {
      list = list.filter(b => b.address?.includes(sehir))
    }

    if (siralama === 'yeni') {
      list = [...list].reverse()
    } else if (siralama === 'az') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    }

    return list
  }, [allBusinesses, activeKey, query, sehir, siralama])

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
      <div className="relative transition-shadow duration-300 focus-within:shadow-[0_4px_24px_rgba(229,57,53,0.12)] rounded-2xl">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10"
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="İşletme, adres veya hizmet ara…"
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-300"
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
            const Icon = CAT_ICON[tab.key] ?? LayoutGrid
            return (
              <motion.div
                key={tab.key}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 600, damping: 28 }}
              >
                <Link
                  href={tab.href as never}
                  className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 flex-1 min-w-fit ${
                    isActive
                      ? 'bg-red-600 text-white border-transparent shadow-md shadow-red-200'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-zinc-400'} />
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
              initial={false}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide pl-1">
                {activeParent.subCategories.map((sub, i) => {
                  const isSubActive = activeKey === sub.key
                  const SubIcon = SUB_ICON[sub.key] ?? Scissors
                  return (
                    <motion.div
                      key={sub.key}
                      initial={false}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      whileTap={{ scale: 0.93 }}
                    >
                      <Link
                        href={{ pathname: '/rezervasyon' as const, query: { kategori: sub.key } } as never}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 flex-1 min-w-fit ${
                          isSubActive
                            ? 'bg-red-600 border-transparent text-white shadow-md shadow-red-200'
                            : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300'
                        }`}
                      >
                        <SubIcon size={13} className={isSubActive ? 'text-white' : 'text-zinc-400'} />
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

      {/* Results header + sort chips */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-base font-bold text-zinc-900">
          {query
            ? `"${query}" için sonuçlar`
            : activeKey
            ? (tabs.find(t => t.key === activeKey)?.label ?? t('allBusinesses'))
            : t('allBusinesses')}
          <span className="text-zinc-400 font-normal text-sm ml-2">({filtered.length})</span>
        </h2>
        <div className="flex gap-1.5 items-center">
          {/* Filter button */}
          <button
            onClick={() => setFilterOpen(true)}
            className={`relative flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
              activeFilterCount > 0
                ? 'bg-red-600 text-white border-transparent'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <SlidersHorizontal size={12} />
            Filtreler
            {activeFilterCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 bg-white text-red-600 rounded-full text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          {(['yeni', 'az', 'yakin'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSiralama(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                siralama === s
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {s === 'yeni' ? 'En Yeni' : s === 'az' ? 'A–Z' : 'Yakın'}
            </button>
          ))}
          {(siralama !== 'yeni' || query || activeKey || sehir) && (
            <button
              onClick={() => { setSiralama('yeni'); setQuery(''); setSehir('') }}
              className="text-xs px-2.5 py-1.5 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors"
              title="Filtreleri temizle"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Drawer */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-zinc-900">Filtreler</h3>
              <button onClick={() => setFilterOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X size={18} />
              </button>
            </div>

            {/* Şehir filter */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Şehir / İlçe</label>
              <select
                value={sehir}
                onChange={e => setSehir(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              >
                <option value="">Tümü</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setSehir(''); setFilterOpen(false) }}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Temizle
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#E53935] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Uygula ({filtered.length} sonuç)
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="flex flex-col gap-3">
            {filtered.map((biz) => {
              const icon     = BUSINESS_TYPE_ICONS[biz.business_type as BusinessType] ?? '🏪'
              const accent   = TYPE_ACCENT[biz.business_type] ?? '#E53935'
              const bg       = TYPE_BG[biz.business_type] ?? 'bg-zinc-50'
              const thumbSrc = biz.cover_image ?? TYPE_UNSPLASH[biz.business_type] ?? null
              return (
                <motion.div
                  key={biz.id}
                  layout
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-2xl border border-zinc-100 bg-white overflow-hidden group"
                  style={{ willChange: 'transform' }}
                >
                  <div className="flex items-center gap-0">
                    {/* Thumbnail — left */}
                    <div
                      className={`w-24 h-24 flex-shrink-0 overflow-hidden relative ${bg} flex items-center justify-center text-3xl`}
                    >
                      {thumbSrc ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={thumbSrc}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="eager"
                        />
                      ) : (
                        <span>{icon}</span>
                      )}
                    </div>

                    {/* Content — right */}
                    <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center">
                      <p className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors truncate leading-snug text-sm">
                        {biz.name}
                      </p>
                      <span
                        className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 mb-1.5 self-start"
                        style={{ backgroundColor: `${accent}15`, color: accent }}
                      >
                        {biz.typeLabel}
                      </span>
                      <StarRating rating={biz.rating} count={biz.reviewCount} />
                      {biz.address && (
                        <p className="flex items-center gap-1 text-xs text-zinc-400 truncate mt-0.5">
                          <MapPin size={10} className="flex-shrink-0 text-zinc-300" />
                          {biz.address}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="pr-4 flex-shrink-0">
                      <Link
                        href={{ pathname: '/rezervasyon/[id]', params: { id: biz.id } }}
                        className="inline-block text-xs font-bold px-3 py-2 rounded-xl text-white transition-colors"
                        style={{ backgroundColor: accent }}
                      >
                        Rezervasyon Yap
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
