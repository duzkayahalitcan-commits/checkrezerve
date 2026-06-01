export const dynamic = 'force-dynamic'

import type { Metadata }     from 'next'
import { Suspense }          from 'react'
import MarketingHeader       from '@/components/MarketingHeader'
import MarketingFooter       from '@/components/MarketingFooter'
import CategoryHeroBanner    from '@/components/CategoryHeroBanner'
import SearchableBusinessList from './SearchableBusinessList'
import { getSupabaseAdmin }  from '@/lib/supabase'
import { type Restaurant }   from '@/types'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Online Rezervasyon — CheckRezerve',
  description: 'Restoran, kuaför, spa ve daha fazlası için online rezervasyon yapın. Hızlı, kolay ve ücretsiz.',
  openGraph: {
    title: 'Online Rezervasyon — CheckRezerve',
    description: 'Restoran, kuaför, spa ve daha fazlası için online rezervasyon yapın.',
    type: 'website',
  },
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ kategori?: string }>
}

export default async function RezervasyonPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t    = await getTranslations('rezervasyon')
  const tBiz = await getTranslations('businessTypes')

  // Fetch ALL active businesses — client component handles filtering
  const { data: businesses } = await getSupabaseAdmin()
    .from('restaurants')
    .select('id, name, slug, business_type, address, description, is_active')
    .eq('is_active', true)
    .order('name')

  const list = (businesses ?? [] as Pick<Restaurant, 'id' | 'name' | 'slug' | 'business_type' | 'address' | 'description' | 'is_active'>[]).map(b => ({
    ...(b as Pick<Restaurant, 'id' | 'name' | 'slug' | 'business_type' | 'address' | 'description' | 'is_active'>),
    typeLabel: tBiz(b.business_type as Parameters<typeof tBiz>[0]),
  }))

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Animated hero — changes background per category */}
      <Suspense fallback={
        <section className="pt-28 pb-14 text-white text-center"
          style={{ background: 'linear-gradient(135deg,rgba(13,18,26,0.92) 0%,rgba(13,110,110,0.70) 100%),url(\'/images/hero-premium.jpg\')', backgroundSize: 'cover' }}>
          <div className="mx-auto max-w-2xl px-6">
            <div className="h-6 w-32 bg-white/20 rounded-full mx-auto mb-6" />
            <div className="h-12 w-64 bg-white/20 rounded-xl mx-auto mb-4" />
          </div>
        </section>
      }>
        <CategoryHeroBanner
          badgeText={t('heroBadge')}
          defaultTitle={t('heroTitle')}
          defaultSubtitle={t('heroSubtitle')}
        />
      </Suspense>

      {/* Search + Category + Business list */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <Suspense fallback={<BusinessListSkeleton />}>
            <SearchableBusinessList allBusinesses={list} />
          </Suspense>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

function BusinessListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-zinc-100 rounded-2xl animate-pulse" />
      <div className="flex gap-2 overflow-hidden">
        {[80, 110, 90, 120, 85].map((w, i) => (
          <div key={i} className="h-9 bg-zinc-100 rounded-full animate-pulse flex-shrink-0" style={{ width: w }} />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-100 bg-zinc-50 h-28 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
