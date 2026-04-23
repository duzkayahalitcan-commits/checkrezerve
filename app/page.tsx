'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import CustomerHeader from '@/components/CustomerHeader'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'berber',          label: 'Berber',   icon: '💈' },
  { value: 'kuafor',          label: 'Kuaför',   icon: '✂️' },
  { value: 'guzellik_salonu', label: 'Güzellik', icon: '💅' },
  { value: 'spa',             label: 'Spa',      icon: '🧖' },
  { value: 'restoran',        label: 'Restoran', icon: '🍽️' },
  { value: 'kafe',            label: 'Kafe',     icon: '☕' },
  { value: 'bar',             label: 'Bar',      icon: '🍸' },
  { value: 'diger',           label: 'Diğer',    icon: '🏪' },
]

const KAT_LABEL: Record<string, string> = {
  berber: 'Berber', kuafor: 'Kuaför', guzellik_salonu: 'Güzellik Salonu',
  spa: 'Spa', restoran: 'Restoran', kafe: 'Kafe', bar: 'Bar', diger: 'Diğer',
}
const KAT_ICON: Record<string, string> = {
  berber: '💈', kuafor: '✂️', guzellik_salonu: '💅',
  spa: '🧖', restoran: '🍽️', kafe: '☕', bar: '🍸', diger: '🏪',
}
const KAT_GRADIENT: Record<string, string> = {
  berber: 'from-blue-900 to-blue-800',
  kuafor: 'from-pink-900 to-rose-800',
  guzellik_salonu: 'from-rose-900 to-pink-800',
  spa: 'from-teal-900 to-emerald-800',
  restoran: 'from-orange-900 to-amber-800',
  kafe: 'from-amber-900 to-yellow-800',
  bar: 'from-purple-900 to-violet-800',
  diger: 'from-zinc-800 to-zinc-700',
}

interface Business {
  id: string
  name: string
  kategori: string | null
  address: string | null
  slug: string
}

