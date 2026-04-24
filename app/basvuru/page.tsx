'use client'

import { useActionState } from 'react'
import { createBasvuru, type BasvuruState } from './actions'
import { BUSINESS_TYPE_LABELS, type BusinessType } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

const initial: BasvuruState = { error: null, success: false }

const SECTORS = Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][]

const FEATURES = [
  { icon: '📅', text: 'Online rezervasyon — 7/24 müşteri kabul' },
  { icon: '📱', text: 'SMS & WhatsApp bildirim sistemi' },
  { icon: '📊', text: 'Doluluk ve gelir takibi' },
  { icon: '🤖', text: 'AI çağrı asistanı — mesai dışı bile' },
]

export default function BasvuruPage() {
  const [state, formAction, pending] = useActionState(createBasvuru, initial)

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5ee' }}>
            <svg className="w-10 h-10" style={{ color: '#1a5c3a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Başvurunuz Alındı!</h2>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              En kısa sürede ekibimiz sizinle iletişime geçecek.<br />
              Ortalama yanıt süresi 24 saattir.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#1a5c3a' }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Sol panel ── */}
      <div
        className="lg:w-2/5 flex flex-col justify-between px-10 py-12"
        style={{ backgroundColor: '#1a5c3a' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <Image src="/logo-icon.png" alt="CheckRezerve" width={36} height={36} className="rounded-lg" />
          <span className="text-white text-xl font-bold tracking-tight">CheckRezerve</span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
            İşletmenizi<br />dijitale taşıyın
          </h1>
          <p className="text-green-200 text-base mb-10 leading-relaxed">
            Türkiye&apos;nin akıllı rezervasyon platformu ile doluluk oranınızı artırın, gelir kaybını önleyin.
          </p>

          <ul className="flex flex-col gap-4">
            {FEATURES.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-xl leading-none mt-0.5">{icon}</span>
                <span className="text-green-100 text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-green-300 text-xs mt-10">
          Komisyon yok · Ücretsiz başla · İstediğin zaman iptal et
        </p>
      </div>

      {/* ── Sağ panel / Form ── */}
      <div className="lg:w-3/5 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Ücretsiz Başvur</h2>
          <p className="text-gray-500 text-sm mb-8">Bilgilerinizi bırakın, sizi arayalım.</p>

          <form action={formAction} className="flex flex-col gap-5">

            {/* İşletme Adı */}
            <Field label="İşletme Adı *">
              <input
                name="business_name"
                required
                placeholder="Örn: Zeytin Restoran"
                className={inputCls}
              />
            </Field>

            {/* Sektör */}
            <Field label="Sektör *">
              <select name="category" required className={inputCls} defaultValue="">
                <option value="" disabled>Sektör seçin…</option>
                {SECTORS.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </Field>

            {/* Ad Soyad */}
            <Field label="Ad Soyad *">
              <input
                name="name"
                required
                placeholder="Ahmet Yılmaz"
                className={inputCls}
              />
            </Field>

            {/* Telefon + E-posta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Telefon">
                <input
                  name="phone"
                  type="tel"
                  placeholder="0532 000 00 00"
                  className={inputCls}
                />
              </Field>
              <Field label="E-posta">
                <input
                  name="email"
                  type="email"
                  placeholder="siz@firma.com"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Şehir */}
            <Field label="Şehir">
              <input
                name="city"
                placeholder="İstanbul"
                className={inputCls}
              />
            </Field>

            {/* Mesaj */}
            <Field label="Mesaj (isteğe bağlı)">
              <textarea
                name="message"
                rows={3}
                placeholder="İşletmeniz hakkında kısa bilgi verin…"
                className={inputCls + ' resize-none'}
              />
            </Field>

            {state.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-4 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: pending ? '#2d7a4f' : '#1a5c3a' }}
              onMouseEnter={e => { if (!pending) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#154d30' }}
              onMouseLeave={e => { if (!pending) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a5c3a' }}
            >
              {pending ? 'Gönderiliyor…' : 'Başvuruyu Gönder →'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Zaten hesabınız var mı?{' '}
              <Link href="/giris" className="underline hover:text-gray-600">Giriş yapın</Link>
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
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 ' +
  'focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 transition-colors'
