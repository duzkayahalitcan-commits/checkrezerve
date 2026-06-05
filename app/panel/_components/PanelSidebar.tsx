'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, ChevronRight, LogOut } from 'lucide-react'
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
}: {
  slug: string
  restaurantName: string
  role: string
  restaurantId: string
}) {
  const pathname = usePathname()
  const base = `/panel/${slug}`

  const NAV = [
    { href: base,             label: 'Genel Bakış', icon: LayoutDashboard },
    { href: `${base}/takvim`, label: 'Takvim',      icon: Calendar        },
  ]

  const roleCls   = ROLE_STYLES[role]   ?? 'text-stone-400 bg-stone-800 border-stone-700'
  const roleLabel = ROLE_LABELS[role]   ?? role

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
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
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const isActive = item.href === base
              ? pathname === base || pathname === `${base}/`
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-500/12 text-red-400 border border-red-500/20'
                    : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon size={15} className="flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={11} className="opacity-40" />}
              </Link>
            )
          })}
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

      {/* ── Mobile Top Bar ──────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 py-3 bg-stone-900/95 backdrop-blur-md border-b border-white/5">
        <div>
          <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest select-none">
            checkrezerve
          </span>
          <div className="text-white font-bold text-sm leading-tight truncate max-w-[160px]">
            {restaurantName}
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

      {/* ── Mobile Bottom Nav ───────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex bg-stone-900/95 backdrop-blur-md border-t border-white/5 safe-bottom">
        {NAV.map(item => {
          const isActive = item.href === base
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-red-400' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
