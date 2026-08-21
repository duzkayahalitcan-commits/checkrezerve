import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import RestaurantDetail from './RestaurantDetail'

export const dynamic = 'force-dynamic'

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params
  const db = getSupabaseAdmin()

  const [
    { data: restaurant },
    { data: featureFlags },
    { data: restaurantUsers },
    { data: subscriptions },
    { data: recentReservations },
  ] = await Promise.all([
    db.from('restaurants').select('id, name, slug, phone, address, capacity, business_type, is_active, created_at').eq('id', id).single(),
    db.from('feature_flags').select('id, restaurant_id, feature, enabled').eq('restaurant_id', id),
    db.from('restaurant_users').select('id, username, role, is_active, created_at').eq('restaurant_id', id).order('created_at', { ascending: false }),
    db.from('subscriptions').select('id, restaurant_id, plan, status, billing_period, current_period_end').eq('restaurant_id', id).maybeSingle(),
    db.from('reservations').select('id, restaurant_id, guest_name, reserved_date, reserved_time, party_size, status, created_at').eq('restaurant_id', id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!restaurant) redirect('/admin')

  const { count: calisanlarCount } = await db.from('calisanlar').select('id', { count: 'exact', head: true }).eq('restaurant_id', id)
  const { count: hizmetlerCount } = await db.from('hizmetler').select('id', { count: 'exact', head: true }).eq('restaurant_id', id)
  const { count: totalReservations } = await db.from('reservations').select('id', { count: 'exact', head: true }).eq('restaurant_id', id)

  return (
    <RestaurantDetail
      restaurant={restaurant}
      featureFlags={featureFlags ?? []}
      users={restaurantUsers ?? []}
      subscription={subscriptions}
      recentReservations={recentReservations ?? []}
      stats={{ calisanlarCount: calisanlarCount ?? 0, hizmetlerCount: hizmetlerCount ?? 0, totalReservations: totalReservations ?? 0 }}
    />
  )
}
