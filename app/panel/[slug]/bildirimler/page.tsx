import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import BildirimClient from './BildirimClient'

export const dynamic = 'force-dynamic'

export default async function BildirimlerPage({
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
    .select('id, name, slug, onboarding_completed')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')
  if (!restaurant.onboarding_completed) redirect(`/panel/${slug}/onboarding`)

  const [logData, templateData] = await Promise.all([
    db.from('bildirim_log').select('id, isletme_id, tip, alici, mesaj, durum, created_at').eq('isletme_id', restaurant.id).order('created_at', { ascending: false }).limit(100),
    db.from('bildirim_sablonlari').select('id, isletme_id, ad, icerik, tip, aktif, created_at').eq('isletme_id', restaurant.id).eq('aktif', true).order('ad'),
  ])

  return (
    <BildirimClient
      slug={slug}
      logs={logData.data ?? []}
      templates={templateData.data ?? []}
    />
  )
}
