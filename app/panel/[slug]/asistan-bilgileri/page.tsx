import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import AssistantConfig from './AssistantConfig'
import OzelliklerClient from './OzelliklerClient'
import VoiceSettings from './VoiceSettings'

export const dynamic = 'force-dynamic'

export default async function AsistanBilgileriPage({
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
    .select('id, name, slug, business_type, ai_assistant_enabled, ai_assistant_name')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  return (
    <div>
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <h1 className="text-lg font-bold text-white mt-0.5">Asistan Bilgileri</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Sesli asistanın müşterilere doğru bilgi vermesi için işletme özelliklerini işaretleyin
        </p>
      </div>
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <AssistantConfig
          restaurantId={restaurant.id}
          aiAssistantEnabled={restaurant.ai_assistant_enabled ?? false}
          aiAssistantName={restaurant.ai_assistant_name}
        />
        <VoiceSettings
          restaurantId={restaurant.id}
          isSuperAdmin={session.role === 'super_admin'}
        />
        <OzelliklerClient
          restaurantId={restaurant.id}
          businessType={restaurant.business_type ?? ''}
        />
      </main>
    </div>
  )
}
