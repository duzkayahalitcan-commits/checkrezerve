'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, List, Calendar,
  Users, UserCog, Scissors, Settings, CreditCard,
  LayoutGrid, PanelRightOpen, ChevronRight, LogOut, Menu, X, UtensilsCrossed,
  Package, Layers, BarChart3, Bot, CheckCircle2, Bell,
} from 'lucide-react'
import PanelLangSelector from './PanelLangSelector'
import NotificationBell from './NotificationBell'

const ROLE_STYLES: Record<string, string> = {
  business_owner:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  business_manager: 'text-blue-400  bg-blue-500/10  border-blue-500/20',
  super_admin:      'text-red-400   bg-red-500/10   border-red-500/20',
}
const ROLE_LABELS: Record<string, string> = {
  business_owner:   'Sahip',
  business_manager: 'Yönetici',
  super_admin:      'Admin',
}

export default function PanelSidebar({
  slug,
  restaurantName,
  role,
  restaurantId,
  businessType,
}: {
  slug: string
  restaurantName: string
  role: string
  restaurantId: string
  businessType?: string
}) {
  const pathname = usePathname()
  const base = `/panel/${slug}`
  const [drawerOpen, setDrawerOpen] = useState(false)

  // İşletme tipine göre "Hizmetler" ikonu — W-100
  const hizmetIcon = businessType === 'restaurant' || businessType === 'cafe'
    ? UtensilsCrossed
    : Scissors

  // Paket sistemi sadece randevu bazli sektorlerde gorunsun
  const paketSektoru = businessType && !['restaurant', 'cafe', 'bar'].includes(businessType)
  // Masa/kroki gerektirmeyen sektorler (pilates, fitness, vb.)
  const masaGerekmez = businessType && ['fitness', 'pilates', 'psychologist', 'chiropractor'].includes(businessType)

  // ── Bilgi mimarisi: mantıksal gruplar (iyi hiyerarşi, tekrar yok) ──
  const NAV_SECTIONS: { label: string; items: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] }[] = [
    {
      label: 'Yönetim',
      items: [
        { href: base,                    label: 'Genel Bakış',   icon: LayoutDashboard },
        { href: `${base}/bugun`,         label: 'Bugün',         icon: CalendarDays    },
        { href: `${base}/rezervasyonlar`,label: 'Rezervasyonlar',icon: List            },
        { href: `${base}/takvim`,        label: 'Takvim',        icon: Calendar        },
      ],
    },
    {
      label: 'Katalog',
      items: [
        { href: `${base}/hizmetler`,     label: 'Hizmetler',     icon: hizmetIcon      },
        { href: `${base}/calisanlar`,    label: 'Çalışanlar',    icon: UserCog         },
        ...(!masaGerekmez ? [
          { href: `${base}/masalar`,       label: 'Masalar',       icon: LayoutGrid      },
          { href: `${base}/kroki`,         label: 'Salon Krokisi', icon: PanelRightOpen  },
        ] : []),
      ],
    },
    ...(paketSektoru ? [{
      label: 'Paketler',
      items: [
        { href: `${base}/paketler`,      label: 'Paket Kataloğu', icon: Package as React.ComponentType<{ size?: number }> },
        { href: `${base}/uye-paketleri`, label: 'Üye Paketleri',  icon: Layers as React.ComponentType<{ size?: number }> },
      ],
    }] : []),
    {
      label: 'Müşteri',
      items: [
        { href: `${base}/misafirler`,    label: 'Misafirler',    icon: Users           },
      ],
    },
    {
      label: 'Personel',
      items: [
        { href: `${base}/takvimim`,      label: 'Benim Takvimim', icon: Calendar        },
        { href: `${base}/uye-seanslarim`,label: 'Seanslarım',     icon: CheckCircle2     },
      ],
    },
    {
      label: 'Analiz',
      items: [
        { href: `${base}/raporlar`,      label: 'Raporlar',       icon: BarChart3 as React.ComponentType<{ size?: number }> },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { href: `${base}/asistan-bilgileri`, label: 'Asistan',    icon: Bot as React.ComponentType<{ size?: number }> },
        { href: `${base}/bildirimler`,   label: 'Bildirimler',   icon: Bell             },
        { href: `${base}/ayarlar`,       label: 'Ayarlar',       icon: Settings        },
        { href: `${base}/abonelik`,      label: 'Abonelik',      icon: CreditCard      },
      ],
    },
  ]

  const roleCls   = ROLE_STYLES[role]   ?? 'text-stone-400 bg-stone-800 border-stone-700'
  const roleLabel = ROLE_LABELS[role]   ?? role

  function isActive(item: { href: string }) {
    return item.href === base
      ? pathname === base || pathname === `${base}/`
      : pathname.startsWith(item.href)
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 flex-col bg-stone-900/80 border-r border-white/5 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-white/5">
          <span className="text-[10px] font-mono tracking-widest text-stone-600 uppercase select-none">
            checkrezerve
          </span>
          <div className="mt-1.5 font-bold text-white text-sm leading-snug truncate" title={restaurantName}>
            {restaurantName}
          </div>
          <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleCls}`}>
            {roleLabel}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-600 select-none">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(item)
                        ? 'bg-red-500/12 text-red-400 border border-red-500/20'
                        : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <item.icon size={15} className="flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive(item) && <ChevronRight size={11} className="opacity-40" />}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: bell + lang + logout */}
        <div className="px-4 pb-5 pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 px-3 py-1">
            <NotificationBell restaurantId={restaurantId} />
            <span className="text-xs text-stone-600 flex-1">Yeni rezervasyon</span>
          </div>
          <PanelLangSelector />
          <a
            href="/panel/logout"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={14} />
            Çıkış Yap
          </a>
        </div>
      </aside>

      {/* ── Mobile Top Bar + Hamburger ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-3 bg-stone-900/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-stone-400 hover:text-white p-1 -ml-1"
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>
          <div>
            <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest select-none">
              checkrezerve
            </span>
            <div className="text-white font-bold text-sm leading-tight truncate max-w-[140px]">
              {restaurantName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell restaurantId={restaurantId} />
          <PanelLangSelector />
          <a
            href="/panel/logout"
            className="text-stone-400 hover:text-white text-xs border border-stone-700 hover:border-stone-500 transition px-3 py-1.5 rounded-lg"
          >
            Çıkış
          </a>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Drawer panel */}
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-stone-900/95 backdrop-blur-md border-r border-white/5 shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'slideInLeft 0.2s ease' }}
          >
            <style>{`@keyframes slideInLeft { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>

            {/* Header */}
            <div className="px-5 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-stone-600 uppercase select-none">
                  checkrezerve
                </span>
                <div className="mt-1 font-bold text-white text-sm leading-snug truncate max-w-[160px]" title={restaurantName}>
                  {restaurantName}
                </div>
                <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleCls}`}>
                  {roleLabel}
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-stone-400 hover:text-white p-1"
                aria-label="Menüyü kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="px-3 py-4 space-y-4">
              {NAV_SECTIONS.map(section => (
                <div key={section.label}>
                  <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-600 select-none">
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive(item)
                            ? 'bg-red-500/12 text-red-400 border border-red-500/20'
                            : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <item.icon size={15} className="flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {isActive(item) && <ChevronRight size={11} className="opacity-40" />}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Logout in drawer */}
            <div className="px-3 pt-3 border-t border-white/5">
              <a
                href="/panel/logout"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <LogOut size={14} />
                Çıkış Yap
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
