'use client'

import { useActionState, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createReservation, type ActionState } from './actions'
import { type BusinessType } from '@/types'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { useAvailability } from './useAvailability'

const initialState: ActionState = {
  success: false,
  error: null,
  guestName: null,
}

const PARTY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]
const DAYS_KEYS = ['daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat']

function getDates(today: string, tomorrow: string, dayLabels: string[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      label: i === 0 ? today : i === 1 ? tomorrow : dayLabels[d.getDay()],
      day: d.getDate(),
      value: d.toISOString().split('T')[0],
    }
  })
}

const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
  const totalMin = 9 * 60 + i * 30
  const h = Math.floor(totalMin / 60).toString().padStart(2, '0')
  const m = (totalMin % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})

type Service    = { id: string; name: string; duration_minutes: number; price: number | null; currency: string }
type StaffMember = { id: string; name: string; title: string | null }
type MasaTipi   = { id: string; ad: string; ad_en: string | null; ad_ar: string | null; ad_de: string | null; ad_da: string | null; ad_es: string | null; ad_ru: string | null; kapasite: number }

function getMasaAd(m: MasaTipi, locale: string): string {
  const key = `ad_${locale}` as keyof MasaTipi
  return (m[key] as string | null) || m.ad
}

export function ReservationForm({
  restaurantId,
  restaurantName,
  businessType = 'restaurant',
  services = [],
  staff = [],
  masaTipleri = [],
}: {
  restaurantId:   string
  restaurantName: string
  businessType?:  BusinessType
  services?:      Service[]
  staff?:         StaffMember[]
  masaTipleri?:   MasaTipi[]
}) {
  const t      = useTranslations('reservationForm')
  const tTerms = useTranslations('bookingTerms')
  const locale = useLocale()
  const boundAction = createReservation.bind(null, restaurantId)
  const [state, formAction, pending] = useActionState(boundAction, initialState)

  const dayLabels = DAYS_KEYS.map(k => t(k as Parameters<typeof t>[0]))
  const dates = getDates(t('today'), t('tomorrow'), dayLabels)
  const [selectedDate, setSelectedDate]       = useState(dates[0].value)
  const [selectedTime, setSelectedTime]       = useState('')
  const [selectedParty, setSelectedParty]     = useState(2)
  const [selectedService, setSelectedService] = useState<string>(services[0]?.id ?? '')
  const [selectedStaff, setSelectedStaff]     = useState<string>('')
  const [selectedMasa, setSelectedMasa]       = useState<string | null>(null)
  const [showNotes, setShowNotes]             = useState(false)
  const [guestName,  setGuestName]            = useState('')
  const [guestPhone, setGuestPhone]           = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const { busyTimes, loading: availabilityLoading, isBusy } = useAvailability(restaurantId, selectedDate)

  const term             = tTerms(businessType as Parameters<typeof tTerms>[0])
  const isRestaurant     = businessType === 'restaurant'
  const hasServices      = services.length > 0
  const hasStaff         = staff.length > 0
  const showStaff        = hasStaff && !isRestaurant
  const ROOM_TYPES       = new Set(['spa', 'pilates', 'fitness', 'chiropractor', 'psychologist', 'dentist'])
  const showRooms        = masaTipleri.length > 0 && (isRestaurant || ROOM_TYPES.has(businessType))
  const roomLabel        = isRestaurant ? t('tableType') : 'Oda / Kabin'

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">{t('successTitle', { term: term })}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {t('successGreeting', { name: state.guestName ?? '' })}<br />
            {restaurantName} {t('successWaiting')}
          </p>
        </div>
        <div className="w-full rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-800">
          {t('successWhatsapp')}
        </div>
        <button
          type="button"
          onClick={() => {
            formRef.current?.reset()
            setSelectedTime('')
            setGuestName('')
            setGuestPhone('')
          }}
          className="text-sm text-stone-400 underline underline-offset-2"
        >
          {t('newBooking', { term: term.toLowerCase() })}
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6">
      {/* Hidden inputs */}
      <input type="hidden" name="reserved_date" value={selectedDate} />
      <input type="hidden" name="reserved_time" value={selectedTime} />
      <input type="hidden" name="party_size" value={isRestaurant ? selectedParty : 1} />
      {selectedMasa && <input type="hidden" name="masa_tipi_id" value={selectedMasa} />}

      {/* Hizmet Seçimi — restoran dışı sektörler için */}
      {hasServices && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-700">{t('selectService')}</label>
          <div className="flex flex-col gap-2">
            {services.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedService(s.id)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
                  selectedService === s.id
                    ? 'border-amber-400 bg-amber-50 text-amber-800 font-medium'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span>{s.name}</span>
                <span className="text-xs text-stone-400 flex items-center gap-2">
                  {s.duration_minutes} {t('min')}
                  {s.price != null && (
                    <span className={selectedService === s.id ? 'text-amber-600 font-semibold' : ''}>
                      {s.price.toLocaleString('tr-TR')} {s.currency}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" name="service_id" value={selectedService} />
        </div>
      )}

      {/* Personel Seçimi — restoranda gizli */}
      {showStaff && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-700">
            {t('selectStaff')} <span className="text-stone-400 font-normal">({t('optional')})</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedStaff('')}
              className={`rounded-xl border px-3 py-2 text-sm transition-all ${
                selectedStaff === ''
                  ? 'border-amber-400 bg-amber-50 text-amber-800 font-medium'
                  : 'border-stone-200 text-stone-500 hover:border-stone-300'
              }`}
            >
              {t('noPreference')}
            </button>
            {staff.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStaff(s.id)}
                className={`rounded-xl border px-3 py-2 text-sm transition-all ${
                  selectedStaff === s.id
                    ? 'border-amber-400 bg-amber-50 text-amber-800 font-medium'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                <span>{s.name}</span>
                {s.title && <span className="text-xs text-stone-400 ml-1">· {s.title}</span>}
              </button>
            ))}
          </div>
          <input type="hidden" name="staff_id" value={selectedStaff} />
        </div>
      )}

      {/* Tarih Seçici */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-stone-700">{t('selectDate')}</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => setSelectedDate(d.value)}
              className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-colors ${
                selectedDate === d.value
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
              }`}
            >
              <span className="text-xs font-normal opacity-80">{d.label}</span>
              <span className="text-lg font-extrabold">{d.day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Saat Seçici */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
          {t('selectTime')}
          {availabilityLoading && (
            <span className="inline-flex items-center gap-1 text-xs text-stone-400 font-normal">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Müsaitlik sorgulanıyor...
            </span>
          )}
          {!availabilityLoading && busyTimes.length > 0 && (
            <span className="text-xs text-stone-400 font-normal">
              ({busyTimes.length} doldu)
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map(slot => {
            const busy = isBusy(slot)
            return (
              <button
                key={slot}
                type="button"
                onClick={() => !busy && setSelectedTime(slot)}
                disabled={busy}
                title={busy ? 'Bu saat doludur' : undefined}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  selectedTime === slot
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : busy
                      ? 'bg-red-50 border-red-200 text-red-300 line-through cursor-not-allowed'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                }`}
              >
                {slot}
              </button>
            )
          })}
        </div>
      </div>

      {/* Masa / Oda / Kabin — restoran, spa, pilates, klinik */}
      {showRooms && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-700">
            {roomLabel} <span className="text-stone-400 font-normal">({t('optional')})</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {masaTipleri.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMasa(selectedMasa === m.id ? null : m.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  selectedMasa === m.id
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'
                }`}
              >
                <p className="font-semibold text-sm">{getMasaAd(m, locale)}</p>
                <p className="text-xs opacity-70 mt-0.5">{t('maxPeople', { count: m.kapasite })}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ad Soyad */}
      <FloatingInput
        id="guest_name"
        name="guest_name"
        type="text"
        required
        autoComplete="name"
        label={t('fullName')}
        value={guestName}
        onChange={e => setGuestName(e.target.value)}
      />

      {/* Telefon */}
      <FloatingInput
        id="guest_phone"
        name="guest_phone"
        type="tel"
        required
        autoComplete="tel"
        inputMode="tel"
        label={t('phone')}
        value={guestPhone}
        onChange={e => setGuestPhone(e.target.value)}
      />

      {/* Kişi Sayısı — sadece restoran için */}
      {isRestaurant && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-700">{t('partySize')}</label>
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
        </div>
      )}

      {/* Özel Not */}
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
          {showNotes ? t('removeNote') : t('addNote')}
        </button>
        {showNotes && (
          <textarea
            name="notes"
            rows={3}
            placeholder={
              isRestaurant
                ? t('notePlaceholderRestaurant')
                : t('notePlaceholderGeneral')
            }
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
          />
        )}
      </div>

      {/* KVKK Onayı */}
      <div className="flex items-start gap-3">
        <input
          id="kvkk_consent"
          name="kvkk_consent"
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400 focus:ring-2 shrink-0 cursor-pointer"
        />
        <label htmlFor="kvkk_consent" className="text-xs text-stone-500 leading-relaxed cursor-pointer select-none">
          <a href="/kvkk" target="_blank" className="text-amber-600 underline underline-offset-2 hover:text-amber-700 font-medium">KVKK Aydınlatma Metni</a>{' '}
          kapsamında, rezervasyon bilgilerimin ve iletişim verilerimin işlenmesine,
          rezervasyon onayı ve hatırlatma amacıyla SMS/email gönderilmesine izin veriyorum.
        </label>
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
        disabled={pending || !selectedTime}
        className="mt-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-amber-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:from-amber-400 hover:to-orange-400"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {t('submitting')}
          </span>
        ) : selectedTime ? (
          // VERTICAL FIX: bookingTerms zaten doğru terimi üretiyor
          // (psychologist→Seans, pilates→Ders, diğerleri→Randevu, restaurant→Rezervasyon).
          // Sabit 'Randevu Al' override'ı kaldırıldı — böylece her sektör kendi terimiyle CTA görür.
          t('submit', { term: term })
        ) : (
          t('selectTimeFirst')
        )}
      </button>

      <p className="text-center text-xs text-stone-400">
        {t('confirmNote', { term: term })}
      </p>
    </form>
  )
}

