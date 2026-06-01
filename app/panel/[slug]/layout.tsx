import { redirect }        from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import PanelSidebar        from '@/app/panel/_components/PanelSidebar'

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const { data: restaurant } = await getSupabaseAdmin()
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  return (
    <div className="flex bg-stone-950 text-white min-h-screen">
      <PanelSidebar slug={slug} restaurantName={restaurant.name} role={session.role} />
      {/* Mobile: pt for top bar, pb for bottom nav */}
      <div className="flex-1 min-w-0 pt-14 pb-16 md:pt-0 md:pb-0">
        {children}
      </div>
    </div>
  )
}
