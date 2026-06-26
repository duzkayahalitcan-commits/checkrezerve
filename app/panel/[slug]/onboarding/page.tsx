import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { StepIndicator } from './StepIndicator'
import Step1BusinessInfo from './Step1BusinessInfo'

export default async function OnboardingPage({
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
    .select('*')
    .eq('slug', slug)
    .eq('id', session.restaurantId)
    .single()

  if (!restaurant) redirect('/panel/login')

  // Zaten tamamlamissa ana sayfaya yonlendir
  if (restaurant.onboarding_completed) {
    redirect(`/panel/${slug}`)
  }

  // Hangi adimda kaldigini bul
  // Kural: sirasiyla adim 1,2,3,4,5
  // Adim 1 — isletme bilgileri: name, address, phone dolu mu
  // Adim 2 — hizmetler: en az 1 kayit var mi
  // Adim 3 — calisanlar: opsiyonel, her zaman atlanabilir
  // Adim 4 — masa (restaurant): kayit var mi
  // Adim 5 — tamamlandi

  if (!restaurant.name || !restaurant.address || !restaurant.phone) {
    return (
      <OnboardingLayout currentStep={1} slug={slug} restaurantId={session.restaurantId}>
        <Step1BusinessInfo restaurant={restaurant} slug={slug} />
      </OnboardingLayout>
    )
  }

  // Adim 2: hizmet var mi
  const { count: serviceCount } = await db
    .from('hizmetler')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', session.restaurantId)

  if (!serviceCount || serviceCount === 0) {
    redirect(`/panel/${slug}/onboarding/2`)
  }

  // Adim 3: calisanlar (opsiyonel) veya direkt 4'e git
  // Adim 4: masa (sadece restaurant)
  if (restaurant.business_type === 'restaurant') {
    const { count: tableCount } = await db
      .from('masa_tipleri')
      .select('*', { count: 'exact', head: true })
      .eq('isletme_id', session.restaurantId)

    if (!tableCount || tableCount === 0) {
      redirect(`/panel/${slug}/onboarding/4`)
    }
  }

  // Adim 5: tamamlandi sayfasi
  redirect(`/panel/${slug}/onboarding/5`)
}

async function OnboardingRedirect({ slug, step }: { slug: string; step: number }) {
  redirect(`/panel/${slug}/onboarding/${step}`)
}


function OnboardingLayout({
  currentStep,
  slug,
  children,
}: {
  currentStep: number
  slug: string
  children: React.ReactNode
  restaurantId?: string
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B1B17] to-stone-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        <StepIndicator currentStep={currentStep} slug={slug} />
        <div className="w-full mt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
