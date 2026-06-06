'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import {
  Search, Rocket, Calendar, CreditCard, Puzzle, Shield, Wrench,
  ChevronDown, ArrowRight, MessageCircle,
} from 'lucide-react'

const CATEGORY_ICONS = [Rocket, Calendar, CreditCard, Puzzle, Shield, Wrench] as const

export default function SSSPage() {
  const t = useTranslations('faq')
  const [search, setSearch] = useState('')
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const searchRef = useCallback((node: HTMLInputElement | null) => {
    if (node) node.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('sss-search')?.focus()
      }
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

  const categories = [
    { icon: 0, title: t('sssCatGettingStarted'), desc: t('sssCatGettingStartedDesc') },
    { icon: 1, title: t('sssCatReservations'), desc: t('sssCatReservationsDesc') },
    { icon: 2, title: t('sssCatPricing'), desc: t('sssCatPricingDesc') },
    { icon: 3, title: t('sssCatIntegration'), desc: t('sssCatIntegrationDesc') },
    { icon: 4, title: t('sssCatAccount'), desc: t('sssCatAccountDesc') },
    { icon: 5, title: t('sssCatTroubleshoot'), desc: t('sssCatTroubleshootDesc') },
  ]

  const trendingTopics = [
    { text: t('sssTrending1'), href: '#sss-faq' },
    { text: t('sssTrending2'), href: '#sss-faq' },
    { text: t('sssTrending3'), href: '#sss-faq' },
    { text: t('sssTrending4'), href: '#sss-faq' },
    { text: t('sssTrending5'), href: '#sss-faq' },
    { text: t('sssTrending6'), href: '#sss-faq' },
    { text: t('sssTrending7'), href: '#sss-faq' },
    { text: t('sssTrending8'), href: '#sss-faq' },
  ]

  const faqItems = Array.from({ length: 12 }, (_, i) => ({
    q: t(`sssQ${i + 1}`),
    a: t(`sssA${i + 1}`),
  }))

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.toLowerCase()
    return categories.filter(
      c => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
    )
  }, [search, categories])

  const filteredFaqs = useMemo(() => {
    const q = search.toLowerCase()
    return faqItems
      .map((item, i) => ({ ...item, idx: i }))
      .filter(item => !search.trim() || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
  }, [search, faqItems])

  const trendingFiltered = useMemo(() => {
    if (!search.trim()) return trendingTopics
    const q = search.toLowerCase()
    return trendingTopics.filter(t => t.text.toLowerCase().includes(q))
  }, [search, trendingTopics])

  const noResults = search.trim() && filteredCategories.length === 0 && filteredFaqs.length === 0 && trendingFiltered.length === 0

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── 1. HERO + SEARCH ──────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-20 text-white text-center overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.82) 100%), url(\'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80\')',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
              onChange={e => setSearch(e.target.value)}
              placeholder={t('sssSearchPlaceholder')}
              className="w-full rounded-2xl border-0 bg-white px-12 py-4 text-sm text-zinc-900 placeholder-zinc-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-400">
              ⌘K
            </kbd>
          </div>
        </div>
      </section>

      {/* ── 2. KATEGORİ GRID ──────────────────────────────────────── */}
      {!search.trim() && (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat, i) => {
                const Icon = CATEGORY_ICONS[cat.icon]
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSearch(cat.title)
                      document.getElementById('sss-search')?.focus()
                    }}
                    className="group flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-red-200"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-base">{cat.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{cat.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SEARCH RESULTS ────────────────────────────────────────── */}
      {search.trim() && !noResults && (
        <>
          {filteredCategories.length > 0 && (
            <section className="py-12 border-b border-zinc-100">
              <div className="mx-auto max-w-4xl px-6">
                <h2 className="mb-5 text-lg font-bold text-zinc-900">Kategoriler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((cat, i) => {
                    const Icon = CATEGORY_ICONS[cat.icon]
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-4">
                        <Icon className="h-5 w-5 text-red-500 shrink-0" />
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

      {/* ── no results ────────────────────────────────────────────── */}
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

      {/* ── 3. TRENDING TOPICS ─────────────────────────────────────── */}
      {!search.trim() && (
        <section className="py-16 bg-zinc-50 border-y border-zinc-100">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-2xl font-bold text-zinc-900 text-center">{t('sssTrendingTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl mx-auto">
              {trendingTopics.map((topic, i) => (
                <a
                  key={i}
                  href={topic.href}
                  onClick={e => {
                    e.preventDefault()
                    const el = document.getElementById('sss-faq')
                    if (el) {
                      setSearch('')
                      // Scroll after render
                      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50)
                    }
                  }}
                  className="group flex items-center gap-2.5 text-sm text-zinc-700 hover:text-red-600 transition-colors py-1.5"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-red-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  {topic.text}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. SSS ACCORDION ───────────────────────────────────────── */}
      <section id="sss-faq" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-2xl font-bold text-zinc-900 text-center">{t('sssFaqTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {faqItems.map((item, i) => {
              const isOpen = openItems.has(i)
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? 'border-red-200 bg-red-50/50 shadow-sm'
                      : 'border-zinc-100 bg-white hover:border-zinc-200'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                  >
                    <span className={`text-sm font-semibold leading-snug transition-colors ${
                      isOpen ? 'text-red-700' : 'text-zinc-900'
                    }`}>
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-red-500' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-4">
                      <p className="text-sm text-zinc-600 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 5. FOOTER CTA ──────────────────────────────────────────── */}
      <section className="py-16 bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <MessageCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-zinc-900">{t('sssCtaTitle')}</h2>
          <p className="mb-6 text-zinc-500">{t('sssCtaDesc')}</p>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            {t('sssCtaButton')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
