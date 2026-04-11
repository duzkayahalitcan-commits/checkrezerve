'use client'

import { useActionState } from 'react'
import { createLead, type LeadState } from './actions'
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS, type BusinessType } from '@/types'
import Link from 'next/link'

const initial: LeadState = { error: null, success: false }

const BUSINESS_TYPES = (Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][])
  .filter(([k]) => k !== 'other')

export default function KayitPage() {
  const [state, formAction, pending] = useActionState(createLead, initial)

  if (state.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-950 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Başvurunuz Alındı!</h2>
            <p className="mt-2 text-zinc-500 text-sm leading-relaxed">
              En kısa sürede ekibimiz sizinle iletişime geçecek.
              Sistemi keşfetmek için demo sayfamıza göz atabilirsiniz.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white hover:bg-amber-500 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">CR</span>
          </div>
          <span className="text-white text-lg font-bold tracking-tight">checkrezerve</span>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
            <h1 className="text-xl font-bold text-white">Sisteme Katıl</h1>
            <p className="text-sm text-white/80 mt-1">
              Ücretsiz başla · 10 dakikada canlıya geç · Komisyon yok
            </p>
          </div>

          <form action={formAction} className="px-8 py-7 flex flex-col gap-5">

            {/* Ad Soyad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">Ad Soyad *</label>
              <input
                name="name"
                required
                placeholder="Ahmet Yılmaz"
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>

            {/* Telefon + E-posta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Telefon</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="0532 000 00 00"
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">E-posta</label>
                <input
                  name="email"
                  type="email"
                  placeholder="siz@firma.com"
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            {/* Firma Türü */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Firma Türü *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {BUSINESS_TYPES.map(([key, label]) => (
                  <label
                    key={key}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 px-2 py-3 cursor-pointer
                               text-center text-xs text-zinc-500 hover:border-amber-300 hover:bg-amber-50 transition-all
                               has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50 has-[:checked]:text-amber-700 has-[:checked]:font-semibold"
                  >
                    <input type="radio" name="category" value={key} required className="sr-only" />
                    <span className="text-xl">{BUSINESS_TYPE_ICONS[key]}</span>
                    <span className="leading-tight">{label.split(' / ')[0]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hizmet Modeli */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Hizmet Modeli *</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'free',     label: 'Ödemesiz',    desc: 'Ücretsiz başla, istediğin zaman yükselt',  icon: '🆓' },
                  { value: 'prepaid',  label: 'Ön Ödemeli',  desc: 'Müşteri rezervasyon sırasında ödeme yapar', icon: '💳' },
                ] as const).map(({ value, label, desc, icon }) => (
                  <label
                    key={value}
                    className="flex flex-col gap-1 rounded-xl border border-zinc-200 px-4 py-3.5 cursor-pointer
                               hover:border-amber-300 hover:bg-amber-50 transition-all
                               has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50"
                  >
                    <input type="radio" name="payment_model" value={value} required className="sr-only" />
                    <span className="text-base">{icon}</span>
                    <span className="text-sm font-semibold text-zinc-800">{label}</span>
                    <span className="text-xs text-zinc-400 leading-snug">{desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Beklenen Yoğunluk */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">
                Beklenen Yoğunluk *
                <span className="ml-1 text-xs font-normal text-zinc-400">(günlük ortalama randevu)</span>
              </label>
              <input
                name="daily_avg_bookings"
                type="number"
                min={1}
                max={500}
                required
                placeholder="Örn: 20"
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              {pending ? 'Gönderiliyor…' : 'Başvuruyu Tamamla →'}
            </button>

            <p className="text-center text-xs text-zinc-400">
              Kredi kartı gerekmez · İstediğin zaman iptal et
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Zaten hesabın var mı?{' '}
          <Link href="/admin" className="text-amber-400 hover:text-amber-300 font-medium">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  )
}
