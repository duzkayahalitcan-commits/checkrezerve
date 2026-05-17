'use client'

import { useActionState }  from 'react'
import { useTranslations } from 'next-intl'
import { panelLoginAction } from './actions'

export default function LoginForm() {
  const t = useTranslations('panel')
  const [state, action, pending] = useActionState(panelLoginAction, { error: null })

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
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2.5
                     text-white text-sm placeholder-stone-600 focus:outline-none
                     focus:border-amber-500 transition"
          placeholder="ad@sirket.com"
        />
      </div>

      <div>
        <label className="block text-stone-400 text-xs mb-1">{t('password')}</label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2.5
                     text-white text-sm placeholder-stone-600 focus:outline-none
                     focus:border-amber-500 transition"
          placeholder="••••••••"
        />
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
    </form>
  )
}
