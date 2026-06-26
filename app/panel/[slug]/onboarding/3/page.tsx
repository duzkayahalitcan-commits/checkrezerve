import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { StepIndicator } from '../StepIndicator'
import Step3Staff from '../Step3Staff'

export default async function OnboardingStep3({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')
  const { slug } = await params
  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  // Adim 1 eksikse 1'e yonlendir
  if (!restaurant.name || !restaurant.address || !restaurant.phone) {
    redirect(`/panel/${slug}/onboarding/1`)
  }

  const { data: staff } = await db
    .from('calisanlar')
    .select('id, ad, unvan')
    .eq('restaurant_id', session.restaurantId)
    .eq('aktif', true)
    .order('created_at')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B1B17] to-stone-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        <StepIndicator currentStep={3} slug={slug} />
        <div className="w-full mt-8">
          <Step3Staff staff={staff ?? []} slug={slug} />
        </div>
      </div>
    </div>
  )
}
