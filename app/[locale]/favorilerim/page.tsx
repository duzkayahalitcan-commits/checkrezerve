'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CustomerHeader from '@/components/CustomerHeader'
import { Link } from '@/i18n/navigation'
import NextLink from 'next/link'

const KAT_ICON: Record<string, string> = {
  berber: '💈', kuafor: '✂️', guzellik_salonu: '💅',
  spa: '🧖', restoran: '🍽️', kafe: '☕', bar: '🍸', diger: '🏪',
}
const KAT_GRADIENT: Record<string, string> = {
  berber: 'from-blue-900 to-blue-800', kuafor: 'from-pink-900 to-rose-800',
  guzellik_salonu: 'from-rose-900 to-pink-800', spa: 'from-teal-900 to-emerald-800',
  restoran: 'from-orange-900 to-amber-800', kafe: 'from-amber-900 to-yellow-800',
  bar: 'from-purple-900 to-violet-800', diger: 'from-zinc-800 to-zinc-700',
}

interface FavBusiness {
  id: string; name: string; kategori: string | null; address: string | null; slug: string
}

export default function FavorilerimPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [favs, setFavs] = useState<FavBusiness[]>([])

  const loadFavs = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('user_favorites')
      .select('restaurant_id, restaurants(id, name, kategori, address, slug)')
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
        <div className="pt-24 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <CustomerHeader />
      <div className="pt-24 pb-16 px-6 mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">
          Favorilerim
          <span className="text-zinc-400 font-normal text-sm ml-2">({favs.length})</span>
        </h1>

        {favs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
            <div className="text-5xl mb-4">🤍</div>
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">Henüz favoriniz yok</h3>
            <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
              İşletmeleri keşfedin ve favorilerinize ekleyin.
            </p>
            <Link
              href="/rezervasyon"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              İşletmeleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favs.map(b => {
              const kat = b.kategori ?? 'diger'
              const gradient = KAT_GRADIENT[kat] ?? 'from-zinc-800 to-zinc-700'
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-md hover:border-zinc-200 transition-all group">
                  <div className={`relative h-24 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <span className="text-4xl">{KAT_ICON[kat] ?? '🏪'}</span>
                    <button
                      onClick={() => removeFav(b.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-red-500/80 transition-all text-sm"
                    >
                      ❤️
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-900 truncate">{b.name}</h3>
                    {b.address && (
                      <p className="text-xs text-zinc-400 mt-1 truncate">{b.address}</p>
                    )}
                    <NextLink
                      href={`/${b.slug}`}
                      className="mt-3 block w-full text-center bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Rezervasyon Yap
                    </NextLink>
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
