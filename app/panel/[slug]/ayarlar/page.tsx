import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getTranslations } from 'next-intl/server'
import SettingsForm from './SettingsForm'
import type { Restaurant } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AyarlarPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')

  const { slug } = await params
  const db = getSupabaseAdmin()
  const t = await getTranslations('panel')

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, slug, address, capacity, working_hours, closed_dates, prepayment_amount, special_notes')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Ayarlar</h1>
        <p className="text-xs text-stone-500 mt-0.5">Çalışma saatleri, kapalı günler, ön ödeme ve notlar</p>
      </div>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <SettingsForm restaurant={restaurant as Pick<Restaurant,
            'id' | 'working_hours' | 'closed_dates' | 'prepayment_amount' | 'special_notes'
          >} />
        </div>
      </main>
    </div>
  )
}
