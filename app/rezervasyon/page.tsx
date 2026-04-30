export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { getSupabaseAdmin } from '@/lib/supabase'
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS, type BusinessType, type Restaurant } from '@/types'
import CategoryTabs, { CATEGORIES } from './CategoryTabs'

export const metadata: Metadata = {
  title: 'Online Rezervasyon — CheckRezerve',
  description: 'Restoran, kuaför, spa ve daha fazlası için online rezervasyon yapın. Hızlı, kolay ve ücretsiz.',
}

const TYPE_BG: Record<string, string> = {
  restaurant:   'bg-orange-50',
  barber:       'bg-sky-50',
  hairdresser:  'bg-fuchsia-50',
  psychologist: 'bg-emerald-50',
  spa:          'bg-teal-50',
  beauty_salon: 'bg-rose-50',
  dentist:      'bg-blue-50',
  fitness:      'bg-amber-50',
  veterinary:   'bg-violet-50',
  other:        'bg-zinc-50',
}

type Props = { searchParams: Promise<{ kategori?: string }> }

export default async function RezervasyonPage({ searchParams }: Props) {
  const { kategori } = await searchParams
  const { data: businesses } = await getSupabaseAdmin()
    .from('restaurants')
    .select('id, name, slug, business_type, address, description, is_active')
    .eq('is_active', true)
    .order('name')

  const all = (businesses ?? []) as Pick<Restaurant, 'id' | 'name' | 'slug' | 'business_type' | 'address' | 'description' | 'is_active'>[]

  // Aktif kategori filtresi
  const activeKey = kategori ?? ''
  const activeCat = CATEGORIES.find(c => c.key === activeKey)
  const list = activeCat
    ? all.filter(b => activeCat.types.includes(b.business_type))
    : all

  const activeLabel = activeCat?.label ?? 'Tüm İşletmeler'

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-28 pb-14 text-white text-center relative"
        style={{
          backgroundImage: "linear-gradient(135deg,rgba(13,18,26,0.88) 0%,rgba(13,110,110,0.65) 100%),url('/images/hero-premium.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <div className="mx-auto max-w-2xl px-6 relative z-10">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            Online Rezervasyon
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            İşletme Seçin,<br />Anında Rezervasyon Yapın
          </h1>
          <p className="text-white/70 text-lg">
            Kayıt gerekmez. Saniyeler içinde yerinizi ayırtın.
          </p>
        </div>
      </section>

      {/* Kategori Seçimi + Liste */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">

          {/* Tabs */}
          <div className="mb-8">
            <Suspense fallback={<div className="h-10" />}>
              <CategoryTabs />
            </Suspense>
          </div>

          {/* Başlık */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900">{activeLabel}</h2>
            <span className="text-sm text-zinc-400">{list.length} işletme</span>
          </div>

          {/* Liste */}
          {list.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-2xl">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-zinc-700 mb-1">Bu kategoride işletme yok</p>
              <p className="text-sm text-zinc-400">Başka bir kategori seçmeyi deneyin.</p>
              <Link
                href="/rezervasyon"
                className="inline-block mt-4 text-sm text-red-600 hover:underline font-semibold"
              >
                Tüm işletmeleri gör →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map(biz => {
                const icon  = BUSINESS_TYPE_ICONS[biz.business_type as BusinessType] ?? '🏪'
                const label = BUSINESS_TYPE_LABELS[biz.business_type as BusinessType] ?? biz.business_type
                const bg    = TYPE_BG[biz.business_type] ?? 'bg-zinc-50'
                return (
                  <Link
                    key={biz.id}
                    href={`/rezervasyon/${biz.id}`}
                    className="rounded-2xl border border-zinc-100 bg-white hover:border-red-200 hover:shadow-md transition-all duration-200 p-5 flex items-start gap-4 group"
                  >
                    <div className={`shrink-0 w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-2xl`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors truncate">
                        {biz.name}
                      </p>
                      <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 mb-2">
                        {label}
                      </span>
                      {biz.address && (
                        <p className="text-xs text-zinc-400 truncate">{biz.address}</p>
                      )}
                    </div>
                    <span className="text-zinc-300 group-hover:text-red-400 text-xl mt-1 transition-colors">›</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
