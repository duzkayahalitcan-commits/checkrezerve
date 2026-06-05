'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Link } from '@/i18n/navigation'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const origin = window.location.origin
    const locale = window.location.pathname.split('/')[1] || 'tr'
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?type=recovery&locale=${locale}`,
    })

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col">
        <MarketingHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-2">{t('forgotPasswordSent')}</h1>
            <p className="text-zinc-400 text-sm mb-8">{t('forgotPasswordEmailSent')}</p>
            <Link
              href="/giris"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-red-400 transition-colors"
            >
              ← {t('forgotPasswordBackToLogin')}
            </Link>
          </div>
        </main>
        <MarketingFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col">
      <MarketingHeader />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-sm w-full">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white text-center mb-2">{t('forgotPasswordTitle')}</h1>
          <p className="text-zinc-400 text-sm text-center mb-8">{t('forgotPasswordDescription')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 block mb-1.5">{t('email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-red-900/30"
            >
              {loading ? t('pleaseWait') : t('forgotPasswordButton')}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              href="/giris"
              className="text-sm font-semibold text-zinc-500 hover:text-red-400 transition-colors"
            >
              ← {t('forgotPasswordBackToLogin')}
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
