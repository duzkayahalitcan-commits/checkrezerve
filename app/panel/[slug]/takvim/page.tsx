import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import CalendarView from './CalendarView'

export const dynamic = 'force-dynamic'

export default async function TakvimPage({
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
    .select('id, name, business_type')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Takvim</h1>
        <p className="text-xs text-stone-500 mt-0.5">Haftalık ve aylık rezervasyon takvimi</p>
      </div>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <CalendarView
          restaurantId={restaurant.id}
          businessType={restaurant.business_type}
          slug={slug}
        />
      </main>
    </div>
  )
}
