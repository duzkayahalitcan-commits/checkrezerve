import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { StepIndicator } from '../StepIndicator'
import Step5Complete from '../Step5Complete'

const NO_SERVICE_TYPES = ['restaurant', 'cafe']

export default async function OnboardingStep5({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getPanelSession()
  if (!session) redirect('/panel/login')
  const { slug } = await params
  const db = getSupabaseAdmin()

  const { data: restaurant } = await db
    .from('restaurants')
    .select('id, name, slug, phone, address, description, website, instagram, business_type, working_hours, email, city, district, country, cover_image, onboarding_completed')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  // Zaten tamamlamissa ana sayfaya
  if (restaurant.onboarding_completed) {
    redirect(`/panel/${slug}`)
  }

  // Adim 1 eksikse 1'e yonlendir
  if (!restaurant.name || !restaurant.address || !restaurant.phone) {
    redirect(`/panel/${slug}/onboarding/1`)
  }

  const businessType = restaurant.business_type ?? 'restaurant'
  const isNoService = NO_SERVICE_TYPES.includes(businessType)
  const totalSteps = isNoService ? 4 : 5

  // Ozet bilgileri al
  const [{ count: serviceCount }, { count: staffCount }, { count: tableCount }] = await Promise.all([
    db.from('hizmetler').select('id', { count: 'exact', head: true }).eq('restaurant_id', session.restaurantId),
    db.from('calisanlar').select('id', { count: 'exact', head: true }).eq('restaurant_id', session.restaurantId),
    db.from('masa_tipleri').select('id', { count: 'exact', head: true }).eq('isletme_id', session.restaurantId),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B1B17] to-stone-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        <StepIndicator currentStep={totalSteps} totalSteps={totalSteps} isNoService={isNoService} slug={slug} />
        <div className="w-full mt-8">
          <Step5Complete
            slug={slug}
            summary={{
              services: serviceCount ?? 0,
              staff: staffCount ?? 0,
              tables: tableCount ?? 0,
            }}
          />
        </div>
      </div>
    </div>
  )
}
