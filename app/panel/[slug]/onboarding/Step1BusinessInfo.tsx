'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { saveBusinessInfo } from './actions'

const DAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
const DAYS_KEY = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export default function Step1BusinessInfo({
  restaurant,
  slug,
}: {
  restaurant: Record<string, unknown>
  slug: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [state, formAction, pending] = useActionState(async (_prev: unknown, formData: FormData) => {
    const res = await saveBusinessInfo(formData)
    if (res.success) {
      toast.show('İşletme bilgileri kaydedildi ✅', 'success')
      router.push(`/panel/${slug}/onboarding/2`)
    } else {
      toast.show(res.error ?? 'Bir hata oluştu', 'error')
    }
    return res
  }, null)

  // Default hours
  const getDefault = (key: string, fallback: string) =>
    (restaurant[key] as string) ?? fallback

  return (
    <form action={formAction} className="space-y-6">
      {/* Brand banner */}
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#2B1B17] flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-2xl font-black text-white">C</span>
        </div>
        <h1 className="text-xl font-bold text-white">İşletmenizi Tanıyın</h1>
        <p className="text-sm text-stone-400 mt-1">İşletmenizin temel bilgilerini girin</p>
      </div>

      {/* Card */}
      <div className="bg-stone-800 border border-stone-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">İşletme Bilgileri</h2>

        <div>
          <label className="text-xs text-stone-400 font-medium mb-1.5 block">İşletme Adı *</label>
          <input
            name="name"
            defaultValue={getDefault('name', '')}
            required
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] outline-none"
            placeholder="Örn: Lezzet Lokantası"
          />
        </div>

        <div>
          <label className="text-xs text-stone-400 font-medium mb-1.5 block">Adres *</label>
          <textarea
            name="address"
            defaultValue={getDefault('address', '')}
            required
            rows={2}
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] outline-none resize-none"
            placeholder="Örn: Atatürk Cad. No:42, Kadıköy/İstanbul"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Telefon *</label>
            <input
              name="phone"
              type="tel"
              defaultValue={getDefault('phone', '')}
              required
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] outline-none"
              placeholder="+90 5XX XXX XX XX"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Web Sitesi</label>
            <input
              name="website"
              type="url"
              defaultValue={getDefault('website', '')}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] outline-none"
              placeholder="https://"
            />
          </div>
        </div>
      </div>

      {/* Calisma Saatleri */}
      <div className="bg-stone-800 border border-stone-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Çalışma Saatleri</h2>

        {DAYS_KEY.map((key, i) => {
          const closed = getDefault(`day_${key}_closed`, '')
          const open   = getDefault(`day_${key}_open`, '09:00')
          const close  = getDefault(`day_${key}_close`, '18:00')

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-stone-300 w-24 shrink-0">{DAYS_TR[i]}</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={`day_${key}_closed`}
                  defaultChecked={closed === 'true'}
                  className="w-4 h-4 rounded border-stone-600 text-[#E53935] focus:ring-[#E53935] bg-stone-900"
                />
                <span className="text-xs text-stone-500">Kapalı</span>
              </label>

              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="time"
                  name={`day_${key}_open`}
                  defaultValue={open}
                  className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4A373] outline-none"
                />
                <span className="text-stone-500 text-xs">—</span>
                <input
                  type="time"
                  name={`day_${key}_close`}
                  defaultValue={close}
                  className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4A373] outline-none"
                />
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-gradient-to-r from-[#E53935] to-red-700 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] hover:from-red-500 hover:to-red-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Kaydediliyor...
          </span>
        ) : (
          'Kaydet ve Devam Et →'
        )}
      </button>
    </form>
  )
}
