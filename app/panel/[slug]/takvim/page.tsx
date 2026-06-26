import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import TakvimClient from './TakvimClient'

export const dynamic = 'force-dynamic'

type SP = Promise<{ view?: string; g?: string }>

export default async function TakvimPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: SP
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const { view, g } = await searchParams
  const viewMode = (view === 'haftalik' ? 'weekly' : view === 'gunluk' ? 'daily' : 'monthly') as 'daily' | 'weekly' | 'monthly'

  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, onboarding_completed')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')
  if (!restaurant.onboarding_completed) redirect(`/panel/${slug}/onboarding`)

  // Veri aralığını belirle — 3 ay ileri
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().slice(0, 10)

  const { data: rawReservations } = await db
    .from('reservations')
    .select(`
      id, guest_name, guest_phone, guest_email,
      reserved_date, reserved_time,
      party_size, status, notes,
      table_id, calisan_id, hizmet_id, special_area_id,
      is_deleted,
      calisanlar!left(ad),
      hizmetler!left(ad),
      masa_tipleri!left(ad)
    `)
    .eq('restaurant_id', restaurant.id)
    .gte('reserved_date', startDate)
    .lte('reserved_date', endDate)
    .order('reserved_date', { ascending: true })
    .order('reserved_time', { ascending: true })

  const reservations = (rawReservations ?? []).map(r => ({
    ...r,
    is_deleted: r.is_deleted ?? false,
  }))

  return (
    <TakvimClient
      slug={slug}
      restaurantId={restaurant.id}
      initialReservations={reservations}
      viewMode={viewMode}
    />
  )
}
