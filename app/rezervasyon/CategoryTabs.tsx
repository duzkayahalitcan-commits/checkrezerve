'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export const CATEGORIES = [
  { key: 'yeme-icme',     label: 'Yeme & İçme',       icon: '🍽️',  types: ['restaurant'] },
  { key: 'guzellik',      label: 'Güzellik & Bakım',   icon: '✂️',  types: ['barber', 'hairdresser', 'beauty_salon', 'spa'] },
  { key: 'saglik',        label: 'Sağlık',             icon: '🏥',  types: ['dentist', 'psychologist', 'veterinary'] },
  { key: 'spor',          label: 'Spor & Fitness',     icon: '🏋️', types: ['fitness'] },
  { key: 'diger',         label: 'Diğer',              icon: '🏪',  types: ['other'] },
]

export default function CategoryTabs() {
  const params = useSearchParams()
  const active = params.get('kategori') ?? ''

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href="/rezervasyon"
        className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors
          ${!active
            ? 'bg-zinc-900 border-zinc-900 text-white'
            : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}
      >
        Tümü
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
          {cat.label}
        </Link>
      ))}
    </div>
  )
}
