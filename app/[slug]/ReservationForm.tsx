'use client'

import { useActionState } from 'react'
import { createReservation, type ActionState } from './actions'

const initialState: ActionState = {
  success: false,
  error: null,
  guestName: null,
}

export function ReservationForm({ restaurantId }: { restaurantId: string }) {
  const boundAction = createReservation.bind(null, restaurantId)
  const [state, formAction, pending] = useActionState(boundAction, initialState)

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-green-50 border border-green-200 p-10 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-green-800">Rezervasyonunuz Alındı!</h2>
        <p className="text-green-700">
          Merhaba <span className="font-semibold">{state.guestName}</span>, sizi bekliyoruz.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="guest_name" className="text-sm font-medium text-zinc-700">
          Ad Soyad
        </label>
        <input
          id="guest_name"
          name="guest_name"
          type="text"
          required
          placeholder="Ahmet Yılmaz"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="guest_phone" className="text-sm font-medium text-zinc-700">
          Telefon
        </label>
        <input
          id="guest_phone"
          name="guest_phone"
          type="tel"
          required
          placeholder="0532 000 00 00"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reserved_date" className="text-sm font-medium text-zinc-700">
            Tarih
          </label>
          <input
            id="reserved_date"
            name="reserved_date"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reserved_time" className="text-sm font-medium text-zinc-700">
            Saat
          </label>
          <input
            id="reserved_time"
            name="reserved_time"
            type="time"
            required
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="party_size" className="text-sm font-medium text-zinc-700">
          Kişi Sayısı
        </label>
        <select
          id="party_size"
          name="party_size"
          defaultValue="2"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} kişi
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Gönderiliyor…' : 'Rezervasyon Yap'}
      </button>
    </form>
  )
}
