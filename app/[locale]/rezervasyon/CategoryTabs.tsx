'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

const CATEGORIES = [
  { key: 'yeme-icme', labelKey: 'catFoodDrink', icon: '🍽️' },
  { key: 'guzellik',  labelKey: 'catBeauty',    icon: '💆' },
  { key: 'saglik',    labelKey: 'catHealth',     icon: '🏥' },
  { key: 'spor',      labelKey: 'catSports',     icon: '🏋️' },
]

export default function CategoryTabs() {
  const params = useSearchParams()
  const active = params.get('kategori') ?? ''
  const t = useTranslations('rezervasyon')

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href="/rezervasyon"
        className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors
          ${!active
            ? 'bg-zinc-900 border-zinc-900 text-white'
            : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}
      >
        {t('allBusinesses')}
      </Link>
      {CATEGORIES.map(cat => (
        <Link
          key={cat.key}
          href={`/rezervasyon?kategori=${cat.key}`}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors
            ${active === cat.key
              ? 'bg-zinc-900 border-zinc-900 text-white'
              : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}
        >
          <span>{cat.icon}</span>
          {t(cat.labelKey as Parameters<typeof t>[0])}
        </Link>
      ))}
    </div>
  )
}
