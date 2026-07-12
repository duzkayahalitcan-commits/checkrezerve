import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ReservationForm } from './ReservationForm'
import AIChatbot from '@/components/AIChatbot'
import { BUSINESS_TYPE_ICONS, type BusinessType } from '@/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const [tTerms, tBiz] = await Promise.all([
    getTranslations({ locale, namespace: 'bookingTerms' }),
    getTranslations({ locale, namespace: 'businessTypes' }),
  ])

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, address, business_type')
    .eq('slug', slug)
    .single()

  if (!restaurant) return { title: 'İşletme Bulunamadı' }

  const type  = (restaurant.business_type ?? 'restaurant') as BusinessType
  const term  = tTerms(type as Parameters<typeof tTerms>[0])
  const label = tBiz(type as Parameters<typeof tBiz>[0])

  return {
    title: `${restaurant.name} — Online ${term}`,
    description: `${restaurant.name} için online ${term.toLowerCase()} yapın. ${label}.${restaurant.address ? ` ${restaurant.address}` : ''}`,
  }
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const [t, tTerms] = await Promise.all([
    getTranslations('slugPage'),
    getTranslations('bookingTerms'),
  ])

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!restaurant) notFound()

  const businessType = (restaurant.business_type ?? 'restaurant') as BusinessType
  const termSingular = tTerms(businessType as Parameters<typeof tTerms>[0])
  const icon         = BUSINESS_TYPE_ICONS[businessType]

  const localeKey = locale !== 'tr' ? `_${locale}` : ''

  // Hizmetler, personel, masa tipleri ve AI feature flags (paralel)
  const [{ data: rawServices }, { data: staff }, { data: rawMasaTipleri }, { data: featureFlags }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, name_en, name_ar, name_de, name_da, name_es, name_ru, duration_minutes, price, currency')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('staff')
      .select('id, name, title')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('masa_tipleri')
      .select('id, ad, ad_en, ad_ar, ad_de, ad_da, ad_es, ad_ru, kapasite')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order'),
    supabase
      .from('feature_flags')
      .select('feature, enabled')
      .eq('restaurant_id', restaurant.id),
  ])

  const services = (rawServices ?? []).map((s: Record<string, unknown>) => ({
    id:               s.id as string,
    name:             ((localeKey ? s[`name${localeKey}`] : null) ?? s.name) as string,
    duration_minutes: s.duration_minutes as number,
    price:            s.price as number | null,
    currency:         s.currency as string,
  }))

  const masaTipleri = (rawMasaTipleri ?? []).map((m: Record<string, unknown>) => ({
    id:       m.id as string,
    ad:       ((localeKey ? m[`ad${localeKey}`] : null) ?? m.ad) as string,
    ad_en:    (m.ad_en ?? null) as string | null,
    ad_ar:    (m.ad_ar ?? null) as string | null,
    ad_de:    (m.ad_de ?? null) as string | null,
    ad_da:    (m.ad_da ?? null) as string | null,
    ad_es:    (m.ad_es ?? null) as string | null,
    ad_ru:    (m.ad_ru ?? null) as string | null,
    kapasite: m.kapasite as number,
  }))

  // AI feature flags
  const flagMap = new Map((featureFlags ?? []).map((f: { feature: string; enabled: boolean }) => [f.feature, f.enabled]))
  const hasChatbot     = flagMap.get('ai_chatbot') === true
  const hasReservation  = flagMap.get('ai_reservation') === true
  const hasVoiceSearch  = flagMap.get('ai_voice_search') === true

  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .eq('date', today)

  const UNSPLASH_BY_TYPE: Record<string, string> = {
    restaurant:   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    coffee_shop:  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
    spa:          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    barber:       'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80',
    hairdresser:  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80',
    beauty_salon: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
  }
  const heroPhoto =
    (restaurant.cover_image as string | null) ??
    UNSPLASH_BY_TYPE[businessType] ??
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Hero Photo Banner */}
      <div
        className="relative h-64 sm:h-72 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom,rgba(13,31,45,0.55) 0%,rgba(13,31,45,0.40) 40%,rgba(24,24,27,0.95) 100%),url('${heroPhoto}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-8 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-900/60 mb-3">
            <span className="text-2xl select-none">{icon}</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            {restaurant.name}
          </h1>
          {restaurant.address && (
            <p className="mt-1 text-sm text-stone-300 flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {restaurant.address}
            </p>
          )}
          {typeof count === 'number' && (
            <div className="mt-2 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-stone-300">
                {t('todayCount', { count, term: termSingular.toLowerCase() })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Form Kartı */}
      <div className="px-4 pb-10">
        <div className="mx-auto max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <p className="text-sm font-semibold text-white/90">
                {t('onlineBooking', { term: termSingular })}
              </p>
              <p className="text-xs text-white/70 mt-0.5">{t('freeInstant')}</p>
            </div>

            {(restaurant.special_notes || restaurant.dress_code) && (
              <div className="border-b border-amber-100 bg-amber-50 px-6 py-4 space-y-2">
                {restaurant.dress_code && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-amber-600 shrink-0">👔</span>
                    <div>
                      <span className="font-semibold text-amber-800 text-xs uppercase tracking-wide">
                        {t('dressCode')}
                      </span>
                      <p className="text-amber-700 mt-0.5 leading-snug">{restaurant.dress_code}</p>
                    </div>
                  </div>
                )}
                {restaurant.special_notes && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-amber-600 shrink-0">ℹ️</span>
                    <div>
                      <span className="font-semibold text-amber-800 text-xs uppercase tracking-wide">
                        {t('specialNotes')}
                      </span>
                      <p className="text-amber-700 mt-0.5 leading-snug">{restaurant.special_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-6">
              <ReservationForm
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
                businessType={businessType}
                services={services ?? []}
                staff={staff ?? []}
                masaTipleri={masaTipleri ?? []}
              />
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-stone-500">
            Powered by{' '}
            <span className="text-amber-400 font-medium">checkrezerve</span>
          </p>
        </div>
      </div>

      {/* AI Chatbot */}
      {hasChatbot && (
        <AIChatbot
          restaurantId={restaurant.id}
          hasVoice={hasVoiceSearch}
        />
      )}
    </div>
  )
}
