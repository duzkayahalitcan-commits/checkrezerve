'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/panel/auth/callback?type=recovery',
    })
    setLoading(false)
    if (error) { setError('E-posta gönderilemedi. Adresi kontrol edin.'); return }
    setSent(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 -z-10">
        <Image src="/images/bg-emerald.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/images/logo-checkrezerve.jpg" alt="CheckRezerve" width={72} height={72} className="rounded-2xl mx-auto mb-3 shadow-xl" />
          <div className="text-2xl font-bold text-white tracking-tight">checkrezerve</div>
          <p className="text-white/60 text-sm mt-1 italic">Saniyeler içinde rezervasyon</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-stone-700 rounded-2xl p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <p className="text-white font-semibold">E-posta gönderildi!</p>
              <p className="text-stone-400 text-sm">Gelen kutunuzu kontrol edin ve şifre sıfırlama linkine tıklayın.</p>
              <a href="/panel/login" className="block text-amber-500 hover:text-amber-400 text-sm transition">← Giriş sayfasına dön</a>
            </div>
          ) : (
            <>
              <h1 className="text-white font-semibold mb-1">Şifremi Unuttum</h1>
              <p className="text-stone-400 text-xs mb-5">E-posta adresinize sıfırlama linki göndereceğiz.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-stone-400 text-xs mb-1">E-posta</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                    placeholder="ad@sirket.com"
                  />
                </div>
                {error && <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-lg py-2.5 text-sm transition">
                  {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                </button>
                <a href="/panel/login" className="block text-center text-stone-500 hover:text-stone-300 text-xs transition">← Giriş sayfasına dön</a>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
