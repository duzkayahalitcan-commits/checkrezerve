import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import TodayView from './TodayView'

export const dynamic = 'force-dynamic'

export default async function BugunPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const { t } = await searchParams
  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, slug, capacity, working_hours')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  const selectedDate = t && /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : new Date().toISOString().slice(0, 10)

  // Fetch today's reservations
  const { data: rawReservations } = await db
    .from('reservations')
    .select(`
      id, guest_name, guest_phone, reserved_date, reserved_time,
      party_size, special_requests, status, source, special_area_id, table_id, masa_tipi_id,
      calisan_id, hizmet_id, created_at,
      calisanlar(ad),
      hizmetler(ad, fiyat),
      special_areas!left(name)
    `)
    .eq('restaurant_id', restaurant.id)
    .eq('reserved_date', selectedDate)
    .order('reserved_time', { ascending: true })

  // Supabase returns related tables as arrays; unwrap for component types
  const reservations = rawReservations?.map(r => ({
    ...r,
    calisanlar: (r.calisanlar as { ad: string }[] | null)?.[0] ?? null,
    hizmetler: (r.hizmetler as { ad: string; fiyat: number }[] | null)?.[0] ?? null,
    special_areas: (r.special_areas as { name: string }[] | null)?.[0] ?? null,
  }))

  // Masaları kanonik kaynaktan çek: `masa_tipleri` (legacy `tables` okunmaz)
  const { data: masaTipleri } = await db
    .from('masa_tipleri')
    .select('id, isletme_id, ad, kapasite, aktif, x, y, width, height, sekil, rotation')
    .eq('isletme_id', restaurant.id)
    .eq('aktif', true)
    .order('ad')

  const tables = (masaTipleri ?? []).map(t => ({
    id: t.id,
    label: t.ad,
    capacity: t.kapasite,
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    shape: t.sekil === 'yuvarlak' ? 'circle' : 'rect',
    is_active: t.aktif,
  }))

  // Fetch special areas
  const { data: areas } = await db
    .from('special_areas')
    .select('id, name, capacity')
    .eq('restaurant_id', restaurant.id)
    .order('name')

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Bugün</h1>
      </div>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <TodayView
          restaurantId={restaurant.id}
          date={selectedDate}
          reservations={reservations ?? []}
          tables={tables ?? []}
          areas={areas ?? []}
        />
      </main>
    </div>
  )
}
