export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import AnimatedBusinessCards from '@/components/AnimatedBusinessCards'
import { getSupabaseAdmin } from '@/lib/supabase'
import { type Restaurant } from '@/types'
import CategoryTabs from './CategoryTabs'
import { CATEGORIES } from './categories'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Online Rezervasyon — CheckRezerve',
  description: 'Restoran, kuaför, spa ve daha fazlası için online rezervasyon yapın. Hızlı, kolay ve ücretsiz.',
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

  const rawList = (businesses ?? []) as Pick<Restaurant, 'id' | 'name' | 'slug' | 'business_type' | 'address' | 'description' | 'is_active'>[]

  const activeKey = kategori ?? ''
  const activeCat = CATEGORIES.find(c => c.key === activeKey)
  const filtered = activeCat
    ? rawList.filter(b => activeCat.types.includes(b.business_type))
    : rawList

  // Pre-resolve labels server-side so we can pass plain data to client component
  const list = filtered.map(b => ({
    ...b,
    typeLabel: tBiz(b.business_type as Parameters<typeof tBiz>[0]),
  }))

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

          <AnimatedBusinessCards
            list={list}
            emptyTitle={t('emptyTitle')}
            emptySubtitle={t('emptySubtitle')}
            emptyLink={t('emptyLink')}
          />
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
