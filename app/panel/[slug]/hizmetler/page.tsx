import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import ServiceManager from './ServiceManager'

export const dynamic = 'force-dynamic'

export default async function HizmetlerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  const { data: services } = await db
    .from('hizmetler')
    .select('id, restaurant_id, ad, sure_dakika, fiyat, aktif, created_at')
    .eq('restaurant_id', restaurant.id)
    .order('ad')

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Hizmetler</h1>
        <p className="text-xs text-stone-500 mt-0.5">{services?.length ?? 0} hizmet</p>
      </div>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <ServiceManager services={services ?? []} restaurantId={restaurant.id} />
      </main>
    </div>
  )
}
