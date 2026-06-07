'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { Search, ArrowRight, MessageCircle, X } from 'lucide-react'

function IconRocket() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill="#FFF7ED"/><circle cx="40" cy="40" r="36" stroke="#FED7AA" strokeWidth="2"/>
      <path d="M40 16L48 36H32L40 16Z" fill="#F97316"/><path d="M36 36C36 42 38 48 40 52C42 48 44 42 44 36H36Z" fill="#FB923C"/>
      <circle cx="40" cy="34" r="3" fill="#FFF7ED"/><path d="M36 50L35 54L40 53L45 54L44 50" fill="#EA580C"/>
      <path d="M34 54C34 54 30 56 32 60C34 58 38 58 40 58C42 58 46 58 48 60C50 56 46 54 46 54" fill="#F97316"/>
      <circle cx="30" cy="38" r="1.5" fill="#FED7AA"/><circle cx="50" cy="42" r="1.5" fill="#FED7AA"/>
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill="#FEF2F2"/><circle cx="40" cy="40" r="36" stroke="#FECACA" strokeWidth="2"/>
      <rect x="18" y="20" width="44" height="44" rx="6" fill="white" stroke="#EF4444" strokeWidth="2"/>
      <path d="M18 26C18 22.6863 20.6863 20 24 20H56C59.3137 20 62 22.6863 62 26V28H18V26Z" fill="#EF4444"/>
      <rect x="28" y="16" width="4" height="10" rx="2" fill="#FCA5A5"/><rect x="48" y="16" width="4" height="10" rx="2" fill="#FCA5A5"/>
      <path d="M30 38L36 44L50 32" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconCreditCard() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill="#F0FDF4"/><circle cx="40" cy="40" r="36" stroke="#BBF7D0" strokeWidth="2"/>
      <rect x="16" y="24" width="48" height="34" rx="6" fill="white" stroke="#22C55E" strokeWidth="2"/>
      <rect x="16" y="30" width="48" height="10" fill="#22C55E"/>
      <rect x="26" y="36" width="14" height="2" rx="1" fill="#86EFAC"/><rect x="26" y="42" width="10" height="2" rx="1" fill="#DCFCE7"/>
      <circle cx="56" cy="48" r="8" fill="#EAB308" stroke="white" strokeWidth="2"/>
      <text x="56" y="52" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">₺</text>
    </svg>
  )
}
function IconPuzzle() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill="#F5F3FF"/><circle cx="40" cy="40" r="36" stroke="#DDD6FE" strokeWidth="2"/>
      <path d="M26 24H42C43.1046 24 44 24.8954 44 26V28C44 30.2091 45.7909 32 48 32C50.2091 32 52 30.2091 52 28V26C52 24.8954 52.8954 24 54 24H56V38H54C51.7909 38 50 39.7909 50 42C50 44.2091 51.7909 46 54 46H56V56H44V54C44 51.7909 42.2091 50 40 50C37.7909 50 36 51.7909 36 54V56H24V44H26C28.2091 44 30 42.2091 30 40C30 37.7909 28.2091 36 26 36H24V24Z" fill="#8B5CF6" opacity="0.2" stroke="#7C3AED" strokeWidth="2"/>
      <circle cx="48" cy="40" r="3" fill="#A78BFA"/><circle cx="40" cy="40" r="3" fill="#7C3AED"/>
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill="#EFF6FF"/><circle cx="40" cy="40" r="36" stroke="#BFDBFE" strokeWidth="2"/>
      <path d="M40 16L22 24V40C22 52 30 62 40 66C50 62 58 52 58 40V24L40 16Z" fill="white" stroke="#3B82F6" strokeWidth="2"/>
      <path d="M34 41L38 45L48 35" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="40" cy="32" r="2" fill="#3B82F6"/>
    </svg>
  )
}
function IconWrench() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill="#FFF7ED"/><circle cx="40" cy="40" r="36" stroke="#FED7AA" strokeWidth="2"/>
      <path d="M44 44L64 64" stroke="#78716C" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="32" cy="30" r="16" fill="white" stroke="#F97316" strokeWidth="3"/>
      <circle cx="32" cy="30" r="4" fill="#F97316"/>
      <path d="M28 30L32 26L36 30L32 34Z" fill="white"/>
    </svg>
  )
}

