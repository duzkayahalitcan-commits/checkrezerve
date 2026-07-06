import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { StepIndicator } from '../StepIndicator'
import Step2Services from '../Step2Services'

const APPOINTMENT_TYPES = ['barber', 'hairdresser', 'spa', 'beauty_salon', 'masaj', 'klinik', 'pilates', 'dentist', 'psychologist', 'chiropractor', 'fitness', 'veterinary']
const NO_SERVICE_TYPES = ['restaurant', 'cafe']

export default async function OnboardingStep2({ params }: { params: Promise<{ slug: string }> }) {
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

  const businessType = restaurant.business_type ?? 'restaurant'
  const isNoService = NO_SERVICE_TYPES.includes(businessType)
  const totalSteps = isNoService ? 4 : 5

  // NOT: DB kolon adları sure_dakika / fiyat
  const { data: services } = await db
    .from('hizmetler')
    .select('id, ad, sure_dakika, fiyat')
    .eq('restaurant_id', session.restaurantId)
    .eq('aktif', true)
    .order('created_at')

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B1B17] to-stone-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        <StepIndicator currentStep={2} totalSteps={totalSteps} isNoService={isNoService} slug={slug} />
        <div className="w-full mt-8">
          <Step2Services services={services ?? []} slug={slug} businessType={businessType} />
        </div>
      </div>
    </div>
  )
}
