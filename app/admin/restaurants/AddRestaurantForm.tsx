'use client'

import { useActionState, useState } from 'react'
import { createRestaurant, type RestaurantState } from './actions'
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS, type BusinessType } from '@/types'

const initial: RestaurantState = { error: null, success: false }

const BUSINESS_TYPES = Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][]

export function AddRestaurantForm() {
  const [open, setOpen]                   = useState(false)
  const [state, formAction, pending]      = useActionState(createRestaurant, initial)
  const [businessType, setBusinessType]   = useState<BusinessType>('restaurant')

  if (state.success && open) setOpen(false)

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/3 px-4 py-2.5 text-sm text-stone-400 hover:border-amber-500/40 hover:text-amber-400 transition-colors"
        >
          <span className="text-lg leading-none">+</span> İşletme Ekle
        </button>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Yeni İşletme</h2>
            <button onClick={() => setOpen(false)} className="text-stone-500 hover:text-stone-300 text-xs">
              İptal
            </button>
          </div>

          <form action={formAction} className="flex flex-col gap-3">

            {/* Sektör Seçimi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-stone-400">Sektör *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUSINESS_TYPES.filter(([k]) => k !== 'other').map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBusinessType(key)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                      businessType === key
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-400 font-medium'
                        : 'border-white/10 text-stone-400 hover:border-white/20'
                    }`}
                  >
                    <span>{BUSINESS_TYPE_ICONS[key]}</span>
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="business_type" value={businessType} />
            </div>

            {/* İsim + Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-400">İşletme Adı *</label>
                <input
                  name="name"
                  required
                  placeholder="Elit Kuaför Salonu"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-400">Telefon</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+905321234567"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Adres + Kapasite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-400">Adres</label>
                <input
                  name="address"
                  placeholder="Nişantaşı, İstanbul"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-400">
                  {businessType === 'restaurant' ? 'Kapasite (kişi)' : 'Günlük Maks. Randevu'}
                </label>
                <input
                  name="capacity"
                  type="number"
                  min={1}
                  defaultValue={businessType === 'restaurant' ? 50 : 20}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Randevu Süresi + Instagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-400">Varsayılan Randevu Süresi (dk)</label>
                <input
                  name="booking_duration_minutes"
                  type="number"
                  min={15}
                  step={15}
                  defaultValue={businessType === 'restaurant' ? 120 : 60}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-400">Instagram (opsiyonel)</label>
                <input
                  name="instagram"
                  placeholder="@isletmeniz"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>

            {state.error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
