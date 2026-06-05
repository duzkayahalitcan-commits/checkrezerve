'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

type Tab = 'login' | 'signup'

function GirisForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const params = useSearchParams()
  const [tab, setTab] = useState<Tab>(params.get('tab') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/rezervasyon')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) { setError(t('invalidCredentials')); return }
      router.replace('/rezervasyon')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) { setError(error.message); return }
      setSuccess(t('signupSuccess'))
    }
  }

  const handleGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) setError(error.message)
  }

  const handleApple = () => {
    const params = new URLSearchParams({
      response_type: 'code id_token',
      response_mode: 'form_post',
      client_id: 'com.checkrezerve.web',
      redirect_uri: 'https://posarvagedpqtsrcrwfe.supabase.co/functions/v1/apple-auth',
      scope: 'name email',
      state: 'web',
    })
    window.location.href = 'https://appleid.apple.com/auth/authorize?' + params.toString()
  }

  return (
    <div className="min-h-screen flex">
      {/* Sol panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-red-600 via-red-500 to-rose-400 flex-col justify-between p-12 overflow-hidden">
        {/* Dekoratif daireler */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-black">CR</span>
            </div>
            <span className="text-white text-2xl font-black tracking-tight">CheckRezerve</span>
          </Link>
        </div>

        {/* Orta içerik */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-black text-white leading-tight">
            Rezervasyonunuzu<br />
            <span className="text-white/80">saniyeler içinde</span><br />
            yapın.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Türkiye'nin en hızlı büyüyen rezervasyon platformuna katılın. Restoran, spa, kuaför ve daha fazlası.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D'].map((l) => (
                <div key={l} className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{l}</div>
              ))}
            </div>
            <p className="text-white/80 text-sm">10.000+ mutlu müşteri</p>
          </div>
        </div>

        {/* Alt */}
        <div className="relative z-10">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} CheckRezerve. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* Sağ panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 bg-white">
        <div className="max-w-sm mx-auto w-full">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-black">CR</span>
            </div>
            <span className="text-xl font-black text-zinc-900">CheckRezerve</span>
          </Link>

          <h2 className="text-2xl font-black text-zinc-900 mb-1">
            {tab === 'login' ? 'Hoş geldiniz 👋' : 'Hesap oluşturun'}
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            {tab === 'login' ? 'Hesabınıza giriş yapın' : 'Birkaç saniyede üye olun'}
          </p>

          {/* Tabs */}
          <div className="flex rounded-xl bg-zinc-100 p-1 mb-6">
            {(['login', 'signup'] as Tab[]).map(tabItem => (
              <button
                key={tabItem}
                onClick={() => { setTab(tabItem); setError(null); setSuccess(null) }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  tab === tabItem ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {tabItem === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 border border-zinc-200 rounded-xl py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all mb-3 shadow-sm"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile {tab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>

          {/* Apple */}
          <button
            onClick={handleApple}
            className="w-full flex items-center justify-center gap-2.5 border border-zinc-200 rounded-xl py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all mb-5 shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple ile {tab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-100" />
            <span className="text-xs text-zinc-400 font-medium">veya e-posta ile</span>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1.5">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ornek@mail.com"
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 karakter"
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              />
              {tab === 'login' && (
                <div className="flex justify-end mt-1.5">
                  <a
                    href={`/${window.location.pathname.split('/')[1] || 'tr'}/sifre-sifirla`}
                    className="text-xs font-semibold text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    Şifremi Unuttum
                  </a>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <span>✅</span> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm shadow-red-200 mt-1"
            >
              {loading ? 'Lütfen bekleyin...' : tab === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </button>
          </form>

          {/* Yönetici linki */}
          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-400 mb-2">İşletme sahibi misiniz?</p>
            <a
              href="/panel/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-600 hover:text-red-600 transition-colors"
            >
              <span>⚙️</span>
              Yönetici Paneli'ne giriş yapın
              <span>→</span>
            </a>
          </div>

          <p className="text-center text-xs text-zinc-300 mt-6">
            <Link href="/" className="hover:text-zinc-500 transition-colors">← Ana Sayfaya Dön</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function GirisPage() {
  return (
    <Suspense>
      <GirisForm />
    </Suspense>
  )
}
