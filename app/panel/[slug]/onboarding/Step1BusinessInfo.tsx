'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { saveBusinessInfo } from './actions'

const DAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
const DAYS_KEY = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const WORKING_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// ─── W-91/W-92 mapping (tek yer, yorumlu) ──────────────────────────────────
// Switch "Açık" (true)  → working_hours.day.open: true  → işletme açık, saat inputları aktif
// Switch "Kapalı" (false) → working_hours.day.open: false → işletme kapalı, saat inputları disabled
// Varsayılan: yeni onboarding'te tüm günler AÇIK 09:00-18:00

type DayState = {
  open: boolean
  start: string
  end: string
  error: string
}

function initDayStates(wh: Record<string, { open: boolean; start: string; end: string }> | null): DayState[] {
  return DAYS_KEY.map((_, i) => {
    const day = WORKING_DAYS[i]
    if (wh && wh[day]) {
      return {
        open: wh[day].open,
        start: wh[day].start || '09:00',
        end: wh[day].end || '18:00',
        error: '',
      }
    }
    // Varsayılan: AÇIK 09:00-18:00
    return { open: true, start: '09:00', end: '18:00', error: '' }
  })
}

// Telefon TR format: 05XX XXX XX XX veya +905XX XXX XX XX
const PHONE_TR_RE = /^(0\d{10}|\+90\d{10})$/

