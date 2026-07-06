import { redirect } from 'next/navigation'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { StepIndicator } from './StepIndicator'
import Step1BusinessInfo from './Step1BusinessInfo'
import Step2Services from './Step2Services'

// W-94: Randevu-tabanlı işletme tipleri (hizmet adımı zorunlu)
const APPOINTMENT_TYPES = ['barber', 'hairdresser', 'spa', 'beauty_salon', 'masaj', 'klinik', 'pilates', 'dentist', 'psychologist', 'chiropractor', 'fitness', 'veterinary']
const NO_SERVICE_TYPES = ['restaurant', 'cafe']

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

  const businessType = restaurant.business_type ?? 'restaurant'
  const isAppointment = APPOINTMENT_TYPES.includes(businessType)
  const isNoService = NO_SERVICE_TYPES.includes(businessType)

  // W-94: Adım sayısını işletme tipine göre belirle
  // Restoran/kafe:   Adım 1 (Bilgiler) → Adım 2'yi atla → Adım 3 (Çalışanlar ops) → Adım 4 (Masa) → Adım 5 (Tamam)
  // Randevu-tipi:    Adım 1 (Bilgiler) → Adım 2 (Hizmetler zorunlu) → Adım 3 (Çalışanlar ops) → Adım 4 (Masa) → Adım 5 (Tamam)
  const totalSteps = isNoService ? 4 : 5

  // ─── Adım 1: İşletme Bilgileri ──────────────────────────────────────────
  if (!restaurant.name || !restaurant.address || !restaurant.phone) {
    return (
      <OnboardingLayout currentStep={1} totalSteps={totalSteps} isNoService={isNoService} slug={slug}>
        <Step1BusinessInfo restaurant={restaurant} slug={slug} />
      </OnboardingLayout>
    )
  }

  // ─── Adım 2: Hizmetler (sadece randevu-tabanlı işletmeler) ──────────────
  // Restoran/kafe için hizmet adımı atlanır, doğrudan adım 3/4'e gidilir
  if (isAppointment) {
    const { count: serviceCount } = await db
      .from('hizmetler')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', session.restaurantId)

    if (!serviceCount || serviceCount === 0) {
      // Hizmet adımını göster
      const { data: services } = await db
        .from('hizmetler')
        .select('id, ad, sure_dakika, fiyat')
        .eq('restaurant_id', session.restaurantId)
        .eq('aktif', true)

      return (
        <OnboardingLayout currentStep={2} totalSteps={totalSteps} isNoService={isNoService} slug={slug}>
          <Step2Services services={services ?? []} slug={slug} businessType={businessType} />
        </OnboardingLayout>
      )
    }
  }

  // Restoran/kafe: hizmet adımını opsiyonel göster (sadece istenirse)
  if (isNoService) {
    const { count: serviceCount } = await db
      .from('hizmetler')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', session.restaurantId)

    // Hizmet eklenmişse adım 2'de gösterebiliriz ama onboarding akışını kesintiye uğratmamak için:
    // Kullanıcı zaten adım 2'yi (bilgiler) geçtiyse ve restoran tipiyse, hizmet adımını tamamen atlayıp
    // doğrudan adım 3'e (çalışanlar) veya adım 4'e (masa) gideriz, ama kullanıcı onboarding/2 URL'ine
    // giderse Step2Services'i gösterir (opsiyonel form ile)
    // Burada normal akış: hizmet adımını atla
  }

  // ─── Adım 3: Çalışanlar (opsiyonel, her zaman atlanabilir) ───────────────
  // ─── Adım 4: Masa (restoran/kafe) ────────────────────────────────────────
  if (isNoService || businessType === 'restaurant') {
    const { count: tableCount } = await db
      .from('masa_tipleri')
      .select('*', { count: 'exact', head: true })
      .eq('isletme_id', session.restaurantId)
      .eq('aktif', true)

    if (!tableCount || tableCount === 0) {
      redirect(`/panel/${slug}/onboarding/4`)
    }
  }

  // ─── Adım 5: Tamamlandı sayfası ─────────────────────────────────────────
  redirect(`/panel/${slug}/onboarding/5`)
}

function OnboardingLayout({
  currentStep,
  totalSteps,
  isNoService,
  slug,
  children,
}: {
  currentStep: number
  totalSteps: number
  isNoService?: boolean
  slug: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B1B17] to-stone-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} isNoService={!!isNoService} slug={slug} />
        <div className="w-full mt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
