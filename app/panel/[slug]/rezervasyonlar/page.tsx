import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getLocale } from 'next-intl/server'
import RezervasyonList from './RezervasyonList'

export const dynamic = 'force-dynamic'

export default async function RezervasyonlarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ durum?: string; tarih?: string; ara?: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const filters = await searchParams
  const db = getSupabaseAdmin()
  const locale = await getLocale()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  // Fetch all reservations (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)

  let query = db
    .from('reservations')
    .select(`
      id, guest_name, guest_phone, reserved_date, reserved_time,
      party_size, notes, status, source, special_area_id, table_id,
      calisan_id, hizmet_id, created_at,
      calisanlar(ad),
      hizmetler(ad, fiyat),
      special_areas!left(name)
    `)
    .eq('restaurant_id', restaurant.id)
    .gte('reserved_date', ninetyDaysAgo)
    .order('reserved_date', { ascending: false })
    .order('reserved_time', { ascending: false })

  // Apply filters from URL
  if (filters.durum && filters.durum !== 'all') {
    query = query.eq('status', filters.durum)
  }
  if (filters.tarih) {
    query = query.eq('reserved_date', filters.tarih)
  }
  if (filters.ara) {
    query = query.or(
      `guest_name.ilike.%${filters.ara}%,guest_phone.ilike.%${filters.ara}%`
    )
  }

  const { data: rawReservations } = await query

  // Supabase returns related tables as arrays; unwrap for component types
  const reservations = rawReservations?.map(r => ({
    ...r,
    calisanlar: (r.calisanlar as { ad: string }[] | null)?.[0] ?? null,
    hizmetler: (r.hizmetler as { ad: string; fiyat: number }[] | null)?.[0] ?? null,
    special_areas: (r.special_areas as { name: string }[] | null)?.[0] ?? null,
  }))

  // Fetch çalışanlar and hizmetler for filter dropdowns
  const [{ data: calisanlar }, { data: hizmetler }, { data: areas }] = await Promise.all([
    db.from('staff').select('id, ad').eq('restaurant_id', restaurant.id).eq('aktif', true).order('ad'),
    db.from('services').select('id, ad').eq('restaurant_id', restaurant.id).eq('aktif', true).order('ad'),
    db.from('special_areas').select('id, name').eq('restaurant_id', restaurant.id).order('name'),
  ])

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Rezervasyonlar</h1>
      </div>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <RezervasyonList
          reservations={reservations ?? []}
          calisanlar={calisanlar ?? []}
          hizmetler={hizmetler ?? []}
          areas={areas ?? []}
          filters={filters}
          locale={locale}
        />
      </main>
    </div>
  )
}
