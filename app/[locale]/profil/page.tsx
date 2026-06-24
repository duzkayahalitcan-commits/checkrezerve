'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import CustomerHeader from '@/components/CustomerHeader'
import { Link } from '@/i18n/navigation'
import NextLink from 'next/link'
import type { User } from '@supabase/supabase-js'

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

interface UserReservation {
  id: string
  reserved_date: string
  reserved_time: string
  party_size: number | null
  status: string
  restaurants: { name: string } | null
}

const RES_STATUS_LABEL: Record<string, string> = {
  pending: 'Beklemede', confirmed: 'Onaylı', cancelled: 'İptal', completed: 'Tamamlandı',
}
const RES_STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function ProfilPage() {
  const router = useRouter()
  const t = useTranslations('profil')
  const [user, setUser] = useState<User | null>(null)
  const [favs, setFavs] = useState<FavBusiness[]>([])
  const [reservations, setReservations] = useState<UserReservation[]>([])
  const [loading, setLoading] = useState(true)

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

  const loadReservations = useCallback(async (email: string) => {
    const { data } = await supabase
      .from('reservations')
      .select('id, reserved_date, reserved_time, party_size, status, restaurants(name)')
      .eq('guest_email', email)
      .order('reserved_date', { ascending: false })
      .limit(5)
    setReservations((data ?? []) as unknown as UserReservation[])
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/giris'); return }
      setUser(session.user)
      await Promise.all([
        loadFavs(session.user.id),
        session.user.email ? loadReservations(session.user.email) : Promise.resolve(),
      ])
      setLoading(false)
    })
  }, [router, loadFavs, loadReservations])

  const removeFav = async (restaurantId: string) => {
    if (!user) return
    await supabase.from('user_favorites').delete()
      .eq('user_id', user.id).eq('restaurant_id', restaurantId)
    setFavs(prev => prev.filter(f => f.id !== restaurantId))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <CustomerHeader />
        <div className="pt-24 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const initials = user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-zinc-50">
      <CustomerHeader />

      <div className="pt-24 pb-16 px-6 mx-auto max-w-4xl">
        {/* Profile header */}
        <div className="flex items-center gap-4 bg-white border border-zinc-100 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-emerald-600/20 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-zinc-900 truncate">{user?.email}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{t('memberAccount')}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-500 hover:text-red-700 font-semibold border border-red-100 hover:border-red-200 px-4 py-2 rounded-xl transition-colors"
          >
            {t('signOut')}
          </button>
        </div>

        {/* Son Rezervasyonlar */}
        <h2 className="text-lg font-bold text-zinc-900 mb-5">📋 Son Rezervasyonlar</h2>
        {reservations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-zinc-200 p-6 text-center mb-8">
            <p className="text-zinc-400 text-sm">Henüz rezervasyonunuz yok.</p>
            <Link href="/rezervasyon" className="mt-3 inline-block text-sm text-[#E53935] font-semibold hover:underline">
              Rezervasyon Yap →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {reservations.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 truncate">{r.restaurants?.name ?? 'İşletme'}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {r.reserved_date} · {(r.reserved_time ?? '').slice(0, 5)}
                    {r.party_size ? ` · ${r.party_size} kişi` : ''}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${RES_STATUS_COLOR[r.status] ?? 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}>
                  {RES_STATUS_LABEL[r.status] ?? r.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Favorites */}
        <h2 className="text-lg font-bold text-zinc-900 mb-5">
          ❤️ {t('favoritesTitle')}
          <span className="text-zinc-400 font-normal text-sm ml-2">({favs.length})</span>
        </h2>

        {favs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
            <div className="text-5xl mb-4">🤍</div>
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">{t('emptyTitle')}</h3>
            <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
              {t('emptyDesc')}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              {t('exploreLink')}
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
                      title={t('removeFav')}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-red-500/80 transition-all text-sm"
                    >
                      ❤️
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-900 truncate">{b.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{t(`kat_${kat}` as Parameters<typeof t>[0])}</p>
                    {b.address && (
                      <p className="text-xs text-zinc-400 mt-1 truncate">📍 {b.address}</p>
                    )}
                    <NextLink
                      href={`/${b.slug}`}
                      className="mt-3 block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      {t('reserveButton')}
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