const CATEGORY_SVGS = [IconRocket, IconCalendar, IconCreditCard, IconPuzzle, IconShield, IconWrench] as const

export default function SSSPage() {
  const t = useTranslations('faq')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const categoryRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setTimeout(() => node.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }, [])

  const searchRef = useCallback((node: HTMLInputElement | null) => {
    if (node) node.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('sss-search')?.focus()
      }
      if (e.key === 'Escape') setActiveCategory(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggleItem = (i: number) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const faqItems = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    q: t(`sssQ${i + 1}`),
    a: t(`sssA${i + 1}`),
  })), [t])

  // Her kategoriye ait soru indeksleri (0-tabanlı)
  const CATEGORY_FAQ_INDICES = [
    [0, 1, 5],      // Başlarken: Q1, Q2, Q6
    [3, 4, 10],     // Rezervasyon Yönetimi: Q4, Q5, Q11
    [2, 6, 10],     // Fiyatlandırma & Plan: Q3, Q7, Q11
    [7, 9],         // Entegrasyon & API: Q8, Q10
    [8],            // Hesap & Güvenlik: Q9
    [11],           // Sorun Giderme: Q12
  ]

  const categories = useMemo(() => [
    { svg: 0, title: t('sssCatGettingStarted'), desc: t('sssCatGettingStartedDesc') },
    { svg: 1, title: t('sssCatReservations'), desc: t('sssCatReservationsDesc') },
    { svg: 2, title: t('sssCatPricing'), desc: t('sssCatPricingDesc') },
    { svg: 3, title: t('sssCatIntegration'), desc: t('sssCatIntegrationDesc') },
    { svg: 4, title: t('sssCatAccount'), desc: t('sssCatAccountDesc') },
    { svg: 5, title: t('sssCatTroubleshoot'), desc: t('sssCatTroubleshootDesc') },
  ], [t])

  const trendingTopics = useMemo(() => [
    { text: t('sssTrending1') }, { text: t('sssTrending2') }, { text: t('sssTrending3') },
    { text: t('sssTrending4') }, { text: t('sssTrending5') }, { text: t('sssTrending6') },
    { text: t('sssTrending7') }, { text: t('sssTrending8') },
  ], [t])

  const filteredFaqs = useMemo(() => {
    const q = search.toLowerCase()
    return faqItems
      .map((item, i) => ({ ...item, idx: i }))
      .filter(item => !search.trim() || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
  }, [search, faqItems])

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.toLowerCase()
    return categories.filter(c => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
  }, [search, categories])

  const noResults = search.trim() && filteredCategories.length === 0 && filteredFaqs.length === 0

  const activeCategoryFaqs = activeCategory !== null
    ? CATEGORY_FAQ_INDICES[activeCategory].map(i => ({ ...faqItems[i], idx: i }))
    : []

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero + Search */}
      <section
        className="relative pt-32 pb-20 text-white text-center overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.82) 100%), url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80')",
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <h1 className="mb-4 text-3xl font-extrabold sm:text-4xl">{t('sssHeroTitle')}</h1>
          <p className="mb-8 text-white/60 text-base">{t('sssHeroSubtitle')}</p>
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              id="sss-search"
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveCategory(null) }}
              placeholder={t('sssSearchPlaceholder')}
              className="w-full rounded-2xl border-0 bg-white px-12 py-4 text-sm text-zinc-900 placeholder-zinc-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-400">⌘K</kbd>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      {!search.trim() && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, i) => {
                const Svg = CATEGORY_SVGS[cat.svg]
                const isActive = activeCategory === i
                return (
                  <button
                    key={i}
                    onClick={() => setActiveCategory(isActive ? null : i)}
                    className={`group flex flex-col items-center text-center rounded-2xl border p-8 min-h-[200px] shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                      isActive
                        ? 'border-red-500 bg-red-50 shadow-md shadow-red-100 scale-[1.02]'
                        : 'border-zinc-100 bg-white hover:border-red-200'
                    }`}
                  >
                    <div className="mb-5 transition-transform duration-200 group-hover:scale-110">
                      <Svg />
                    </div>
                    <h3 className={`font-bold text-base ${isActive ? 'text-red-600' : 'text-zinc-900'}`}>{cat.title}</h3>
                    <p className="mt-2 text-sm text-zinc-500 leading-relaxed max-w-[240px]">{cat.desc}</p>
                    {isActive && (
                      <span className="mt-3 text-xs font-semibold text-red-500 flex items-center gap-1">
                        Kapat <X size={12} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Kategori SSS — inline açılır panel */}
            {activeCategory !== null && (
              <div
                ref={categoryRef}
                className="mt-8 rounded-2xl border border-red-100 bg-white shadow-lg overflow-hidden scroll-mt-28"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-red-50">
                  <h3 className="font-bold text-zinc-900 text-lg">{categories[activeCategory].title}</h3>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-400 hover:text-red-600 hover:border-red-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-6 space-y-3">
                  {activeCategoryFaqs.map((item) => {
                    const isOpen = openItems.has(item.idx)
                    return (
                      <div
                        key={item.idx}
                        className={`rounded-xl border transition-colors duration-200 ${
                          isOpen ? 'border-zinc-300' : 'border-zinc-100 hover:border-zinc-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(item.idx)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                        >
                          <span className="text-sm font-semibold text-zinc-900 pr-4">{item.q}</span>
                          <span className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-2 transition-colors duration-200 text-base font-medium leading-none ${
                            isOpen
                              ? 'border-zinc-900 bg-zinc-900 text-white'
                              : 'border-zinc-300 text-zinc-400'
                          }`}>
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="px-5 pb-4">
                            <p className="text-sm text-zinc-600 leading-relaxed">{item.a}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Search Results */}
      {search.trim() && !noResults && (
        <>
          {filteredCategories.length > 0 && (
            <section className="py-12 border-b border-zinc-100">
              <div className="mx-auto max-w-4xl px-6">
                <h2 className="mb-5 text-lg font-bold text-zinc-900">Kategoriler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((cat, i) => {
                    const Svg = CATEGORY_SVGS[cat.svg]
                    return (
                      <div key={i} className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-white p-4">
                        <div className="shrink-0"><Svg /></div>
                        <div>
                          <p className="font-medium text-sm text-zinc-900">{cat.title}</p>
                          <p className="text-xs text-zinc-400">{cat.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}
          {filteredFaqs.length > 0 && (
            <section className="py-12">
              <div className="mx-auto max-w-4xl px-6">
                <h2 className="mb-5 text-lg font-bold text-zinc-900">Sorular & Cevaplar</h2>
                <div className="space-y-2">
                  {filteredFaqs.map(item => (
                    <div key={item.idx} className="rounded-xl border border-zinc-100 bg-white p-4">
                      <p className="font-medium text-sm text-zinc-900">{item.q}</p>
                      <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* No Results */}
      {noResults && (
        <section className="py-20 text-center">
          <div className="mx-auto max-w-md px-6">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <Search className="h-7 w-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">{t('sssSearchEmpty')}</h3>
            <p className="mt-2 text-sm text-zinc-500">{t('sssSearchEmptyDesc')}</p>
          </div>
        </section>
      )}

      {/* Trending Topics */}
      {!search.trim() && (
        <section className="py-16 bg-zinc-50 border-y border-zinc-100">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-8 text-2xl font-bold text-zinc-900 text-center">{t('sssTrendingTitle')}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {trendingTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = document.getElementById('sss-faq')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  {topic.text}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordion */}
      <section id="sss-faq" className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-2xl font-bold text-zinc-900 text-center">{t('sssFaqTitle')}</h2>
          <div className="space-y-3">
            {faqItems.map((item, i) => {
              const isOpen = openItems.has(i)
              return (
                <div key={i} className={`rounded-2xl border transition-colors duration-200 ${isOpen ? 'border-zinc-300 bg-white' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}>
                  <button onClick={() => toggleItem(i)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                    <span className="text-base font-semibold text-zinc-900 pr-4">{item.q}</span>
                    <span className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200 text-lg font-medium leading-none ${isOpen ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 text-zinc-400'}`}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-5">
                      <p className="text-sm text-zinc-600 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <MessageCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-zinc-900">{t('sssCtaTitle')}</h2>
          <p className="mb-6 text-zinc-500">{t('sssCtaDesc')}</p>
          <Link href="/iletisim" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            {t('sssCtaButton')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
