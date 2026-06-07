'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'motion/react'
import {
  Check, ArrowLeft, ArrowRight,
  Building2, Calendar, Clock, Users, MapPin, User, Phone, Mail,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type MasaTipi = { id: string; ad: string; ad_en: string | null; ad_ar: string | null; ad_de: string | null; ad_da: string | null; ad_es: string | null; ad_ru: string | null; kapasite: number }
type Hizmet     = { id: string; name: string; duration_minutes: number; price: number | null }
type Calisan    = { id: string; name: string; title: string | null }
type FloorTable = { id: string; label: string; capacity: number; x: number; y: number; width: number; height: number; shape: 'rect' | 'circle' }

const FloorPlanPicker = dynamic(() => import('./FloorPlanPicker'), { ssr: false })

interface Props {
  businessId:       string
  businessName:     string
  businessType:     string
  masaTipleri:      MasaTipi[]
  hizmetler:        Hizmet[]
  calisanlar:       Calisan[]
  floorPlanEnabled: boolean
  floorTables:      FloorTable[]
}

const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
  const totalMin = 9 * 60 + i * 30
  const h = Math.floor(totalMin / 60).toString().padStart(2, '0')
  const m = (totalMin % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const TR_DAYS   = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

function generateReservationId(): string {
  const num = Math.floor(100000 + Math.random() * 900000)
  return `RZV${num}`
}

function formatDateTR(iso: string): string {
  if (!iso) return iso
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${d} ${TR_MONTHS[m - 1]} ${y}, ${TR_DAYS[date.getDay()]}`
}

export default function BookingForm({
  businessId, businessName, businessType,
  masaTipleri, hizmetler, calisanlar,
  floorPlanEnabled, floorTables,
}: Props) {
  const router = useRouter()
  const t = useTranslations('bookingForm')
  const r = useTranslations('rezervasyon')
  const locale = useLocale()
  const isRestaurant = businessType === 'restaurant' || businessType === 'other'

  // HATA 3: 'alan' adımı kaldırıldı
  const allSteps = isRestaurant
    ? ['kisi', 'tarih', 'saat', 'masa', 'bilgi', 'ozet', 'basari'] as const
    : ['kisi', 'tarih', 'saat', 'bilgi', 'ozet', 'basari'] as const
  const [step, setStep] = useState(0)

  // Form state
  const [partySize, setPartySize] = useState(2)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [specialNotes, setSpecialNotes] = useState('')

  // Booking state
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ id: string } | null>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [privacyError, setPrivacyError] = useState(false)

  // Calendar state
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())
  const maxDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 30)
    return d
  }, [today])

  // Prefill from auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email ?? '')
        setName(session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? '')
      }
    })
  }, [])

  // Fetch occupied slots
  useEffect(() => {
    if (!selectedDate || !businessId) return
    fetch(`/api/rezervasyon/musait?business_id=${businessId}&date=${selectedDate}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.times) setOccupiedSlots(new Set(json.times)) })
      .catch(() => {})
  }, [selectedDate, businessId])

  // Calendar helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay()
  const calDays: (Date | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calDays.push(new Date(calYear, calMonth, d))

  const isDateDisabled = useCallback((date: Date) => {
    const time = date.getTime()
    return time < today.getTime() || time > maxDate.getTime()
  }, [today, maxDate])

  const dateStr = (date: Date) => {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const canGoPrevMonth = calYear > today.getFullYear() || (calYear === today.getFullYear() && calMonth > today.getMonth())

  // Navigation
  function goNext() {
    if (step < allSteps.length - 1) setStep(s => s + 1)
  }
  function goBack() {
    if (step === 0) router.push('/rezervasyon')
    else setStep(s => s - 1)
  }

  // Validate current step — HATA 3: 'alan' case kaldırıldı, 'masa' opsiyonel
  const canProceed = (() => {
    const s = allSteps[step]
    if (s === 'kisi')  return partySize >= 1 && partySize <= 20
    if (s === 'tarih') return !!selectedDate
    if (s === 'saat')  return !!selectedTime
    if (s === 'masa')  return true
    if (s === 'bilgi') return !!(name.trim() && phone.trim())
    return true
  })()

  // Submit — HATA 2: UUID validation
  async function handleSubmit() {
    if (!privacyAccepted) { setPrivacyError(true); return }
    setError(null)
    setLoading(true)

    const safeTableId = selectedTable && UUID_RE.test(selectedTable) ? selectedTable : undefined

    const res = await fetch('/api/rezervasyon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id:    businessId,
        customer_name:    name,
        phone,
        email:            email || undefined,
        party_size:       partySize,
        date:             selectedDate,
        time:             selectedTime,
        table_id:         safeTableId,
        special_requests: specialNotes || undefined,
      }),
    })
    setLoading(false)

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? r('hata.genel'))
      return
    }

    const data = await res.json()
    setSuccessData({ id: data.id ?? generateReservationId() })
    setStep(allSteps.length - 1)
    import('canvas-confetti').then(m => {
      m.default({ particleCount: 140, spread: 90, origin: { y: 0.6 } })
    }).catch(() => {})
  }

  // ─── RENDER HELPERS ─────────────────────────────────────

  const stepProgress = () => {
    const displaySteps = allSteps.filter(s => s !== 'basari')
    const currentStep = allSteps[step]
    const displayIndex = displaySteps.indexOf(currentStep as (typeof displaySteps)[number])
    return (
      <div className="flex items-center mb-10">
        {displaySteps.map((s, i) => {
          const isActive = i === displayIndex
          const isDone = i < displayIndex
          const isLast = i === displaySteps.length - 1
          return (
            <div key={s} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all duration-300
                  ${isDone ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                    : isActive ? 'bg-[#E53935] text-white shadow-md shadow-red-200 ring-4 ring-red-100'
                    : 'bg-zinc-100 text-zinc-400'}`}
                >
                  {isDone ? <Check size={16} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`mt-1.5 text-[11px] font-semibold text-center leading-tight max-w-[72px] transition-colors duration-300
                  ${isActive ? 'text-[#E53935]' : isDone ? 'text-emerald-600' : 'text-zinc-400'}`}
                >
                  {r(`adim.${s}.baslik` as Parameters<typeof r>[0])}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-px mx-2 sm:mx-3 transition-colors duration-300
                  ${isDone ? 'bg-emerald-300' : 'bg-zinc-200'}`}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // HATA 1: showDevam parametresi kaldırıldı, navButtons sadece ozet dışı adımlarda çağrılır
  const navButtons = () => (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
      <button
        onClick={goBack}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
      >
        <ArrowLeft size={16} />
        {r('step.geri')}
      </button>
      <button
        onClick={goNext}
        disabled={!canProceed}
        className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all
          ${canProceed
            ? 'bg-[#E53935] hover:bg-[#C62828] text-white shadow-md shadow-red-200 hover:shadow-lg hover:-translate-y-0.5'
            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
      >
        {r('step.devam')}
        <ArrowRight size={16} />
      </button>
    </div>
  )

  // ─── STEPS ──────────────────────────────────────────────

  const renderPartySize = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="text-sm font-semibold text-zinc-500 mb-6 uppercase tracking-wide">
        {r('adim.kisi.baslik')}
      </p>
      <div className="flex items-center gap-8">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setPartySize(p => Math.max(1, p - 1))}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E53935] text-white text-3xl font-bold flex items-center justify-center shadow-lg shadow-red-200 hover:bg-[#C62828] transition-colors"
        >
          −
        </motion.button>
        <div className="text-center">
          <motion.span
            key={partySize}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl sm:text-7xl font-extrabold text-zinc-900 tabular-nums"
          >
            {partySize}
          </motion.span>
          <p className="text-sm text-zinc-400 mt-1">{r('adim.kisi.kisi')}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setPartySize(p => Math.min(20, p + 1))}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E53935] text-white text-3xl font-bold flex items-center justify-center shadow-lg shadow-red-200 hover:bg-[#C62828] transition-colors"
        >
          +
        </motion.button>
      </div>
      <div className="flex gap-1.5 mt-6">
        {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map(n => (
          <button
            key={n}
            onClick={() => setPartySize(n)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
              ${partySize === n ? 'bg-[#E53935] text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )

  const renderCalendar = () => {
    const monthLabel = locale === 'tr'
      ? `${TR_MONTHS[calMonth]} ${calYear}`
      : new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(calYear, calMonth))

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            disabled={!canGoPrevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          <p className="font-bold text-zinc-900">{monthLabel}</p>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-zinc-400 py-2">{d}</div>
          ))}
          {calDays.map((date, i) => {
            if (!date) return <div key={`e-${i}`} />
            const ds = dateStr(date)
            const disabled = isDateDisabled(date)
            const selected = ds === selectedDate
            const isToday = ds === dateStr(today)
            return (
              <button
                key={ds}
                onClick={() => !disabled && setSelectedDate(ds)}
                disabled={disabled}
                className={`relative w-full aspect-square rounded-full text-sm font-semibold transition-all
                  ${selected ? 'bg-[#E53935] text-white shadow-md shadow-red-200 scale-105' : disabled ? 'text-zinc-300 cursor-not-allowed' : isToday ? 'text-[#E53935] hover:bg-red-50' : 'text-zinc-700 hover:bg-zinc-100'}`}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTimeSlots = () => (
    <div className="grid grid-cols-4 gap-2">
      {TIME_SLOTS.map((slot, i) => {
        const occ = occupiedSlots.has(slot)
        const sel = selectedTime === slot
        return (
          <motion.button
            key={slot}
            type="button"
            disabled={occ}
            onClick={() => !occ && setSelectedTime(slot)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.015 }}
            whileHover={occ ? {} : { scale: 1.05 }}
            whileTap={occ ? {} : { scale: 0.9 }}
            className={`py-2.5 rounded-xl border text-sm font-semibold transition-all
              ${sel ? 'bg-[#E53935] border-[#E53935] text-white shadow-md shadow-red-200' : occ ? 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through cursor-not-allowed' : 'bg-white border-zinc-200 text-zinc-700 hover:border-[#E53935] hover:text-[#E53935]'}`}
          >
            {slot}
          </motion.button>
        )
      })}
    </div>
  )

  // HATA 3: Gerçek masaTipleri verisiyle masa seçimi
  const renderMasaSelect = () => {
    if (!isRestaurant) return null
    if (!masaTipleri.length) {
      return (
        <div className="text-center py-10 text-zinc-400">
          <p className="text-sm">{r('adim.masa.masaTipiYok')}</p>
        </div>
      )
    }
    return (
      <div>
        <p className="text-sm text-zinc-500 mb-5">{r('adim.masa.opsiyonel')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {masaTipleri.map(masa => {
            const insufficient = masa.kapasite < partySize
            const sel = selectedTable === masa.id
            return (
              <motion.button
                key={masa.id}
                onClick={() => !insufficient && setSelectedTable(sel ? null : masa.id)}
                disabled={insufficient}
                whileHover={insufficient ? {} : { y: -2, scale: 1.01 }}
                whileTap={insufficient ? {} : { scale: 0.98 }}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all
                  ${sel
                    ? 'border-[#E53935] bg-red-50 shadow-md shadow-red-100'
                    : insufficient
                      ? 'border-zinc-200 bg-zinc-50 cursor-not-allowed opacity-60'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'}`}
              >
                <div>
                  <p className={`font-bold text-sm ${sel ? 'text-[#E53935]' : 'text-zinc-900'}`}>
                    {masa.ad}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {r('adim.masa.kapasite')}: {masa.kapasite} {r('adim.kisi.kisi')}
                  </p>
                  {insufficient && (
                    <p className="text-xs text-amber-600 font-medium mt-1">
                      {r('adim.masa.yetersiz')}
                    </p>
                  )}
                </div>
                {sel && (
                  <div className="w-6 h-6 rounded-full bg-[#E53935] text-white flex items-center justify-center shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderInfoForm = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{r('adim.bilgi.adSoyad')} *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={r('adim.bilgi.adSoyadPlaceholder')}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{r('adim.bilgi.telefon')} *</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder={r('adim.bilgi.telefonPlaceholder')}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{r('adim.bilgi.eposta')}</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={r('adim.bilgi.epostaPlaceholder')}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{r('adim.bilgi.ozelNot')}</label>
        <textarea
          value={specialNotes}
          onChange={e => setSpecialNotes(e.target.value)}
          rows={3}
          placeholder={r('adim.bilgi.ozelNotPlaceholder')}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-red-100 transition-all resize-none"
        />
      </div>
    </div>
  )

  // HATA 4: Lucide ikonlar, HATA 3: masa tipi DB'den
  const renderSummary = () => {
    const masaTipiLabel = selectedTable
      ? masaTipleri.find(t => t.id === selectedTable)?.ad ?? null
      : null

    return (
      <div className="space-y-5">
        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-3">
          <SummaryRow icon={Building2} label={r('adim.ozet.isletme')} value={businessName} />
          <SummaryRow icon={Calendar}  label={r('adim.ozet.tarih')}   value={selectedDate} />
          <SummaryRow icon={Clock}     label={r('adim.ozet.saat')}    value={selectedTime} />
          <SummaryRow icon={Users}     label={r('adim.ozet.kisi')}    value={`${partySize} ${r('adim.kisi.kisi')}`} />
          {isRestaurant && masaTipiLabel && (
            <SummaryRow icon={MapPin} label={r('adim.ozet.masa')} value={masaTipiLabel} />
          )}
          <SummaryRow icon={User}  label={r('adim.bilgi.adSoyad')} value={name} />
          <SummaryRow icon={Phone} label={r('adim.bilgi.telefon')} value={phone} />
          {email && <SummaryRow icon={Mail} label={r('adim.bilgi.eposta')} value={email} />}
        </div>

        {specialNotes && (
          <div className="text-sm text-zinc-500 bg-amber-50 rounded-xl p-4 border border-amber-100">
            <span className="font-semibold text-amber-700">📝 {r('adim.bilgi.ozelNot')}:</span>
            <p className="mt-1">{specialNotes}</p>
          </div>
        )}

        {/* Privacy checkbox */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${privacyError && !privacyAccepted ? 'border-red-400 bg-red-50' : 'border-zinc-200 bg-zinc-50'}`}>
          <input
            type="checkbox"
            id="privacy"
            checked={privacyAccepted}
            onChange={e => { setPrivacyAccepted(e.target.checked); setPrivacyError(false) }}
            className="mt-0.5 accent-[#E53935] w-4 h-4 shrink-0 cursor-pointer"
          />
          <label htmlFor="privacy" className="text-sm text-zinc-700 cursor-pointer leading-relaxed">
            <button type="button" onClick={() => setPrivacyModalOpen(true)} className="text-[#E53935] font-semibold hover:underline">
              {r('gizlilik.baslik')}
            </button>
            {"'nı "}{r('gizlilik.kabul')}
          </label>
        </div>
        {privacyError && !privacyAccepted && (
          <p className="text-sm text-red-600">{r('gizlilik.hata')}</p>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <p className="text-center text-xs text-zinc-400">{r('adim.ozet.iptalNotu')}</p>
      </div>
    )
  }

  // HATA 5: Tarih Türkçe formatlanıyor
  const renderSuccess = () => {
    const rezId = successData?.id ?? generateReservationId()
    return (
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5"
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="w-10 h-10 stroke-green-600"
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <motion.path d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-zinc-900 mb-1">{r('adim.basari.mesaj')}</h2>

          <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-bold mt-3 mb-6">
            <span>🎫</span>
            {r('adim.basari.idKart')}: <span className="tracking-wider">{rezId}</span>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 max-w-xs mx-auto mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">{r('adim.ozet.isletme')}</span>
              <span className="font-semibold text-zinc-900">{businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{r('adim.ozet.tarih')}</span>
              <span className="font-semibold text-zinc-900">{formatDateTR(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{r('adim.ozet.saat')}</span>
              <span className="font-semibold text-zinc-900">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{r('adim.ozet.kisi')}</span>
              <span className="font-semibold text-zinc-900">{partySize} {r('adim.kisi.kisi')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/rezervasyonlarim')}
              className="rounded-full bg-zinc-900 text-white px-6 py-2.5 text-sm font-bold hover:bg-zinc-700 transition-colors"
            >
              {r('adim.basari.rezervasyonlarim')}
            </button>
            <button
              onClick={() => router.push('/')}
              className="rounded-full border border-zinc-200 text-zinc-700 px-6 py-2.5 text-sm font-bold hover:bg-zinc-50 transition-colors"
            >
              {r('adim.basari.anaSayfa')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── MAIN RENDER ────────────────────────────────────────

  return (
    <div>
      {/* Step progress bar (hidden on success) */}
      {allSteps[step] !== 'basari' && stepProgress()}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
          {allSteps[step] === 'kisi'   && renderPartySize()}
          {allSteps[step] === 'tarih'  && renderCalendar()}
          {allSteps[step] === 'saat'   && renderTimeSlots()}
          {allSteps[step] === 'masa'   && renderMasaSelect()}
          {allSteps[step] === 'bilgi'  && renderInfoForm()}
          {allSteps[step] === 'ozet'   && renderSummary()}
          {allSteps[step] === 'basari' && renderSuccess()}
        </motion.div>
      </AnimatePresence>

      {/* HATA 1: navButtons sadece ozet ve basari dışında gösterilir → çift Geri butonu yok */}
      {allSteps[step] !== 'basari' && allSteps[step] !== 'ozet' && navButtons()}

      {/* Özel: Özet adımında Geri + Rezervasyonu Tamamla */}
      {allSteps[step] === 'ozet' && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
          >
            <ArrowLeft size={16} />
            {r('step.geri')}
          </button>
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            className="px-8 py-3 rounded-full bg-[#E53935] hover:bg-[#C62828] disabled:opacity-60 text-white text-sm font-bold transition-all shadow-lg shadow-red-200"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                {t('submitting')}
              </span>
            ) : r('adim.ozet.tamamla')}
          </motion.button>
        </div>
      )}

      {/* Privacy Modal */}
      {privacyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setPrivacyModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">{r('gizlilik.modalBaslik')}</h2>
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 text-xl font-bold"
              >×</button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm text-zinc-600 leading-relaxed">
              <section>
                <h3 className="font-bold text-zinc-900 mb-2">1. Kişisel Verilerin İşlenmesi</h3>
                <p>CheckRezerve olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında kişisel verilerinizi toplar ve işleriz. Rezervasyon sürecinde sağladığınız ad, telefon ve e-posta bilgileriniz yalnızca hizmet sunumu amacıyla kullanılır. Verileriniz açık rızanız olmaksızın üçüncü taraflarla paylaşılmaz ve yurt dışına aktarılmaz.</p>
              </section>
              <section>
                <h3 className="font-bold text-zinc-900 mb-2">2. Rezervasyon Koşulları</h3>
                <p>Rezervasyonunuz, ilgili işletmenin onayı ile geçerlilik kazanır. Onay SMS veya e-posta yoluyla iletilir. İptal işlemleri, rezervasyon saatinden en az 2 saat önce yapılmalıdır. Belirtilen süre içinde iptal edilmeyen rezervasyonlar geçersiz sayılabilir.</p>
              </section>
              <section>
                <h3 className="font-bold text-zinc-900 mb-2">3. No-Show Politikası</h3>
                <p>Ön ödeme gerektiren rezervasyonlarda, belirlenen süre içinde iptal yapılmaması veya rezervasyona gelinmemesi (no-show) durumunda ödeme iadesi yapılmaz. İşletme tarafından belirlenen özel koşullar, rezervasyon onay mesajında ayrıca belirtilir.</p>
              </section>
              <section>
                <h3 className="font-bold text-zinc-900 mb-2">4. İletişim</h3>
                <p>Rezervasyon veya gizlilik konularında sorularınız için: <strong>destek@checkrezerve.com</strong></p>
              </section>
            </div>
            <div className="px-6 pb-6 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => { setPrivacyAccepted(true); setPrivacyModalOpen(false); setPrivacyError(false) }}
                className="w-full rounded-xl bg-[#E53935] hover:bg-[#C62828] text-white font-bold py-3 text-sm transition-colors"
              >
                {r('gizlilik.onayla')} ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// HATA 4: icon artık LucideIcon tipinde
function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500 flex items-center gap-2">
        <Icon size={15} className="text-zinc-400" strokeWidth={2} />
        {label}
      </span>
      <span className="text-sm font-semibold text-zinc-900">{value}</span>
    </div>
  )
}
