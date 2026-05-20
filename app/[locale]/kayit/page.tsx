'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createLead, type LeadState } from './actions'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const initial: LeadState = { error: null, success: false }

export default function KayitPage() {
  const t = useTranslations('basvuru')
  const [state, formAction, pending] = useActionState(createLead, initial)
  const router = useRouter()

  const SECTORS = [
    t('sectorRestaurant'), t('sectorBarber'), t('sectorHairdresser'), t('sectorSpa'),
    t('sectorBeauty'), t('sectorCafe'), t('sectorBar'), t('sectorOther'),
  ]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.push('/') }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  if (state.success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{t('successTitle')}!</h2>
            <p className="mt-2 text-zinc-500 text-sm leading-relaxed">{t('successDesc')}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="rounded-xl px-8 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {t('backHome')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-8">
      <div className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* Left panel — desktop only */}
        <div className="hidden lg:flex lg:w-2/5 flex-col px-10 py-12 bg-[#0a0a0a] relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-red-900/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -left-10 w-48 h-48 rounded-full bg-red-800/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3 mb-12">
            <Image src="/logo-icon.png" alt="CheckRezerve" width={36} height={36} className="rounded-xl" />
            <div>
              <span className="text-white font-bold text-lg tracking-tight block leading-none">CheckRezerve</span>
              <span className="text-zinc-500 text-xs italic">Saniyeler içinde rezervasyon</span>
            </div>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-extrabold text-white leading-snug mb-8">
              İşletmenizi dijital<br />
              <span className="text-red-500">geleceğe taşıyın.</span>
            </h1>
            <ul className="flex flex-col gap-4 mb-10">
              {['Ücretsiz başlayın', 'Kredi kartı gerekmez', '2 dakikada kurulum'].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-zinc-300 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 pt-6 border-t border-zinc-800">
              <div className="flex -space-x-2">
                {['MA', 'AY', 'KÖ', 'SB'].map((initials, i) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: ['#b91c1c','#991b1b','#7f1d1d','#450a0a'][i] }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-zinc-400 text-xs">
                <span className="text-white font-semibold">500+</span> işletme güveniyor
              </p>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 bg-white px-8 py-10 flex flex-col justify-center relative">
          <button
            onClick={() => router.push('/')}
            aria-label={t('closeLabel')}
            className="absolute top-4 right-5 text-zinc-400 hover:text-zinc-700 text-2xl font-bold leading-none transition-colors"
          >×</button>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <Image src="/logo-icon.png" alt="CheckRezerve" width={30} height={30} className="rounded-lg" />
            <span className="font-bold text-zinc-900 text-base tracking-tight">CheckRezerve</span>
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 mb-1">{t('formTitle')}</h2>
          <p className="text-zinc-400 text-sm mb-8">{t('formSubtitle')}</p>

          <form action={formAction} className="flex flex-col gap-5">

            <Field label={`${t('businessName')} / ${t('fullName')} *`}>
              <input
                name="name"
                required
                placeholder="Ahmet Yılmaz"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-colors"
              />
            </Field>

            <Field label={`${t('businessType')} *`}>
              <select
                name="category"
                required
                defaultValue=""
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-colors"
              >
                <option value="" disabled>{t('selectType')}</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t('phone')}>
                <input
                  name="phone"
                  type="tel"
                  placeholder="0532 000 00 00"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-colors"
                />
              </Field>
              <Field label={t('email')}>
                <input
                  name="email"
                  type="email"
                  placeholder="siz@firma.com"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-colors"
                />
              </Field>
            </div>

            {state.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
            >
              {pending ? t('submitting') : t('submit')}
            </button>

            <p className="text-center text-xs text-zinc-400">
              Kaydolarak{' '}
              <a href="/kullanim-kosullari" className="underline hover:text-zinc-600">Kullanım Koşulları</a>
              {'nı ve '}
              <a href="/gizlilik" className="underline hover:text-zinc-600">Gizlilik Politikası</a>
              nı kabul etmiş olursunuz.
            </p>
          </form>
        </div>

      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      {children}
    </div>
  )
}
