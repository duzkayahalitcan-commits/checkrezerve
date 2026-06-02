'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { panelLoginAction } from './actions'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function signInWithGoogle() {
  const supabase = getSupabase()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/panel/auth/callback' },
  })
}

async function signInWithApple() {
  const supabase = getSupabase()
  await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: window.location.origin + '/panel/auth/callback' },
  })
}

export default function LoginForm() {
  const t = useTranslations('panel')
  const [state, action, pending] = useActionState(panelLoginAction, { error: null })
  const [showPassword, setShowPassword] = useState(false)

  const errorBorder = state.error ? 'border-red-500' : 'border-stone-700'

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-stone-400 text-xs mb-1">{t('username')}</label>
        <input
          name="username"
          type="text"
          autoFocus
          autoComplete="email"
          required
          className={`w-full bg-stone-800 ${errorBorder} rounded-lg px-3 py-2.5
                     text-white text-sm placeholder-stone-600 focus:outline-none
                     focus:border-amber-500 transition`}
          placeholder="ad@sirket.com"
        />
      </div>

      <div>
        <label className="block text-stone-400 text-xs mb-1">{t('password')}</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className={`w-full bg-stone-800 ${errorBorder} rounded-lg px-3 py-2.5 pr-10
                       text-white text-sm placeholder-stone-600 focus:outline-none
                       focus:border-amber-500 transition`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" name="rememberMe" className="accent-amber-500" />
          <span className="text-stone-400 text-xs">Beni Hatırla</span>
        </label>
        <a href="/panel/forgot-password" className="text-amber-500 hover:text-amber-400 text-xs transition">
          Şifremi Unuttum?
        </a>
      </div>

      {state.error && (
        <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/50
                      rounded-lg px-3 py-2">
          {t(state.error)}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                   text-black font-semibold rounded-lg py-2.5 text-sm transition"
      >
        {pending ? t('loggingIn') : t('login')}
      </button>

      <p className="text-center text-xs text-stone-500 mt-2">
        Hesabınız yok mu?{' '}
        <a href="/panel/register" className="text-amber-500 hover:text-amber-400">İşletmenizi Kaydedin</a>
      </p>

      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px bg-stone-700" />
        <span className="text-stone-500 text-xs">veya</span>
        <div className="flex-1 h-px bg-stone-700" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full bg-stone-800 border border-stone-700 hover:bg-stone-700
                   flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-lg transition"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google ile Giriş Yap
      </button>

      <button
        type="button"
        onClick={signInWithApple}
        className="w-full bg-stone-800 border border-stone-700 hover:bg-stone-700
                   flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-lg transition"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Apple ile Giriş Yap
      </button>
    </form>
  )
}
