import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ReservationForm } from './ReservationForm'

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

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-zinc-900">{restaurant.name}</h1>
          {restaurant.address && (
            <p className="text-sm text-zinc-500">{restaurant.address}</p>
          )}
        </div>

        <ReservationForm restaurantId={restaurant.id} />
      </div>
    </div>
  )
}
