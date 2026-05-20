import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ReservationForm } from './ReservationForm'
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

  // Hizmetler, personel ve masa tipleri (paralel)
  const [{ data: rawServices }, { data: staff }, { data: rawMasaTipleri }] = await Promise.all([
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

  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .eq('date', today)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950">
      {/* Hero */}
      <div className="relative px-6 pt-14 pb-10 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-900/50">
            <span className="text-3xl select-none">{icon}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {restaurant.name}
            </h1>
            {restaurant.address && (
              <p className="mt-1 text-sm text-stone-400 flex items-center justify-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {restaurant.address}
              </p>
            )}
          </div>

          {typeof count === 'number' && (
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
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
    </div>
  )
}
