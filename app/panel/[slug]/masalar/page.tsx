import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import TableManager from './TableManager'
import FloorPlanEditor from './FloorPlanEditor'

export const dynamic = 'force-dynamic'

export default async function MasalarPage({
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

  const [{ data: tables }, { data: areas }] = await Promise.all([
    db.from('tables').select('*').eq('restaurant_id', restaurant.id).order('label'),
    db.from('special_areas').select('*').eq('restaurant_id', restaurant.id).order('name'),
  ])

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
          restaurantId={restaurant.id}
        />
      </main>
    </div>
  )
}

// Client component for the tab switcher
import MasalarContentClient from './MasalarContent'
function MasalarContent({
  tables,
  areas,
  restaurantId,
}: {
  tables: any[]
  areas: any[]
  restaurantId: string
}) {
  return (
    <MasalarContentClient
      tables={tables}
      areas={areas}
      restaurantId={restaurantId}
    />
  )
}
