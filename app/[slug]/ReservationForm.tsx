'use client'

import { useActionState, useRef, useState } from 'react'
import { createReservation, type ActionState } from './actions'

const initialState: ActionState = {
  success: false,
  error: null,
  guestName: null,
}

const PARTY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export function ReservationForm({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string
  restaurantName: string
}) {
  const boundAction = createReservation.bind(null, restaurantId)
  const [state, formAction, pending] = useActionState(boundAction, initialState)
  const [selectedParty, setSelectedParty] = useState(2)
  const [showNotes, setShowNotes] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">Rezervasyonunuz Alındı!</h2>
          <p className="mt-1 text-sm text-stone-500">
            Merhaba{' '}
            <span className="font-semibold text-stone-700">{state.guestName}</span>,<br />
            {restaurantName} sizi bekliyor.
          </p>
        </div>
        <div className="w-full rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-800">
          Onay SMS&apos;i kısa süre içinde gönderilecektir.
        </div>
        <button
          type="button"
          onClick={() => formRef.current?.reset()}
          className="text-sm text-stone-400 underline underline-offset-2"
        >
          Yeni rezervasyon yap
        </button>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      {/* Ad Soyad */}
      <Field label="Ad Soyad" htmlFor="guest_name">
        <input
          id="guest_name"
          name="guest_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Ahmet Yılmaz"
          className={inputCls}
        />
      </Field>

      {/* Telefon */}
      <Field label="Telefon" htmlFor="guest_phone">
        <input
          id="guest_phone"
          name="guest_phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="0532 000 00 00"
          className={inputCls}
        />
      </Field>

      {/* Tarih + Saat */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tarih" htmlFor="reserved_date">
          <input
            id="reserved_date"
            name="reserved_date"
            type="date"
            required
            min={today}
            className={inputCls}
          />
        </Field>
        <Field label="Saat" htmlFor="reserved_time">
          <input
            id="reserved_time"
            name="reserved_time"
            type="time"
            required
            className={inputCls}
          />
        </Field>
      </div>

      {/* Kişi Sayısı */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-stone-700">Kişi Sayısı</label>
        <div className="flex gap-2 flex-wrap">
          {PARTY_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelectedParty(n)}
              className={`w-11 h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                selectedParty === n
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedParty(10)}
            className={`px-3 h-11 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              selectedParty >= 9
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            9+
          </button>
        </div>
        {/* Hidden input */}
        <input type="hidden" name="party_size" value={selectedParty} />
      </div>

      {/* Özel Not — açılır/kapanır */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 w-fit"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showNotes ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {showNotes ? 'Notu kaldır' : 'Özel not ekle'}
        </button>
        {showNotes && (
          <textarea
            name="notes"
            rows={3}
            placeholder="Alerji, doğum günü, özel istek…"
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
          />
        )}
      </div>

      {/* Hata */}
      {state.error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-amber-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:from-amber-400 hover:to-orange-400"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Gönderiliyor…
          </span>
        ) : (
          'Rezervasyon Yap'
        )}
      </button>

      <p className="text-center text-xs text-stone-400">
        Rezervasyon anında onaylanır • Ücretsiz iptal
      </p>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 w-full'
