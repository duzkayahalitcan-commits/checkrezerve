export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { BUSINESS_TYPE_ICONS, type BusinessType, type Restaurant, type Service, type StaffMember } from '@/types'
import BookingForm from './BookingForm'
import BusinessDetailHero from './BusinessDetailHero'
import nextDynamic from 'next/dynamic'

const FloatingAIAssistant = nextDynamic(() => import('@/components/FloatingAIAssistant'))

// Next.js 15+ — params is a Promise
type Props = { params: Promise<{ id: string; locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await getSupabaseAdmin()
    .from('restaurants')
    .select('name, description')
    .eq('id', id)
    .single()

  if (!data) return { title: 'İşletme Bulunamadı' }
  return {
    title: `${data.name} — Online Rezervasyon`,
    description: data.description ?? `${data.name} için online rezervasyon yapın.`,
  }
}

export default async function BusinessDetailPage({ params }: Props) {
  const { id, locale } = await params
  setRequestLocale(locale)
  const t    = await getTranslations('bizDetail')
  const tBiz = await getTranslations('businessTypes')
  const supabase = getSupabaseAdmin()

  const todayStr = new Date().toISOString().split('T')[0]
  const [{ data: biz }, { data: rawServices }, { data: rawStaff }, { data: rawTables }, { data: featureFlags }, { data: rawAreas }, { data: rawOccupiedZones }] = await Promise.all([
    supabase.from('restaurants').select('id, name, slug, phone, address, description, business_type, cover_image, working_hours, kroki_mode, kroki_zones, special_notes, ai_assistant_enabled, ai_assistant_name, ai_assistant_voice').eq('id', id).single(),
    supabase.from('hizmetler').select('id, ad, sure_dakika, fiyat, ad_en, ad_ar, ad_de, ad_da, ad_es, ad_ru').eq('restaurant_id', id).eq('aktif', true).order('created_at'),
    supabase.from('calisanlar').select('id, ad').eq('restaurant_id', id).eq('aktif', true).order('created_at'),
    supabase.from('masa_tipleri').select('id, ad, kapasite, area_id, x, y, width, height, sekil, rotation').eq('isletme_id', id).eq('aktif', true).order('created_at'),
    supabase.from('feature_flags').select('feature, enabled').eq('restaurant_id', id),
    supabase.from('special_areas').select('id, name, color').eq('restaurant_id', id).order('name'),
    supabase.from('reservations')
      .select('zone_id, zone_name, party_size, reserved_date, reserved_time')
      .eq('restaurant_id', id)
      .neq('status', 'cancelled')
      .gte('reserved_date', todayStr)
      .order('reserved_date'),
  ])

  if (!biz) notFound()

  // S4-Sprint: Sesli asistan (FloatingAIAssistant) yalnızca ai_voice_search
  // feature flag'i açıksa göster. speak endpoint'i bu flag'i zorunlu kılıyor;
  // flag kapalıyken buton gösterilirse sessizce hata alır. Uygulama /api/voice
  // kullandığından flag kontrolü yapmaz; web burada flag'e göre gate'lenir.
  const voiceFlagMap = new Map((featureFlags ?? []).map((f: { feature: string; enabled: boolean }) => [f.feature, f.enabled]))
  const voiceSearchEnabled = voiceFlagMap.get('ai_voice_search') === true

  const business = biz as unknown as Restaurant
  const icon  = BUSINESS_TYPE_ICONS[business.business_type as BusinessType] ?? '🏪'
  const label = tBiz(business.business_type as Parameters<typeof tBiz>[0])

  const localeKey = locale !== 'tr' ? `_${locale}` : ''

  // Normalize hizmetler (mobil tablo adı farklı olabilir)
  const hizmetler = (rawServices ?? []).map((h: Record<string, unknown>) => ({
    id:               h.id as string,
    name:             ((localeKey ? h[`ad${localeKey}`] : null) ?? h.name ?? h.ad) as string,
    duration_minutes: (h.duration_minutes ?? h.sure_dakika ?? 30) as number,
    price:            (h.price ?? h.fiyat ?? null) as number | null,
  }))

  // Normalize calisanlar
  const calisanlar = (rawStaff ?? []).map((c: Record<string, unknown>) => ({
    id:    c.id as string,
    name:  (c.name ?? c.ad) as string,
    title: (c.title ?? c.unvan ?? null) as string | null,
  }))

  const floorTables = (rawTables ?? []).map((t: Record<string, unknown>) => ({
    id:       t.id as string,
    label:    (t.ad ?? 'Masa') as string,
    capacity: (t.kapasite ?? 4) as number,
    area_id:  (t.area_id ?? null) as string | null,
    x:        (t.x ?? 0) as number,
    y:        (t.y ?? 0) as number,
    width:    (t.width ?? 80) as number,
    height:   (t.height ?? 80) as number,
    shape:    (t.sekil === 'yuvarlak' ? 'circle' : 'rect') as 'rect' | 'circle',
    rotation: (t.rotation ?? 0) as number,
  }))

  const specialAreas = (rawAreas ?? []).map((a: Record<string, unknown>) => ({
    id:    a.id as string,
    name:  a.name as string,
    color: (a.color ?? null) as string | null,
  }))

  // W-100: kroki_mode/kroki_zones/working_hours biz'den (tek sorgu) gelir
  const krokiMode = (biz as Record<string, unknown> | null)?.kroki_mode as string | undefined
  const krokiZones = (biz as Record<string, unknown> | null)?.kroki_zones as unknown[] ?? []
  const workingHours = (biz as Record<string, unknown> | null)?.working_hours as Record<string, Record<string, unknown>> | null

  // W-100: dolu bölge ID'lerini kapasite bazlı hesapla (tarih+saate göre gruplanmış)
  // BookingForm'da seçilen tarih/saat için detaylı kontrol yapılır.
  // Burada istatistiksel bir ön-filtre uyguluyoruz: tüm gelecek kayıtlarda
  // toplam kişi sayısı kapasiteyi aşan bölgeleri "dolu" işaretle.
  const occupiedZoneIds = new Set<string>()
  if (Array.isArray(krokiZones)) {
    const zoneCapacities = new Map<string, number>()
    const zoneUsage = new Map<string, number>()
    for (const z of krokiZones as Array<Record<string, unknown>>) {
      const zid = z.id as string
      zoneCapacities.set(zid, (z.capacity as number) ?? 0)
      zoneUsage.set(zid, 0)
    }
    for (const r of (rawOccupiedZones ?? [])) {
      const zid = r.zone_id as string
      if (zid && zoneCapacities.has(zid)) {
        zoneUsage.set(zid, (zoneUsage.get(zid) ?? 0) + ((r.party_size as number) ?? 0))
      }
    }
    for (const [zid, used] of zoneUsage) {
      const cap = zoneCapacities.get(zid) ?? 0
      if (cap > 0 && used >= cap) {
        occupiedZoneIds.add(zid)
      }
    }
  }
  const zoneMode = krokiMode === 'zones' && Array.isArray(krokiZones) && krokiZones.length > 0

  const floorPlanEnabled = zoneMode ? true : floorTables.length > 0

  const bookingTerm = ['restaurant', 'other'].includes(business.business_type)
    ? t('termReservation')
    : t('termAppointment')

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <BusinessDetailHero
        restaurantId={business.id}
        name={business.name}
        icon={icon}
        label={label}
        address={business.address ?? null}
        phone={business.phone ?? null}
        description={business.description ?? null}
        backLabel={t('allBusinesses')}
        rating={(business as Record<string, unknown>).rating as number | null ?? null}
        coverImage={(business as Record<string, unknown>).cover_image as string | null ?? null}
      />

      <section className="py-10">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">{t('makeBooking', { term: bookingTerm })}</h2>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
            <BookingForm
              businessId={business.id}
              businessName={business.name}
              businessType={business.business_type}
              hizmetler={hizmetler}
              calisanlar={calisanlar}
              floorPlanEnabled={floorPlanEnabled}
              floorTables={floorTables}
              specialAreas={specialAreas}
              businessAddress={business.address ?? null}
              krokiMode={krokiMode ?? 'tables'}
              krokiZones={krokiZones as Record<string, unknown>[] ?? []}
              workingHours={workingHours ?? null}
              occupiedZoneIds={Array.from(occupiedZoneIds)}
            />
          </div>

          {biz.special_notes && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
              <div className="flex gap-3 text-sm">
                <span className="text-amber-500 shrink-0 text-base">ℹ️</span>
                <div>
                  <span className="font-semibold text-amber-800 text-xs uppercase tracking-wide">
                    {t('specialNotes')}
                  </span>
                  <p className="text-amber-700 mt-0.5 leading-snug">{biz.special_notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <MarketingFooter />

      {voiceSearchEnabled && (
        <FloatingAIAssistant
          restaurantId={business.id}
          restaurantName={business.name}
          restaurantSlug={business.slug}
          assistantName={(biz as Record<string, unknown>).ai_assistant_name as string | null}
          assistantVoice={(biz as Record<string, unknown>).ai_assistant_voice as string | null}
        />
      )}
    </div>
  )
}