export default function Step1BusinessInfo({
  restaurant,
  slug,
}: {
  restaurant: Record<string, unknown>
  slug: string
}) {
  const router = useRouter()
  const toast = useToast()

  const wh = (restaurant.working_hours as Record<string, { open: boolean; start: string; end: string }> | null) ?? null

  const [days, setDays] = useState<DayState[]>(() => initDayStates(wh))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLTextAreaElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const websiteRef = useRef<HTMLInputElement>(null)
  const dayRefs = useRef<(HTMLDivElement | null)[]>([])

  // ─── Day toggle ─────────────────────────────────────────────────────────────
  const toggleDay = useCallback((idx: number) => {
    setDays(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], open: !next[idx].open, error: '' }
      return next
    })
    setErrors(prev => {
      const next = { ...prev }
      delete next[`day_${DAYS_KEY[idx]}_start`]
      delete next[`day_${DAYS_KEY[idx]}_end`]
      return next
    })
  }, [])

  const updateDayTime = useCallback((idx: number, field: 'start' | 'end', value: string) => {
    setDays(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value, error: '' }
      return next
    })
  }, [])

  // ─── Client-side validasyon ────────────────────────────────────────────────
  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {}
    const form = formRef.current
    if (!form) return errs

    const name = (new FormData(form).get('name') as string)?.trim() || ''
    if (name.length < 2) errs.name = 'İşletme adı en az 2 karakter olmalıdır.'

    const address = (new FormData(form).get('address') as string)?.trim() || ''
    if (address.length < 5) errs.address = 'Adres en az 5 karakter olmalıdır.'

    const phone = (new FormData(form).get('phone') as string)?.replace(/\s/g, '') || ''
    if (!PHONE_TR_RE.test(phone)) {
      errs.phone = 'Geçerli format: 05XX XXX XX XX veya +905XX XXX XX XX'
    }

    const website = (new FormData(form).get('website') as string)?.trim() || ''
    if (website) {
      try {
        const url = new URL(website)
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
      } catch {
        errs.website = 'Geçerli bir URL girin (https:// ile başlamalı)'
      }
    }

    // Çalışma saatleri validasyonu
    for (let i = 0; i < days.length; i++) {
      const day = days[i]
      if (day.open && day.start >= day.end) {
        errs[`day_${DAYS_KEY[i]}_start`] = `Kapanış saati (${day.end}) açılıştan (${day.start}) önce olamaz.`
        errs[`day_${DAYS_KEY[i]}_end`] = `Kapanış saati (${day.end}) açılıştan (${day.start}) önce olamaz.`
      }
    }

    return errs
  }, [days])

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Client-side validasyon
    const errs = validate()
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      toast.show('Lütfen hataları düzeltin', 'error')

      // İlk hatalı alana scroll+focus
      const fieldOrder = ['name', 'address', 'phone', 'website',
        ...DAYS_KEY.flatMap(k => [`day_${k}_start`, `day_${k}_end`])]
      for (const key of fieldOrder) {
        if (errs[key]) {
          const el = formRef.current?.querySelector(`[name="${key}"]`) as HTMLElement | null
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            el.focus()
          }
          break
        }
      }
      return
    }

    // Server'a gönder
    setPending(true)
    try {
      const formData = new FormData(e.currentTarget)

      // Switch durumlarını formData'ya ekle (input name="day_mon_open" ile eşleşsin)
      for (let i = 0; i < days.length; i++) {
        const ds = DAYS_KEY[i]
        formData.set(`day_${ds}_open`, days[i].open ? 'on' : 'off')
        formData.set(`day_${ds}_start`, days[i].start)
        formData.set(`day_${ds}_end`, days[i].end)
      }

      const res = await saveBusinessInfo(formData)
      if (res.success) {
        toast.show('İşletme bilgileri kaydedildi ✅', 'success')
        router.push(`/panel/${slug}/onboarding/2`)
      } else {
        toast.show(res.error ?? 'Bir hata oluştu', 'error')
      }
    } catch {
      toast.show('Bir hata oluştu', 'error')
    } finally {
      setPending(false)
    }
  }, [days, validate, toast, slug, router])

  const getDefault = (key: string, fallback: string) =>
    (restaurant[key] as string) ?? fallback

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Brand banner */}
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#2B1B17] flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-2xl font-black text-white">C</span>
        </div>
        <h1 className="text-xl font-bold text-white">İşletmenizi Tanıyın</h1>
        <p className="text-sm text-stone-400 mt-1">İşletmenizin temel bilgilerini girin</p>
      </div>

      {/* ─── Card: İşletme Bilgileri ──────────────────────────────────────── */}
      <div className="bg-stone-800 border border-stone-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">İşletme Bilgileri</h2>

        {/* İşletme Adı */}
        <div>
          <label className="text-xs text-stone-400 font-medium mb-1.5 block">İşletme Adı *</label>
          <input
            ref={nameRef}
            name="name"
            defaultValue={getDefault('name', '')}
            required
            minLength={2}
            className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:ring-1 outline-none transition-colors ${
              errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-700 focus:border-[#D4A373] focus:ring-[#D4A373]'
            }`}
            placeholder="Örn: Lezzet Lokantası"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Adres */}
        <div>
          <label className="text-xs text-stone-400 font-medium mb-1.5 block">Adres *</label>
          <textarea
            ref={addressRef}
            name="address"
            defaultValue={getDefault('address', '')}
            required
            minLength={5}
            rows={2}
            className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:ring-1 outline-none resize-none transition-colors ${
              errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-700 focus:border-[#D4A373] focus:ring-[#D4A373]'
            }`}
            placeholder="Örn: Atatürk Cad. No:42, Kadıköy/İstanbul"
          />
          {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Telefon */}
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Telefon *</label>
            <input
              ref={phoneRef}
              name="phone"
              type="tel"
              defaultValue={getDefault('phone', '')}
              required
              onKeyDown={(e) => {
                // Sadece rakam, +, backspace, tab, arrow, delete, home, end
                const allowed = ['0','1','2','3','4','5','6','7','8','9','+','Backspace','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Delete','Home','End','Control','Meta','a','c','v','x']
                if (!allowed.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault()
                }
              }}
              className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:ring-1 outline-none transition-colors ${
                errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-700 focus:border-[#D4A373] focus:ring-[#D4A373]'
              }`}
              placeholder="+90 5XX XXX XX XX"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Web Sitesi */}
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Web Sitesi</label>
            <input
              ref={websiteRef}
              name="website"
              type="url"
              defaultValue={getDefault('website', '')}
              className={`w-full bg-stone-900 border rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:ring-1 outline-none transition-colors ${
                errors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-stone-700 focus:border-[#D4A373] focus:ring-[#D4A373]'
              }`}
              placeholder="https://"
            />
            {errors.website && <p className="text-red-400 text-xs mt-1">{errors.website}</p>}
          </div>
        </div>
      </div>

      {/* ─── Card: Çalışma Saatleri ────────────────────────────────────────── */}
      <div className="bg-stone-800 border border-stone-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">Çalışma Saatleri</h2>

        {DAYS_KEY.map((key, i) => {
          const day = days[i]
          const startErr = errors[`day_${key}_start`]
          const endErr = errors[`day_${key}_end`]

          return (
            <div
              key={key}
              ref={(el) => { dayRefs.current[i] = el }}
              className="flex flex-wrap items-center gap-3"
            >
              {/* Gün adı */}
              <span className="text-sm text-stone-300 w-24 shrink-0">{DAYS_TR[i]}</span>

              {/* Switch (Açık/Kapalı) — W-91: checkbox → toggle */}
              <button
                type="button"
                name={`day_${key}_open`}
                onClick={() => toggleDay(i)}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                  day.open ? 'bg-emerald-500' : 'bg-stone-600'
                }`}
                aria-label={day.open ? `${DAYS_TR[i]} açık` : `${DAYS_TR[i]} kapalı`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    day.open ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>

              <span className={`text-xs font-medium ${day.open ? 'text-emerald-400' : 'text-stone-500'}`}>
                {day.open ? 'Açık' : 'Kapalı'}
              </span>

              {/* Saat inputları */}
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="time"
                  name={`day_${key}_start`}
                  value={day.start}
                  onChange={(e) => updateDayTime(i, 'start', e.target.value)}
                  disabled={!day.open}
                  className={`bg-stone-900 border rounded-lg px-3 py-2 text-xs text-white outline-none transition-all ${
                    !day.open
                      ? 'border-stone-700 text-stone-600 opacity-40 cursor-not-allowed'
                      : startErr
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-stone-700 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373]'
                  }`}
                />
                <span className={`text-xs ${day.open ? 'text-stone-500' : 'text-stone-700'}`}>—</span>
                <input
                  type="time"
                  name={`day_${key}_end`}
                  value={day.end}
                  onChange={(e) => updateDayTime(i, 'end', e.target.value)}
                  disabled={!day.open}
                  className={`bg-stone-900 border rounded-lg px-3 py-2 text-xs text-white outline-none transition-all ${
                    !day.open
                      ? 'border-stone-700 text-stone-600 opacity-40 cursor-not-allowed'
                      : endErr
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-stone-700 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373]'
                  }`}
                />
              </div>

              {/* Hata mesajı */}
              {(startErr || endErr) && (
                <p className="text-red-400 text-xs w-full mt-1 ml-28">{startErr || endErr}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Submit butonu */}
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
