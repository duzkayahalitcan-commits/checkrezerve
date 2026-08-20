import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import PaketlerPageClient from './PaketlerPageClient'

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
    db.from('paketler').select('id, restaurant_id, ad, toplam_seans, fiyat, gecerlilik_gun, aktif, created_at, hizmet_id').eq('restaurant_id', restaurant.id).order('created_at', { ascending: false }),
    db.from('hizmetler').select('id, name, ad').eq('restaurant_id', restaurant.id).eq('aktif', true).order('ad'),
  ])

  const services = (hizmetler ?? []).map((h: Record<string, unknown>) => ({
    id: h.id as string,
    name: ((h.name ?? h.ad) as string),
  }))

  return (
    <PaketlerPageClient
      initialPaketler={paketler ?? []}
      services={services}
      restaurantId={restaurant.id}
    />
  )
}
