import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import StaffManager from './StaffManager'

export const dynamic = 'force-dynamic'

export default async function CalisanlarPage({
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

  const { data: staff } = await db
    .from('calisanlar')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('ad')

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Çalışanlar</h1>
        <p className="text-xs text-stone-500 mt-0.5">{staff?.length ?? 0} çalışan</p>
      </div>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <StaffManager staff={staff ?? []} restaurantId={restaurant.id} />
      </main>
    </div>
  )
}
