'use client'

import { useActionState, useRef } from 'react'
import { loginAction, type LoginState } from './actions'

const initial: LoginState = { error: null }

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="from" value={redirectTo} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-stone-300">
          Şifre
        </label>
        <input
          ref={inputRef}
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="••••••••"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </button>
    </form>
  )
}