const PLACEHOLDER_CARDS = [
  { icon: '💈', label: 'Berber', city: 'İstanbul · Kadıköy' },
  { icon: '✂️', label: 'Kuaför', city: 'İstanbul · Beşiktaş' },
  { icon: '🧖', label: 'Spa',    city: 'İstanbul · Şişli' },
]

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeKat, setActiveKat] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    supabase
      .from('restaurants')
      .select('id, name, kategori, address, slug')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setBusinesses((data ?? []) as Business[])
        setLoading(false)
      })
  }, [])

  const loadFavorites = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('user_favorites')
      .select('restaurant_id')
      .eq('user_id', uid)
    setFavorites(new Set((data ?? []).map((f: { restaurant_id: string }) => f.restaurant_id)))
  }, [])

  useEffect(() => {
    if (userId) loadFavorites(userId)
    else setFavorites(new Set())
  }, [userId, loadFavorites])

  const toggleFavorite = async (id: string) => {
    if (!userId) { window.location.href = '/giris'; return }
    const isFav = favorites.has(id)
    if (isFav) {
      await supabase.from('user_favorites').delete()
        .eq('user_id', userId).eq('restaurant_id', id)
      setFavorites(prev => { const s = new Set(prev); s.delete(id); return s })
    } else {
      await supabase.from('user_favorites').insert({ user_id: userId, restaurant_id: id })
      setFavorites(prev => new Set([...prev, id]))
    }
  }

  const filtered = businesses.filter(b => {
    const matchesSearch = !search.trim() || b.name.toLowerCase().includes(search.toLowerCase())
    const matchesKat = !activeKat || b.kategori === activeKat
    return matchesSearch && matchesKat
  })

  const sectionTitle = search
    ? `"${search}" için sonuçlar`
    : activeKat
      ? (KAT_LABEL[activeKat] ?? 'Mekanlar')
      : 'Tüm Mekanlar'

  return (
    <div className="min-h-screen bg-zinc-50">
      <CustomerHeader />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-16 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            İstanbul · {loading ? '...' : `${businesses.length}+ mekan aktif`}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
            İstanbul&apos;un en iyi<br />
            <span className="text-emerald-300">mekanları</span> tek platformda
          </h1>
          <p className="text-white/65 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Berber, kuaför, spa, restoran — tüm rezervasyonlarınız anında.
            Telefon yok, bekleme yok.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto">
            <div className="flex bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
              <div className="flex items-center pl-5 text-zinc-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Mekan veya kategori ara..."
                className="flex-1 px-4 py-4 text-zinc-900 text-base outline-none bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="pr-5 text-zinc-400 hover:text-zinc-600 text-lg">×</button>
              )}
            </div>
          </div>
        </div>

        {/* Category strip */}
        <div id="categories" className="border-t border-white/10 bg-black/20">
          <div className="mx-auto max-w-6xl px-6 py-4 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveKat(null)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                !activeKat
                  ? 'bg-white text-emerald-800 border-white shadow-sm'
                  : 'bg-white/8 text-white/80 border-white/15 hover:bg-white/15'
              }`}
            >
              Tümü
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setActiveKat(prev => prev === c.value ? null : c.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                  activeKat === c.value
                    ? 'bg-white text-emerald-800 border-white shadow-sm'
                    : 'bg-white/8 text-white/80 border-white/15 hover:bg-white/15'
                }`}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business Grid ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">
            {sectionTitle}
            {!loading && (
              <span className="text-zinc-400 font-normal text-sm ml-2">
                {filtered.length} mekan
              </span>
            )}
          </h2>
          {(search || activeKat) && (
            <button
              onClick={() => { setSearch(''); setActiveKat(null) }}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Filtreyi temizle ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-52 rounded-2xl bg-zinc-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 && (search || activeKat) ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">Mekan bulunamadı</h3>
            <p className="text-zinc-400">Farklı bir arama veya kategori deneyin.</p>
          </div>
        ) : filtered.length === 0 ? (
          /* Placeholder cards when no businesses */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLACEHOLDER_CARDS.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
                <div className="text-4xl mb-3">{p.icon}</div>
                <p className="font-semibold text-zinc-600">{p.label} · {p.city}</p>
                <p className="text-xs text-zinc-400 mt-1">Yakında açılıyor</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(b => {
              const kat = b.kategori ?? 'diger'
              const gradient = KAT_GRADIENT[kat] ?? 'from-zinc-800 to-zinc-700'
              const isFav = favorites.has(b.id)
              return (
                <div
                  key={b.id}
                  className="group bg-white rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Card visual */}
                  <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <span className="text-5xl drop-shadow-lg">{KAT_ICON[kat] ?? '🏪'}</span>
                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorite(b.id)}
                      title={isFav ? 'Favoriden çıkar' : 'Favoriye ekle'}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/40 transition-all hover:scale-110"
                    >
                      <span className="text-base leading-none">{isFav ? '❤️' : '🤍'}</span>
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex items-start gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-zinc-900 truncate text-base">{b.name}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5 font-medium">{KAT_LABEL[kat]}</p>
                        {b.address && (
                          <p className="text-xs text-zinc-400 mt-1 truncate">📍 {b.address}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-emerald-700 font-medium">Rezervasyon açık</span>
                    </div>

                    <Link
                      href={`/${b.slug}`}
                      className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Rezervasyon Yap →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── İşletme CTA ─────────────────────────────────────────────────── */}
      <section id="business" className="bg-zinc-900 text-white py-20 px-6">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center gap-10">
          <div className="flex-1 text-center sm:text-left">
            <div className="text-4xl mb-4">🏪</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-snug">
              İşletmenizi platforma<br />ekleyin
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8 max-w-md">
              Komisyon yok. Anında kurulum. Berber, kuaför, spa veya restoran —
              10 dakikada rezervasyon almaya başlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
              <a
                href="mailto:merhaba@checkrezerve.com?subject=İşletme Ekleme Talebi&body=İşletme Adı:%0D%0ASektör:%0D%0ATelefon:%0D%0AŞehir:"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-8 py-4 text-sm font-semibold text-white transition-colors"
              >
                Demo İste →
              </a>
              <a
                href="/admin"
                className="rounded-full border border-zinc-600 hover:border-zinc-400 px-8 py-4 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                Yönetici Girişi
              </a>
            </div>
          </div>
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full sm:w-64">
            {[
              { icon: '⚡', title: '10 dk kurulum', desc: 'Teknik bilgi gerekmez' },
              { icon: '💳', title: '%0 komisyon', desc: 'Saklı ücret yok' },
              { icon: '📱', title: 'Mobil uygulama', desc: 'iOS & Android' },
              { icon: '📊', title: 'Haftalık rapor', desc: 'CSV olarak indir' },
            ].map(item => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-xs font-semibold text-white">{item.title}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-zinc-100 py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">CR</span>
              </div>
              <span className="text-sm font-bold text-zinc-900">checkrezerve</span>
            </div>
            <p className="text-xs text-zinc-400 text-center">
              Türkiye&apos;nin çok sektörlü rezervasyon platformu. © 2026
            </p>
            <div className="flex gap-6 text-xs text-zinc-400">
              <a href="/gizlilik"          className="hover:text-zinc-700 transition-colors">Gizlilik</a>
              <a href="/kullanim-sartlari" className="hover:text-zinc-700 transition-colors">Kullanım</a>
              <a href="mailto:merhaba@checkrezerve.com" className="hover:text-zinc-700 transition-colors">İletişim</a>
              <a href="/admin"             className="hover:text-zinc-700 transition-colors">İşletme Girişi</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
