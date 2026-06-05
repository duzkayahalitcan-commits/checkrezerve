'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

export default function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Slide-in animation on mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

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
    if (error) {
      setError('E-posta gönderilemedi. Adresi kontrol edin.')
      return
    }
    setSent(true)
  }

  // ── Sent state ──
  if (sent) {
    return (
      <div
        className={`flex flex-col items-center text-center space-y-5 transition-all duration-600 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Mail size={28} className="text-red-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{t('forgotPasswordSent')}</p>
          <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{t('forgotPasswordEmailSent')}</p>
        </div>
        <a
          href="/panel/login"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 font-semibold transition-colors"
        >
          <ArrowLeft size={14} />
          {t('forgotPasswordBackToLogin')}
        </a>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-5 transition-all duration-600 ease-out ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {/* E-posta — floating label */}
      <div className="relative">
        <input
          id="email"
          name="email"
          type="email"
          autoFocus
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder=" "
          className={`peer w-full bg-transparent border-b-2 px-1 pb-2 pt-6 text-sm text-white
            outline-none transition-colors
            ${error ? 'border-red-500' : 'border-zinc-700 focus:border-red-500'}`}
        />
        <label
          htmlFor="email"
          className={`absolute left-1 text-sm transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-zinc-600
            peer-focus:top-0 peer-focus:text-xs peer-focus:text-red-400
            ${email ? 'top-0 text-xs text-zinc-500' : ''}
            ${error ? 'text-red-400' : ''}`}
        >
          {t('email')}
        </label>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Gönder butonu */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
          disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm
          transition-all duration-200 ease-out
          hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/40
          active:translate-y-0
          flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Gönderiliyor...
          </>
        ) : (
          <>
            <Mail size={16} />
            {t('forgotPasswordButton')}
          </>
        )}
      </button>

      {/* Giriş sayfasına dön */}
      <p className="text-center text-xs text-zinc-600 pt-2">
        <a
          href="/panel/login"
          className="text-red-400 hover:text-red-300 font-semibold transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft size={12} />
          {t('forgotPasswordBackToLogin')}
        </a>
      </p>
    </form>
  )
}
