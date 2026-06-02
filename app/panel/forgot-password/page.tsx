'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = getSupabase()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/panel/auth/callback?type=recovery',
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 -z-10">
        <Image src="/images/bg-emerald.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/images/logo-checkrezerve.jpg"
            alt="CheckRezerve"
            width={72}
            height={72}
            className="rounded-2xl mx-auto mb-3 shadow-xl"
          />
          <div className="text-2xl font-bold text-white tracking-tight">checkrezerve</div>
          <div className="mx-auto mt-2 mb-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
          <p className="text-white/40 text-xs italic mt-0.5">Saniyeler içinde rezervasyon</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-stone-700 rounded-2xl p-6">
          <h1 className="text-white font-semibold mb-1">Şifremi Unuttum</h1>
          <p className="text-stone-400 text-xs mb-5">
            E-posta adresinizi girin, şifre sıfırlama linki gönderelim.
          </p>

          {sent ? (
            <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-lg px-4 py-3 text-emerald-400 text-sm text-center">
              E-posta gönderildi — kutunuzu kontrol edin.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-stone-400 text-xs mb-1">E-posta</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2.5
                             text-white text-sm placeholder-stone-600 focus:outline-none
                             focus:border-amber-500 transition"
                  placeholder="ad@sirket.com"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                           text-black font-semibold rounded-lg py-2.5 text-sm transition"
              >
                {loading ? 'Gönderiliyor…' : 'Sıfırlama Linki Gönder'}
              </button>
            </form>
          )}

          <p className="text-center mt-4">
            <a href="/panel/login" className="text-stone-400 hover:text-white text-xs transition">
              ← Giriş sayfasına dön
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
