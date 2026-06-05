'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'
import { panelLoginAction } from './actions'

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
          <span className="text-stone-400 text-xs">{t('rememberMe')}</span>
        </label>
        <a href="/panel/forgot-password" className="text-amber-500 hover:text-amber-400 text-xs transition">
          {t('forgotPassword')}
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
        {t('noAccount')}{' '}
        <a href="/panel/register" className="text-amber-500 hover:text-amber-400">{t('registerBusiness')}</a>
      </p>
    </form>
  )
}
