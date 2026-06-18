import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import RestaurantDetail from './RestaurantDetail'

export const dynamic = 'force-dynamic'

function checkAdmin(raw: string): boolean {
  const adminPw = process.env.ADMIN_PASSWORD ?? ''
  const secret = process.env.ADMIN_SECRET ?? ''
  const expected = createHmac('sha256', secret).update(adminPw).digest('base64')
  return raw === expected
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const jar = await cookies()
  const cookie = jar.get('cr_admin')?.value ?? ''
  if (!checkAdmin(cookie)) redirect('/admin/login')

  const { id } = await params
  const db = getSupabaseAdmin()

  const [
    { data: restaurant },
    { data: featureFlags },
    { data: restaurantUsers },
    { data: subscriptions },
    { data: recentReservations },
  ] = await Promise.all([
    db.from('restaurants').select('*').eq('id', id).single(),
    db.from('feature_flags').select('*').eq('restaurant_id', id),
    db.from('restaurant_users').select('id, username, role, is_active, created_at').eq('restaurant_id', id).order('created_at', { ascending: false }),
    db.from('subscriptions').select('*').eq('restaurant_id', id).maybeSingle(),
    db.from('reservations').select('*').eq('restaurant_id', id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!restaurant) redirect('/admin')

  const { count: calisanlarCount } = await db.from('calisanlar').select('*', { count: 'exact', head: true }).eq('restaurant_id', id)
  const { count: hizmetlerCount } = await db.from('hizmetler').select('*', { count: 'exact', head: true }).eq('restaurant_id', id)
  const { count: totalReservations } = await db.from('reservations').select('*', { count: 'exact', head: true }).eq('restaurant_id', id)

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
