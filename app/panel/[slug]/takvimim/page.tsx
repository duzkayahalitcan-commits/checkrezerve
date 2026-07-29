import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import TakvimimClient from './TakvimimClient'

export const dynamic = 'force-dynamic'

export default async function TakvimimPage({
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

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Takvimim</h1>
        <p className="text-xs text-stone-500 mt-0.5">Kendi rezervasyon takviminiz</p>
      </div>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <TakvimimClient restaurantId={restaurant.id} />
      </main>
    </div>
  )
}
