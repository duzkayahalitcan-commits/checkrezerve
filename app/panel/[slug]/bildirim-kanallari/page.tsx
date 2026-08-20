import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import KanalAyarlariClient from './KanalAyarlariClient'

export const dynamic = 'force-dynamic'

const KANAL_LABELS: Record<string, string> = {
  email: 'E-posta',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  push: 'Push Bildirim',
}

export default async function BildirimKanallariPage({
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

  // Mevcut kanal ayarları
  const { data: ayarlar } = await db
    .from('bildirim_kanal_ayarlari')
    .select('kanal, aktif')
    .eq('restaurant_id', restaurant.id)

  const kanallar = Object.keys(KANAL_LABELS).map(k => ({
    kanal: k,
    label: KANAL_LABELS[k],
    aktif: (ayarlar ?? []).find((r: Record<string, unknown>) => r.kanal === k)?.aktif ?? false,
  }))

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Bildirim Kanalları</h1>
        <p className="text-xs text-stone-500 mt-0.5">Müşterilere hangi kanallar üzerinden bildirim gönderilecek</p>
      </div>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <KanalAyarlariClient kanallar={kanallar} />
      </main>
    </div>
  )
}
