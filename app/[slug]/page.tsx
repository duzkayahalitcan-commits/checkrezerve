import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { ReservationForm } from './ReservationForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, address')
    .eq('slug', slug)
    .single()

  if (!restaurant) return { title: 'Restoran Bulunamadı' }

  return {
    title: `${restaurant.name} — Rezervasyon`,
    description: `${restaurant.name} için online rezervasyon yapın.${restaurant.address ? ` ${restaurant.address}` : ''}`,
  }
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!restaurant) notFound()

  // Bugünün tarihini rezervasyon sayımı için al
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .eq('reserved_date', today)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950">
      {/* Hero */}
      <div className="relative px-6 pt-14 pb-10 text-center">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo/İsim alanı */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-900/50">
            <span className="text-3xl font-black text-white select-none">
              {restaurant.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {restaurant.name}
            </h1>
            {restaurant.address && (
              <p className="mt-1 text-sm text-stone-400 flex items-center justify-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {restaurant.address}
              </p>
            )}
          </div>

          {/* Bugünkü doluluk rozeti */}
          {typeof count === 'number' && (
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-stone-300">
                Bugün <strong className="text-white">{count}</strong> rezervasyon
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Form Kartı */}
      <div className="px-4 pb-10">
        <div className="mx-auto max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <p className="text-sm font-semibold text-white/90">Masa Rezervasyonu</p>
              <p className="text-xs text-white/70 mt-0.5">Ücretsiz • Anında onaylı</p>
            </div>

            <div className="p-6">
              <ReservationForm restaurantId={restaurant.id} restaurantName={restaurant.name} />
            </div>
          </div>

          {/* Alt not */}
          <p className="mt-4 text-center text-xs text-stone-500">
            Powered by{' '}
            <span className="text-amber-400 font-medium">checkrezerve</span>
          </p>
        </div>
      </div>
    </div>
  )
}
