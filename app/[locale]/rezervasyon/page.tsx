export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { getSupabaseAdmin } from '@/lib/supabase'
import { BUSINESS_TYPE_ICONS, type BusinessType, type Restaurant } from '@/types'
import CategoryTabs from './CategoryTabs'
import { CATEGORIES } from './categories'
import { getTranslations, setRequestLocale } from 'next-intl/server'

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

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ kategori?: string }>
}

export default async function RezervasyonPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t    = await getTranslations('rezervasyon')
  const tBiz = await getTranslations('businessTypes')

  const { kategori } = await searchParams
  const { data: businesses } = await getSupabaseAdmin()
    .from('restaurants')
    .select('id, name, slug, business_type, address, description, is_active')
    .eq('is_active', true)
    .order('name')

  const all = (businesses ?? []) as Pick<Restaurant, 'id' | 'name' | 'slug' | 'business_type' | 'address' | 'description' | 'is_active'>[]

  const activeKey = kategori ?? ''
  const activeCat = CATEGORIES.find(c => c.key === activeKey)
  const list = activeCat
    ? all.filter(b => activeCat.types.includes(b.business_type))
    : all

  const activeLabel = activeCat ? t(activeCat.labelKey as Parameters<typeof t>[0]) : t('allBusinesses')

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
            {t('heroBadge')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-white/70 text-lg">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Category selection + list */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">

          {/* Tabs */}
          <div className="mb-8">
            <Suspense fallback={<div className="h-10" />}>
              <CategoryTabs />
            </Suspense>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900">{activeLabel}</h2>
            <span className="text-sm text-zinc-400">{t('businessCount', { count: list.length })}</span>
          </div>

          {/* List */}
          {list.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-2xl">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-zinc-700 mb-1">{t('emptyTitle')}</p>
              <p className="text-sm text-zinc-400">{t('emptySubtitle')}</p>
              <Link
                href="/rezervasyon"

                className="inline-block mt-4 text-sm text-red-600 hover:underline font-semibold"
              >
                {t('emptyLink')}
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map(biz => {
                const icon  = BUSINESS_TYPE_ICONS[biz.business_type as BusinessType] ?? '🏪'
                const label = tBiz(biz.business_type as Parameters<typeof tBiz>[0])
                const bg    = TYPE_BG[biz.business_type] ?? 'bg-zinc-50'
                return (
                  <Link
                    key={biz.id}
                    href={{ pathname: '/rezervasyon/[id]', params: { id: biz.id } }}
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
