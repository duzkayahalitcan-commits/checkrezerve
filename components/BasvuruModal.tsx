'use client'

import { useState, useEffect, useActionState } from 'react'
import Image from 'next/image'
import { createLead, type LeadState } from '@/app/[locale]/kayit/actions'

const SECTORS = ['Restoran', 'Berber', 'Kuaför', 'Spa', 'Güzellik Salonu', 'Kafe', 'Bar', 'Diğer']
const FEATURES = ['Demo ve kurulum ücretsiz', 'Kredi kartı gerekmez', 'Uzman ekibimiz kurar']

const inp =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 ' +
  'placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:outline-none ' +
  'focus:ring-2 focus:ring-red-500/10 transition-colors'

function ModalContent({ onClose }: { onClose: () => void }) {
  const initial: LeadState = { error: null, success: false }
  const [state, formAction, pending] = useActionState(createLead, initial)

  if (state.success) {
    return (
      <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center flex flex-col items-center gap-5 mx-4">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Başvurunuz Alındı</h2>
          <p className="mt-2 text-zinc-500 text-sm">En kısa sürede ekibimiz sizi arayacak.</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl px-8 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
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
        className="absolute top-3 right-4 z-20 text-zinc-400 hover:text-zinc-700 text-2xl font-bold leading-none transition-colors"
        aria-label="Kapat"
      >×</button>

      {/* Sol panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col px-10 py-12 bg-[#0a0a0a] relative overflow-hidden rounded-l-2xl">
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
            {FEATURES.map(item => (
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
        </div>
      </div>

      {/* Sağ panel */}
      <div className="flex-1 bg-white px-8 py-10 flex flex-col justify-center">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
          <Image src="/logo-icon.png" alt="CheckRezerve" width={30} height={30} className="rounded-lg" />
          <span className="font-bold text-zinc-900 text-base tracking-tight">CheckRezerve</span>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Ücretsiz Demo Talep Et</h2>
        <p className="text-zinc-400 text-sm mb-8">Bilgilerinizi bırakın, uzman ekibimiz sisteminizi ücretsiz kursun.</p>

        <form action={formAction} className="flex flex-col gap-5">
          <Field label="İşletme Adı *">
            <input name="name" required placeholder="Örn: Kahve Dünyası" className={inp} />
          </Field>

          <Field label="Firma Türü *">
            <select name="category" required defaultValue="" className={inp}>
              <option value="" disabled>Seçin…</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Telefon *">
              <input name="phone" type="tel" required placeholder="+90 532 000 00 00" className={inp} />
            </Field>
            <Field label="E-posta *">
              <input name="email" type="email" required placeholder="isim@sirket.com" className={inp} />
            </Field>
          </div>

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              name="kvkk"
              id="kvkk-modal"
              required
              className="mt-0.5 w-4 h-4 rounded border-zinc-300 accent-red-600 cursor-pointer"
            />
            <label htmlFor="kvkk-modal" className="text-xs text-zinc-500 leading-relaxed cursor-pointer">
              <a href="/kvkk" className="underline hover:text-zinc-700">KVKK Aydınlatma Metni</a>
              {"'ni okudum, kişisel verilerimin işlenmesine ve ticari ileti gönderilmesine açık rıza veriyorum."}
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-1 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
          >
            {pending ? 'Gönderiliyor…' : 'Demo Talep Et →'}
          </button>
        </form>
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
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <ModalContent key={String(isOpen)} onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
