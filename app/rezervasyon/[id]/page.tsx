export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { getSupabaseAdmin } from '@/lib/supabase'
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS, type BusinessType, type Restaurant, type Service, type StaffMember } from '@/types'
import BookingForm from './BookingForm'

// Next.js 15+ — params is a Promise
type Props = { params: Promise<{ id: string }> }

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
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const [{ data: biz }, { data: rawServices }, { data: rawStaff }, { data: rawMasa }, { data: rawTables }] = await Promise.all([
    supabase.from('restaurants').select('*').eq('id', id).single(),
    supabase.from('hizmetler').select('*').eq('isletme_id', id).eq('aktif', true).order('sira'),
    supabase.from('calisanlar').select('*').eq('isletme_id', id).eq('aktif', true).order('sira'),
    supabase.from('masa_tipleri').select('*').eq('isletme_id', id).eq('aktif', true).order('kapasite'),
    supabase.from('tables').select('*').eq('restaurant_id', id).eq('is_active', true).order('created_at'),
  ])

  if (!biz) notFound()

  const business = biz as Restaurant
  const icon  = BUSINESS_TYPE_ICONS[business.business_type as BusinessType] ?? '🏪'
  const label = BUSINESS_TYPE_LABELS[business.business_type as BusinessType] ?? business.business_type

  // Normalize hizmetler (mobil tablo adı farklı olabilir)
  const hizmetler = (rawServices ?? []).map((h: Record<string, unknown>) => ({
    id:               h.id as string,
    name:             (h.name ?? h.ad) as string,
    duration_minutes: (h.duration_minutes ?? h.sure_dakika ?? 30) as number,
    price:            (h.price ?? h.fiyat ?? null) as number | null,
  }))

  // Normalize calisanlar
  const calisanlar = (rawStaff ?? []).map((c: Record<string, unknown>) => ({
    id:    c.id as string,
    name:  (c.name ?? c.ad) as string,
    title: (c.title ?? c.unvan ?? null) as string | null,
  }))

  // Normalize masa tipleri
  const masaTipleri = (rawMasa ?? []).map((m: Record<string, unknown>) => ({
    id:       m.id as string,
    ad:       (m.ad ?? m.name) as string,
    kapasite: (m.kapasite ?? m.capacity ?? 4) as number,
  }))

  const floorTables = (rawTables ?? []).map((t: Record<string, unknown>) => ({
    id:       t.id as string,
    label:    (t.label ?? 'Masa') as string,
    capacity: (t.capacity ?? 4) as number,
    x:        (t.x ?? 0) as number,
    y:        (t.y ?? 0) as number,
    width:    (t.width ?? 80) as number,
    height:   (t.height ?? 80) as number,
    shape:    (t.shape === 'circle' ? 'circle' : 'rect') as 'rect' | 'circle',
  }))

  const floorPlanEnabled = Boolean((business as Record<string, unknown>).floor_plan_enabled)
    && floorTables.length > 0

  const bookingTerm = ['restaurant', 'other'].includes(business.business_type)
    ? 'Rezervasyon'
    : 'Randevu'

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <div className="pt-24 pb-6 bg-zinc-900 text-white">
        <div className="mx-auto max-w-3xl px-6">
          <Link href="/rezervasyon" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Tüm İşletmeler
          </Link>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl shrink-0">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{business.name}</h1>
              <span className="inline-block bg-red-600/25 text-red-300 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">
                {label}
              </span>
            </div>
          </div>

          {(business.address || business.phone) && (
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-400">
              {business.address && (
                <span>📍 {business.address}</span>
              )}
              {business.phone && (
                <a href={`tel:${business.phone}`} className="hover:text-white transition-colors">
                  📞 {business.phone}
                </a>
              )}
            </div>
          )}

          {business.description && (
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-xl">
              {business.description}
            </p>
          )}
        </div>
      </div>

      <section className="py-10">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">{bookingTerm} Yap</h2>
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
            <BookingForm
              businessId={business.id}
              businessName={business.name}
              businessType={business.business_type}
              masaTipleri={masaTipleri}
              hizmetler={hizmetler}
              calisanlar={calisanlar}
              floorPlanEnabled={floorPlanEnabled}
              floorTables={floorTables}
            />
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
