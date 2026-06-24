'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CustomerHeader from '@/components/CustomerHeader'
import { Link } from '@/i18n/navigation'
import { BUSINESS_TYPE_ICONS, BUSINESS_TYPE_LABELS, type BusinessType } from '@/types'

interface FavBusiness {
  id: string
  name: string
  business_type: string
  address: string | null
  slug: string
  cover_image: string | null
}

export default function FavorilerimPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [favs, setFavs] = useState<FavBusiness[]>([])

  const loadFavs = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('user_favorites')
      .select('restaurant_id, restaurants(id, name, business_type, address, slug, cover_image)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    type FavRow = { restaurants: FavBusiness }
    const raw = (data ?? []) as unknown as FavRow[]
    const list: FavBusiness[] = raw.map(f => f.restaurants).filter(Boolean)
    setFavs(list)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/giris'); return }
      await loadFavs(session.user.id)
      setLoading(false)
    })
  }, [router, loadFavs])

  const removeFav = async (restaurantId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('user_favorites').delete()
      .eq('user_id', session.user.id).eq('restaurant_id', restaurantId)
    setFavs(prev => prev.filter(f => f.id !== restaurantId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <CustomerHeader />
        <div className="pt-24 pb-16 px-6 mx-auto max-w-4xl">
          <div className="h-8 w-48 bg-zinc-200 rounded-xl animate-pulse mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-zinc-100 bg-zinc-100 h-44 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <CustomerHeader />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">
          ❤️ Favorilerim
          <span className="text-zinc-400 font-normal text-sm ml-2">({favs.length})</span>
        </h1>

        {favs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
            <div className="text-5xl mb-4">🤍</div>
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">Henüz favori işletme eklemediniz</h3>
            <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
              İşletmeleri keşfedin ve favorilerinize ekleyin.
            </p>
            <Link
              href="/rezervasyon"
              className="inline-flex items-center gap-2 bg-[#E53935] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              İşletmeleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favs.map(b => {
              const icon  = BUSINESS_TYPE_ICONS[b.business_type as BusinessType] ?? '🏪'
              const label = BUSINESS_TYPE_LABELS[b.business_type as BusinessType] ?? 'İşletme'
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-md hover:border-zinc-200 transition-all group">
                  <div className="relative h-28 bg-gradient-to-br from-[#2B1B17] to-[#E53935] flex items-center justify-center overflow-hidden">
                    {b.cover_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={b.cover_image}
                        alt=""
                        loading="eager"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-4xl relative z-10">{icon}</span>
                    )}
                    <button
                      onClick={() => removeFav(b.id)}
                      title="Favorilerden çıkar"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-red-500/80 transition-all text-sm z-10"
                    >
                      ❤️
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-900 truncate">{b.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{label}</p>
                    {b.address && (
                      <p className="text-xs text-zinc-400 mt-1 truncate">📍 {b.address}</p>
                    )}
                    <Link
                      href={{ pathname: '/rezervasyon/[id]', params: { id: b.id } }}
                      className="mt-3 block w-full text-center bg-[#E53935] hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Rezervasyon Yap
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
