'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createLead, type LeadState } from './actions'
import Image from 'next/image'

const initial: LeadState = { error: null, success: false }

const SECTORS = [
  'Restoran', 'Berber', 'Kuaför', 'Spa',
  'Güzellik Salonu', 'Kafe', 'Bar', 'Diğer',
]

const inp =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-[#1a5c3a] focus:bg-white focus:outline-none ' +
  'focus:ring-2 focus:ring-[#1a5c3a]/10 transition-colors'

export default function KayitPage() {
  const [state, formAction, pending] = useActionState(createLead, initial)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.push('/') }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  if (state.success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5ee' }}>
            <svg className="w-7 h-7" style={{ color: '#1a5c3a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Başvurunuz Alındı!</h2>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">
              En kısa sürede ekibimiz sizinle iletişime geçecek.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: '#1a5c3a' }}
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    /* Overlay — tıklayınca kapat */
    <div
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8"
      onClick={() => router.push('/')}
    >
      {/* Kart */}
      <div
        className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row bg-white"
        onClick={e => e.stopPropagation()}
      >

        {/* X butonu */}
        <button
          onClick={() => router.push('/')}
          aria-label="Kapat"
          style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '24px', cursor: 'pointer', background: 'none', border: 'none', color: '#666', zIndex: 10, lineHeight: 1 }}
        >×</button>

        {/* Sol panel */}
        <div className="lg:w-2/5 flex flex-col px-8 py-10" style={{ backgroundColor: '#1a5c3a', backgroundImage: "linear-gradient(rgba(26,92,58,0.88),rgba(26,92,58,0.88)),url('/images/bg-basvuru.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="flex items-center gap-2.5 mb-10">
            <Image src="/logo-icon.png" alt="CheckRezerve" width={32} height={32} className="rounded-md" />
            <span className="text-white font-bold text-lg tracking-tight">CheckRezerve</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-snug mb-3">
              İşletmenizi<br />dijitale taşıyın
            </h1>
            <p className="text-green-200 text-sm mb-8 leading-relaxed">
              Türkiye&apos;nin akıllı rezervasyon platformu ile müşterilerinizi daha iyi yönetin.
            </p>
            <ul className="flex flex-col gap-3">
              {['Kolay kurulum', '7/24 destek', 'Komisyon yok', 'İlk ay ücretsiz'].map(f => (
                <li key={f} className="flex items-center gap-3 text-green-100 text-sm">
                  <span className="font-bold text-green-300">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-green-400 text-xs mt-8">checkrezerve.com</p>
        </div>

        {/* Sağ panel / Form */}
        <div className="lg:w-3/5 bg-white px-8 py-10 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Ücretsiz Başvur</h2>
          <p className="text-gray-400 text-sm mb-7">Bilgilerinizi bırakın, sizi arayalım.</p>

          <form action={formAction} className="flex flex-col gap-4">

            <Field label="İşletme Adı / Ad Soyad *">
              <input name="name" required placeholder="Ahmet Yılmaz" className={inp} />
            </Field>

            <Field label="Firma Türü *">
              <select name="category" required defaultValue="" className={inp}>
                <option value="" disabled>Seçin…</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Telefon">
                <input name="phone" type="tel" placeholder="0532 000 00 00" className={inp} />
              </Field>
              <Field label="E-posta">
                <input name="email" type="email" placeholder="siz@firma.com" className={inp} />
              </Field>
            </div>

            {state.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 w-full rounded-lg py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#1a5c3a' }}
            >
              {pending ? 'Gönderiliyor…' : 'Başvuru Gönder'}
            </button>
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
