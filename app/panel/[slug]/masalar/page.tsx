import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import MasalarContent from './MasalarContent'

export const dynamic = 'force-dynamic'

export default async function MasalarPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')
  const { slug } = await params
  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, slug, onboarding_completed')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')
  if (!restaurant.onboarding_completed) redirect(`/panel/${slug}/onboarding`)

  const today = new Date().toISOString().slice(0, 10)

  const [{ data: tables }, { data: areas }, { data: todayReservations }] = await Promise.all([
    db.from('tables').select('*').eq('restaurant_id', restaurant.id).order('label'),
    db.from('special_areas').select('*').eq('restaurant_id', restaurant.id).order('name'),
    db.from('reservations').select(`
      id, guest_name, reserved_time, party_size, status, table_id,
      calisanlar!left(ad),
      hizmetler!left(ad)
    `)
      .eq('restaurant_id', restaurant.id)
      .eq('reserved_date', today)
      .neq('status', 'cancelled')
      .not('table_id', 'is', null)
      .order('reserved_time'),
  ])

  // Supabase returns joined tables as arrays; unwrap for component types
  const unwrapped = (todayReservations ?? []).map(r => ({
    ...r,
    calisanlar: (r.calisanlar as { ad: string }[] | null)?.[0] ?? null,
    hizmetler:  (r.hizmetler as { ad: string }[] | null)?.[0] ?? null,
  }))

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Masalar</h1>
        <p className="text-xs text-stone-500 mt-0.5">{tables?.length ?? 0} masa, {areas?.length ?? 0} alan</p>
      </div>
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <MasalarContent
          tables={tables ?? []}
          areas={areas ?? []}
          todayReservations={unwrapped}
          slug={slug}
          restaurantId={restaurant.id}
        />
      </main>
    </div>
  )
}
