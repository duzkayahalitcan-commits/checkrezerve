'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Restaurant } from '@/types'
import { QRCodeButton } from './restaurants/QRCodeButton'

const PAGE_SIZE = 20

type Props = {
  restaurants: Pick<Restaurant, 'id' | 'name' | 'slug'>[]
}

export function RestaurantList({ restaurants }: Props) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search.trim()) return restaurants
    const q = search.toLowerCase().trim()
    return restaurants.filter(
      (r) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q)
    )
  }, [restaurants, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const paginated = filtered.slice(start, start + PAGE_SIZE)

  // Sayfa değişince geçerli sayfaya sıçra
  if (safePage !== page) setPage(safePage)

  return (
    <div className="flex flex-col gap-3">
      {/* Arama */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Restoran ara (isim veya slug)..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-sm text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Sayfa bilgisi */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          {filtered.length} restoran
          {search && ` (${search} için)`}
        </span>
        {totalPages > 1 && (
          <span>
            Sayfa {safePage} / {totalPages}
          </span>
        )}
      </div>

      {/* Liste */}
      {paginated.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/3 px-4 py-8 text-center text-sm text-stone-500">
          {search ? 'Aramanızla eşleşen restoran bulunamadı.' : 'Henüz restoran eklenmemiş.'}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {paginated.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <span className="text-sm text-stone-200 truncate">{r.name}</span>
                <span className="text-xs text-stone-600 shrink-0">/{r.slug}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
                >
                  Aç ↗
                </a>
                <Link
                  href={`/admin/restaurants/${r.id}`}
                  className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
                >
                  Yönet →
                </Link>
                <Link
                  href={`/admin/floor-plan/${r.id}`}
                  className="text-xs text-stone-500 hover:text-blue-400 transition-colors"
                  title="Masa krokisini düzenle"
                >
                  🗺 Kroki
                </Link>
                <QRCodeButton slug={r.slug} name={r.name} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sayfalama butonları */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Önceki
          </button>
          <span className="text-xs text-stone-500 px-2">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  )
}
