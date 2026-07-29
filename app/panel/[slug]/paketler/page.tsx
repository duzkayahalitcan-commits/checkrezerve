import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import PaketlerManager from './PaketlerManager'

export const dynamic = 'force-dynamic'

export default async function PaketlerPage({
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

  const [{ data: paketler }, { data: hizmetler }] = await Promise.all([
    db.from('paketler').select('*').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false }),
    db.from('hizmetler').select('id, name, ad').eq('restaurant_id', restaurant.id).eq('aktif', true).order('ad'),
  ])

  const services = (hizmetler ?? []).map((h: Record<string, unknown>) => ({
    id: h.id as string,
    name: ((h.name ?? h.ad) as string),
  }))

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Paketler</h1>
        <p className="text-xs text-stone-500 mt-0.5">{paketler?.length ?? 0} paket</p>
      </div>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <PaketlerManager paketler={paketler ?? []} services={services} restaurantId={restaurant.id} />
      </main>
    </div>
  )
}
