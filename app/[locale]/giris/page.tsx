'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Tab = 'login' | 'signup'

function GirisForm() {
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
      if (session) router.replace('/')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : error.message)
        return
      }
      router.replace('/')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) { setError(error.message); return }
      setSuccess('Hesabınız oluşturuldu! E-posta adresinizi doğruladıktan sonra giriş yapabilirsiniz.')
    }
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 group">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md group-hover:bg-emerald-700 transition-colors">
          <span className="text-white text-sm font-bold">CR</span>
        </div>
        <span className="text-xl font-bold text-zinc-900">checkrezerve</span>
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
        <h1 className="text-lg font-bold text-zinc-900 text-center mb-6">
          {tab === 'login' ? 'Hesabınıza girin' : 'Hesap oluşturun'}
        </h1>

        {/* Tabs */}
        <div className="flex rounded-xl bg-zinc-100 p-1 mb-6">
          {(['login', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setSuccess(null) }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === t ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {t === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 border border-zinc-200 rounded-xl py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors mb-4"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google ile {tab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>

        <div className="relative flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-zinc-100" />
          <span className="text-xs text-zinc-400">veya e-posta ile</span>
          <div className="flex-1 h-px bg-zinc-100" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1.5">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="ornek@mail.com"
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 block mb-1.5">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimum 6 karakter"
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {error   && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}
          {success && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm shadow-emerald-600/20"
          >
            {loading ? 'Lütfen bekleyin...' : tab === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-zinc-400 mt-6">
        <Link href="/" className="hover:text-zinc-600 transition-colors">← Ana Sayfaya Dön</Link>
      </p>
    </div>
  )
}

export default function GirisPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
      <Suspense>
        <GirisForm />
      </Suspense>
    </div>
  )
}
