import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import KrokiTabsPage from './KrokiTabsPage'
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
    .select('id, name, slug, onboarding_completed, kroki_data, kroki_enabled, kroki_zones')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')
  if (!restaurant.onboarding_completed) redirect(`/panel/${slug}/onboarding`)

  return (
    <KrokiTabsPage
      restaurantId={restaurant.id}
      slug={slug}
      initialData={restaurant.kroki_data as Record<string, unknown>[] ?? []}
      initialZones={(restaurant.kroki_zones as KrokiZone[]) ?? []}
    />
  )
}
