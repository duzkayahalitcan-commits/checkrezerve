'use client'

import { useState, useEffect, useActionState } from 'react'
import Image from 'next/image'
import { createBasvuru, type BasvuruState } from '@/app/basvuru/actions'

const SECTORS = ['Restoran', 'Berber', 'Kuaför', 'Spa', 'Güzellik Salonu', 'Kafe', 'Bar', 'Diğer']
const FEATURES = ['Kolay kurulum', '7/24 destek', 'Komisyon yok', 'İlk ay ücretsiz']

const inp =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-[#1a5c3a] focus:bg-white focus:outline-none ' +
  'focus:ring-2 focus:ring-[#1a5c3a]/10 transition-colors'

function ModalContent({ onClose }: { onClose: () => void }) {
  const initial: BasvuruState = { error: null, success: false }
  const [state, formAction, pending] = useActionState(createBasvuru, initial)

  if (state.success) {
    return (
      <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center flex flex-col items-center gap-5 mx-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5ee' }}>
          <svg className="w-7 h-7" style={{ color: '#1a5c3a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Başvurunuz Alındı</h2>
          <p className="mt-2 text-gray-500 text-sm">En kısa sürede ekibimiz sizi arayacak.</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg px-8 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: '#1a5c3a' }}
        >
          Kapat
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row mx-4">

      {/* X butonu */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '24px', cursor: 'pointer', background: 'none', border: 'none', color: '#666', zIndex: 60, lineHeight: 1 }}
        aria-label="Kapat"
      >×</button>

      {/* Sol panel */}
      <div className="lg:w-2/5 flex flex-col px-8 py-10" style={{ backgroundColor: '#1a5c3a' }}>
        <div className="flex items-center gap-2.5 mb-10">
          <Image src="/logo-icon.png" alt="CheckRezerve" width={32} height={32} className="rounded-md" />
          <span className="text-white font-bold text-lg tracking-tight">CheckRezerve</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-snug mb-3">
            İşletmenizi<br />dijitale taşıyın
          </h2>
          <p className="text-green-200 text-sm mb-8 leading-relaxed">
            Türkiye&apos;nin akıllı rezervasyon platformu.
          </p>
          <ul className="flex flex-col gap-3">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-green-100 text-sm">
                <span className="font-bold text-green-300">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-green-400 text-xs mt-8">checkrezerve.com</p>
      </div>

      {/* Sağ panel */}
      <div className="lg:w-3/5 bg-white px-8 py-10 flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Ücretsiz Başvur</h2>
        <p className="text-gray-400 text-sm mb-6">Bilgilerinizi bırakın, sizi arayalım.</p>

        <form action={formAction} className="flex flex-col gap-4">
          <Field label="İşletme Adı">
            <input name="business_name" required placeholder="Zeytin Restoran" className={inp} />
          </Field>

          <Field label="Firma Türü">
            <select name="category" required defaultValue="" className={inp}>
              <option value="" disabled>Seçin…</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Ad Soyad">
            <input name="name" required placeholder="Ahmet Yılmaz" className={inp} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Telefon">
              <input name="phone" type="tel" placeholder="0532 000 00 00" className={inp} />
            </Field>
            <Field label="E-posta">
              <input name="email" type="email" placeholder="siz@firma.com" className={inp} />
            </Field>
          </div>

          <Field label="Şehir">
            <input name="city" placeholder="İstanbul" className={inp} />
          </Field>

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

export default function BasvuruModal({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  return (
    <>
      <button className={className} onClick={() => setIsOpen(true)}>
        {children}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          />
          {/* Modal içeriği — key ile her açılışta sıfırlanır */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
            <ModalContent key={String(isOpen)} onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
