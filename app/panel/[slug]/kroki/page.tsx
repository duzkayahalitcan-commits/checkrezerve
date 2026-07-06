import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import KrokiTabsPage from './KrokiTabsPage'
import type { Mode } from './KrokiTabsPage'
import type { KrokiZone } from '@/src/types/kroki-zone'


export const dynamic = 'force-dynamic'

export default async function KrokiPage({
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
    .select('id, name, slug, onboarding_completed, kroki_zones')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')
  if (!restaurant.onboarding_completed) redirect(`/panel/${slug}/onboarding`)

  // W-100: kroki_zones hem floor data (masa editörü) hem bölge verisi içerebilir.
  // Bölge verileri polygon property'si olan nesnelerdir; floor verileri tables property'si olanlardır.
  const rawZones = (restaurant.kroki_zones as unknown[]) ?? []
  const polygonalZones = rawZones.filter(
    (z): z is KrokiZone =>
      typeof z === 'object' && z !== null && 'polygon' in z && typeof (z as Record<string, unknown>).theme === 'string'
  ) as unknown as KrokiZone[]
  // Floor data: tables property'si olan veya hiç polygon'u olmayan düz objeler
  const floorData = rawZones.filter(
    (z): z is Record<string, unknown> => typeof z === 'object' && z !== null && ('tables' in z || !('polygon' in z))
  )

  return (
    <KrokiTabsPage
      restaurantId={restaurant.id}
      slug={slug}
      initialData={floorData}
      initialZones={polygonalZones}
      initialMode={(restaurant as Record<string, unknown>).kroki_mode as Mode ?? 'zones'}
    />
  )
}
