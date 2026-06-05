'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { panelLoginAction } from './actions'

export default function LoginForm() {
  const t = useTranslations('panel')
  const [state, action, pending] = useActionState(panelLoginAction, { error: null })
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Slide-in animation on mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <form
      ref={formRef}
      action={action}
      className={`space-y-5 transition-all duration-600 ease-out ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {/* E-posta — floating label */}
      <div className="relative">
        <input
          id="email"
          name="username"
          type="text"
          autoFocus
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder=" "
          className={`peer w-full bg-transparent border-b-2 px-1 pb-2 pt-6 text-sm text-white
            outline-none transition-colors
            ${state.error ? 'border-red-500' : 'border-zinc-700 focus:border-red-500'}`}
        />
        <label
          htmlFor="email"
          className={`absolute left-1 text-sm transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-zinc-600
            peer-focus:top-0 peer-focus:text-xs peer-focus:text-red-400
            ${email ? 'top-0 text-xs text-zinc-500' : ''}
            ${state.error ? 'text-red-400' : ''}`}
        >
          {t('username')}
        </label>
      </div>

      {/* Şifre — floating label + toggle */}
      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder=" "
          className={`peer w-full bg-transparent border-b-2 px-1 pb-2 pt-6 text-sm text-white
            outline-none transition-colors pr-8
            ${state.error ? 'border-red-500' : 'border-zinc-700 focus:border-red-500'}`}
        />
        <label
          htmlFor="password"
          className={`absolute left-1 text-sm transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-zinc-600
            peer-focus:top-0 peer-focus:text-xs peer-focus:text-red-400
            ${password ? 'top-0 text-xs text-zinc-500' : ''}
            ${state.error ? 'text-red-400' : ''}`}
        >
          {t('password')}
        </label>
        {/* Göster/gizle toggle */}
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div
            className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150
              ${rememberMe ? 'bg-red-500 border-red-500' : 'border-zinc-700 group-hover:border-zinc-500'}"
            onClick={() => setRememberMe(v => !v)}
          >
            {rememberMe && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            name="rememberMe"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="hidden"
          />
          <span className="text-zinc-500 text-xs font-medium cursor-pointer select-none">{t('rememberMe')}</span>
        </label>
        <a
          href="/panel/forgot-password"
          className="text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors"
        >
          {t('forgotPassword')}
        </a>
      </div>

      {/* Hata mesajı */}
      {state.error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {t(state.error)}
        </div>
      )}

      {/* Giriş butonu */}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
          disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm
          transition-all duration-200 ease-out
          hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/40
          active:translate-y-0
          flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('loggingIn')}
          </>
        ) : (
          <>
            <LogIn size={16} />
            {t('login')}
          </>
        )}
      </button>

      {/* Kayıt linki */}
      <p className="text-center text-xs text-zinc-600 pt-2">
        {t('noAccount')}{' '}
        <a href="/panel/register" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
          {t('registerBusiness')} →
        </a>
      </p>
    </form>
  )
}
