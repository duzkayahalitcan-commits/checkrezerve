export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Suspense } from 'react'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import AnimatedBusinessCards from '@/components/AnimatedBusinessCards'
import CategoryHeroBanner from '@/components/CategoryHeroBanner'
import { getSupabaseAdmin } from '@/lib/supabase'
import { type Restaurant } from '@/types'
import CategoryTabs from './CategoryTabs'
import { getTypesForKey } from './categories'
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

export default async function RezervasyonPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t    = await getTranslations('rezervasyon')
  const tBiz = await getTranslations('businessTypes')

  const { kategori } = await searchParams
  const { data: businesses } = await getSupabaseAdmin()
    .from('restaurants')
    .select('id, name, slug, business_type, address, description, is_active, kategori')
    .eq('is_active', true)
    .order('name')

  const rawList = (businesses ?? []) as (Pick<Restaurant, 'id' | 'name' | 'slug' | 'business_type' | 'address' | 'description' | 'is_active'> & { kategori?: string })[]

  const activeKey   = kategori ?? ''
  const activeTypes = getTypesForKey(activeKey)
  const filtered    = activeTypes
    ? rawList.filter(b => activeTypes.includes(b.business_type))
    : rawList

  const list = filtered.map(b => ({
    ...b,
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

      {/* Category selection + list */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">

          <div className="mb-8">
            <Suspense fallback={<div className="h-10" />}>
              <CategoryTabs />
            </Suspense>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900">
              {activeKey
                ? (LABEL_MAP[activeKey] ?? t('allBusinesses'))
                : t('allBusinesses')}
            </h2>
            <span className="text-sm text-zinc-400">{t('businessCount', { count: list.length })}</span>
          </div>

          <AnimatedBusinessCards
            list={list}
            activeCategory={activeKey}
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

const LABEL_MAP: Record<string, string> = {
  'yeme-icme':    'Yeme & İçme',
  'guzellik':     'Güzellik & Bakım',
  'saglik':       'Sağlık',
  'spor':         'Spor & Fitness',
  'berber':       'Berber',
  'kuafor':       'Kuaför & Salon',
  'spa-masaj':    'Spa & Masaj',
  'psikoloji':    'Psikoloji & Terapi',
  'fizyoterapi':  'Kayropraktik & Fizyoterapi',
  'dis':          'Diş Kliniği',
  'veteriner':    'Veteriner',
  'spor-salonu':  'Spor Salonu & PT',
  'pilates-yoga': 'Pilates & Yoga',
  'restoran':     'Restoran & Kafe',
}
