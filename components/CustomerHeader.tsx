'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function CustomerHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
  }

  const initials = user?.email?.charAt(0).toUpperCase() ?? ''

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-sm">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
            <span className="text-white text-xs font-bold">CR</span>
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-900">checkrezerve</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-900 transition-colors font-medium">Mekanlar</Link>
          <Link href="/#categories" className="hover:text-zinc-900 transition-colors font-medium">Kategoriler</Link>
          <Link href="/#business" className="hover:text-zinc-900 transition-colors font-medium">İşletmeler İçin</Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {initials}
                </div>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-white border border-zinc-100 rounded-2xl shadow-xl py-2 w-48 z-50">
                  <div className="px-4 py-2 border-b border-zinc-50 mb-1">
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                  </div>
                  <Link href="/profil" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                    <span>👤</span> Profilim
                  </Link>
                  <Link href="/profil" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                    <span>❤️</span> Favorilerim
                  </Link>
                  <div className="border-t border-zinc-50 mt-1 pt-1">
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <span>↪</span> Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/giris"
                className="hidden sm:block text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-medium px-3 py-1.5">
                Giriş Yap
              </Link>
              <Link href="/giris?tab=signup"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm">
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
