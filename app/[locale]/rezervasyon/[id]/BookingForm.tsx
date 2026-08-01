'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useToast } from '@/components/ui/Toast'
import { motion, AnimatePresence } from 'motion/react'
import {
  Check, ArrowLeft, ArrowRight,
  Building2, Calendar, Clock, Users, MapPin, User, Phone, Mail,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import InteractiveFloorMap from '@/components/InteractiveFloorMap'
import type { TableLayout } from '@/components/InteractiveFloorMap'
import { ZONE_THEME_LABELS, ZONE_THEME_BG } from '@/src/types/kroki-zone'
import type { ZoneTheme, ZonePoint } from '@/src/types/kroki-zone'

type Hizmet     = { id: string; name: string; duration_minutes: number; price: number | null }
type Calisan    = { id: string; name: string; title: string | null }
type FloorTable = { id: string; label: string; capacity: number; area_id: string | null; x: number; y: number; width: number; height: number; shape: 'rect' | 'circle'; rotation: number }
type SpecialArea = { id: string; name: string; color: string | null }

// Adaptör: FloorTable → TableLayout (InteractiveFloorMap'in beklediği format)
// grid_x / grid_y'yi piksel koordinatlardan yaklaşık olarak hesaplar
function toTableLayouts(tables: FloorTable[], zone: string): TableLayout[] {
  if (!tables.length) {
    // Veri yoksa varsayılan test masaları oluştur
    return Array.from({ length: 8 }, (_, i) => ({
      id:     `test-${i}`,
      label:  `Masa ${i + 1}`,
      shape:  i % 3 === 1 ? 'round' as const : 'square' as const,
      x:      (i % 3) * 4 + 1,
      y:      Math.floor(i / 3) * 3 + 1,
      seats:  i % 2 === 0 ? 4 : 2,
      zone:   zone,
      status: (i === 4 || i === 7) ? 'occupied' as const : 'available' as const,
    }))
  }
  return tables.map(t => ({
    id:     t.id,
    label:  t.label,
    shape:  t.shape === 'circle' ? 'round' : 'square',
    x:      Math.round(t.x / 40) || 1,   // piksel → izometrik grid (yaklaşık)
    y:      Math.round(t.y / 40) || 1,
    seats:  t.capacity,
    zone:   zone,
    status: 'available',                 // BookingForm occupied durumunu kendisi yönetir
  }))
}

interface Props {
  businessId:       string
  businessName:     string
  businessType:     string
  businessAddress:  string | null
  hizmetler:        Hizmet[]
  calisanlar:       Calisan[]
  floorPlanEnabled: boolean
  floorTables:      FloorTable[]
  specialAreas:     SpecialArea[]
  krokiMode:        string
  krokiZones:       Record<string, unknown>[]
  // DB format: { monday: { start: string; end: string; open: boolean }, ... }
  workingHours:     Record<string, Record<string, unknown>> | null
  occupiedZoneIds:  string[]
}

// Fallback slot listesi (working_hours yoksa 09:00-22:00)
function makeDefaultSlots(): string[] {
  const slots: string[] = []
  for (let m = 9 * 60; m < 22 * 60; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return slots
}
const DEFAULT_SLOTS = makeDefaultSlots()

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
  businessId, businessName, businessType, businessAddress,
  hizmetler, calisanlar,
  floorPlanEnabled, floorTables, specialAreas,
  krokiMode, krokiZones, workingHours, occupiedZoneIds,
}: Props) {
  const router = useRouter()
  const t = useTranslations('bookingForm')
  const r = useTranslations('rezervasyon')
  const locale = useLocale()
  const toast = useToast()
  const isRestaurant = businessType === 'restaurant' || businessType === 'other'
  const isServiceBased = !isRestaurant
  const isPilates = businessType === 'pilates'

  const allSteps = isPilates
    ? ['tarih', 'saat', 'bilgi', 'ozet', 'basari'] as const
    : isRestaurant
      ? floorPlanEnabled
        ? ['kisi', 'tarih', 'saat', 'masa', 'bilgi', 'ozet', 'basari'] as const
        : ['kisi', 'tarih', 'saat', 'bilgi', 'ozet', 'basari'] as const
      : ['hizmet', 'calisan', 'tarih', 'saat', 'bilgi', 'ozet', 'basari'] as const
  const [step, setStep] = useState(0)

  // Form state
  const [partySize, setPartySize] = useState(2)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  // W-100: working_hours'dan slot üretimi (seçilen güne göre)
  // DB formatı: { monday: { start: "HH:MM", end: "HH:MM", open: boolean }, ... }
  // JS getDay(): 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  const DAY_KEY_MAP: Record<number, string> = {
    0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
    4: 'thursday', 5: 'friday', 6: 'saturday',
  }
  const TIME_SLOTS = useMemo<string[]>(() => {
    if (!workingHours || !selectedDate) return DEFAULT_SLOTS
    const dow = new Date(selectedDate + 'T12:00:00').getDay()
    const dayKey = DAY_KEY_MAP[dow]
    const wh = workingHours[dayKey]
    // Gün tanımlanmamışsa veya açıkça open===false ise
    // wh yoksa (working_hours boş/gün eksik) → fallback varsayılan slot'lar
    if (!wh) return DEFAULT_SLOTS
    if (wh.open === false) return []  // kapalı gün → boş array, UI mesaj gösterir
    // Alan adları: DB'de start/end olarak, eski formatta open/close olabilir
    const rec = wh as Record<string, unknown>
    const startStr = typeof rec.start === 'string' ? rec.start : typeof wh.open === 'string' ? wh.open : null
    const endStr = typeof rec.end === 'string' ? rec.end : typeof wh.close === 'string' ? wh.close : null
    if (!startStr || !endStr) return DEFAULT_SLOTS
    const [openH, openM] = startStr.split(':').map(Number)
    const [closeH, closeM] = endStr.split(':').map(Number)
    const openTotal = openH * 60 + (openM ?? 0)
    let closeTotal = closeH * 60 + (closeM ?? 0)
    // Gece yarısı: 00:00 = 24:00 (ertesi güne sarkan kapanış)
    if (closeTotal === 0) closeTotal = 24 * 60
    // Diğer gece yarısı geçişleri (ör: 02:00 → ertesi gün)
    if (closeTotal > 0 && closeTotal <= openTotal) closeTotal += 24 * 60
    if (closeTotal <= openTotal) return DEFAULT_SLOTS
    // Buffer mantığı: restoran/kafe (masa rezervasyonu) kapanış saatini dahil eder
    // Restoran/kafe (masa rezervasyonu): kapanış saatinin son dakikasına kadar slot üret
    // Randevu bazlı işletmeler (kuaför, berber, pilates, spa, klinik): kapanıştan 30 dk önce kes
    const bufferMinutes = isRestaurant ? 0 : 30
    const slots: string[] = []
    for (let m = openTotal; m <= closeTotal - bufferMinutes; m += 30) {
      const h = Math.floor(m / 60) % 24
      const mm = m % 60
      // 00:00 (gece yarısı) slotu atla — son slot 23:30
      if (h === 0 && mm === 0) continue
      slots.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
    }
    return slots
  }, [workingHours, selectedDate, businessType])

  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<string | null>('__any__')
  const [selectedArea, setSelectedArea] = useState<string | null>(
    specialAreas.length > 0 ? specialAreas[0].id : null
  )
  const [selectedZone, setSelectedZone] = useState<{
    id: string; name: string; color: string; capacity: number;
    tableCount: number; theme: ZoneTheme; polygon: ZonePoint[]; customPhoto?: string | null
  } | null>(null)
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

  // Fetch occupied slots — staff/service bazlı filtreleme
  useEffect(() => {
    if (!selectedDate || !businessId) return
    const params = new URLSearchParams({ business_id: businessId, date: selectedDate })
    if (selectedStaff && selectedStaff !== '__any__') params.set('staff_id', selectedStaff)
    if (selectedService) params.set('service_id', selectedService)
    fetch(`/api/rezervasyon/musait?${params.toString()}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.times) setOccupiedSlots(new Set(json.times)) })
      .catch(() => {
        // Müsaitlik API'sine ulaşılamadı — slotlar güncel olmayabilir.
        // DB katmanındaki unique constraint çift rezervasyona karşı korumaya devam eder.
        toast.show('Müsaitlik bilgisi yüklenemedi. Seçiminiz kaydedilirken kontrol edilecek.', 'error')
      })
  }, [selectedDate, businessId, selectedStaff, selectedService])

  // W-101: Zone modunda ilk bölgeyi varsayılan seç
  const autoZoneRef = useRef(false)
  useEffect(() => {
    if (!autoZoneRef.current && krokiMode === 'zones' && Array.isArray(krokiZones) && krokiZones.length > 0) {
      const first = krokiZones[0] as { id: string; name: string; color: string; capacity: number; tableCount: number; theme: ZoneTheme; polygon: ZonePoint[]; customPhoto?: string | null }
      setSelectedZone(first)
      setSelectedArea(first.id)
      autoZoneRef.current = true
    }
  }, [krokiMode, krokiZones])

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

  const canProceed = (() => {
    const s = allSteps[step]
    if (s === 'kisi')    return partySize >= 1 && partySize <= 20
    if (s === 'hizmet')  return hizmetler.length > 0 && selectedService !== null
    if (s === 'calisan') return true
    if (s === 'tarih')   return !!selectedDate
    if (s === 'saat')    return TIME_SLOTS.length > 0 && !!selectedTime
    if (s === 'masa')    return true
    if (s === 'bilgi')   return !!(name.trim() && phone.trim())
    return true
  })()

  // Submit — HATA 2: UUID validation
  async function handleSubmit() {
    if (!privacyAccepted) { setPrivacyError(true); return }
    setError(null)
    setLoading(true)

    const safeTableId = selectedTable && UUID_RE.test(selectedTable) ? selectedTable : undefined
    // Zone bilgisi (kroki_mode='zones')
    const selectedZoneName = krokiMode === 'zones' && selectedArea
      ? krokiZones.find((z: Record<string, unknown>) => z.id === selectedArea)?.name as string ?? null
      : null

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
        service_id:       selectedService ?? undefined,
        staff_id:         (selectedStaff && selectedStaff !== '__any__') ? selectedStaff : undefined,
        special_requests: specialNotes || undefined,
        zone_id:          krokiMode === 'zones' ? (selectedArea ?? undefined) : undefined,
        zone_name:        selectedZoneName,
      }),
    })
    setLoading(false)

    if (!res.ok) {
      const json = await res.json()
      const errMsg = json.error ?? r('hata.genel')
      setError(errMsg)
      toast.show(errMsg, 'error')
      return
    }

    const data = await res.json()
    setSuccessData({ id: data.id ?? generateReservationId() })
    setStep(allSteps.length - 1)
    toast.show('Rezervasyonunuz başarıyla alındı!', 'success')
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
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(2024, 0, 1 + i) // Pazartesi başlangıç (1 Jan 2024 = Pzt)
            return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).slice(0, 2)
          }).map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-zinc-400 py-2">{d}</div>
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

  const renderTimeSlots = () => {
    const isClosed = TIME_SLOTS.length === 0
    return (
      <div>
        {isClosed ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-3">🔒</div>
            <p className="text-zinc-800 font-semibold text-base mb-1">Bu gün için rezervasyon alınmamaktadır</p>
            <p className="text-zinc-400 text-sm">Lütfen başka bir tarih seçiniz.</p>
          </div>
        ) : (
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
                    ${sel ? 'bg-[#E53935] border-[#E53935] text-white shadow-md shadow-red-200' : occ ? 'bg-red-50 border-red-200 text-red-400 line-through cursor-not-allowed' : 'bg-green-50 border-green-200 text-green-700 hover:border-green-400 hover:bg-green-100'}`}
                >
                  {slot}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderMasaSelect = () => {
    // W-100: kroki_mode === 'zones' ise ZoneViewer (kart listesi), 'tables' ise InteractiveFloorMap
    const isZoneMode = krokiMode === 'zones' && Array.isArray(krokiZones) && krokiZones.length > 0

    if (isZoneMode) {
      const zones = krokiZones as Array<{
        id: string; name: string; color: string; capacity: number;
        tableCount: number; theme: ZoneTheme; polygon: ZonePoint[]; customPhoto?: string | null
      }>

      const handleZoneSelect = (zone: typeof zones[number] | null) => {
        setSelectedArea(zone?.id ?? null)
        if (!zone) setSelectedTable(null)
      }

      return (
        /* ZONE SEÇİM BLOĞU — W-101 */
        <div className="flex flex-col gap-3">

          {/* Başlık */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#8B6914]">Bölge Seçin</span>
            <span className="text-xs text-gray-400">(isteğe bağlı)</span>
          </div>

          {/* Pill Tab Bar — üstte yatay scroll */}
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`flex-none px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                  selectedZone?.id === zone.id
                    ? 'bg-[#E53935] text-white font-semibold shadow-md border-[#E53935]'
                    : 'border-gray-200 text-gray-600 hover:border-[#E53935] hover:text-[#E53935]'
                }`}
              >
                {zone.name}
              </button>
            ))}
          </div>

          {/* Görsel Alan */}
          {selectedZone ? (
            <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                {(() => {
                  const zoneImg = selectedZone.customPhoto ?? ZONE_THEME_BG[selectedZone.theme] ?? '/images/kroki/ic_mekan.jpg'
                  return (
                    <img
                      src={zoneImg}
                      alt={selectedZone.name}
                      loading="eager"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )
                })()} 
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Overlay bilgi + seç butonu */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{selectedZone.name}</h3>
                    <p className="text-sm text-white/80 mt-0.5">
                      {selectedZone.theme ? `${ZONE_THEME_LABELS[selectedZone.theme]} · ` : ''}{selectedZone.capacity} kişi
                    </p>
                  </div>
                  <button
                    onClick={() => handleZoneSelect(selectedZone)}
                    className="bg-[#E53935] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#C62828] transition-all active:scale-95 shadow-lg"
                  >
                    Seç
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Seçilmemiş state — temiz placeholder */
            <div
              className="w-full rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center"
              style={{ aspectRatio: '16/9' }}
            >
              <div className="text-center text-gray-400 p-6">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Yukarıdan bir bölge seçin</p>
                <p className="text-xs mt-1 opacity-70">Fotoğraf ve detayları göreceksiniz</p>
              </div>
            </div>
          )}

          {/* Fark etmez butonu */}
          <button
            onClick={() => { handleZoneSelect(null); setSelectedZone(null) }}
            className="w-full py-3 rounded-xl text-sm text-center text-gray-500 border border-dashed border-gray-300 hover:border-[#E53935] hover:text-[#E53935] transition-all font-medium"
          >
            ↩ Fark etmez — herhangi bir bölge
          </button>

        </div>
        /* ZONE SEÇİM BLOĞU SONU */
      )
    }

    // ─── 'tables' modu (mevcut InteractiveFloorMap) ────────────────────────
    if (!floorTables.length) {
      return (
        <div className="text-center py-10 text-zinc-400">
          <p className="text-sm">{r('adim.masa.masaTipiYok')}</p>
        </div>
      )
    }

    // tables modunda: area'ları floorTables'daki unique area_id'lerden türet
    // zones modunda: specialAreas kullan (ZoneViewer zaten ayrı branch'te)
    const uniqueAreaIds = Array.from(new Set(floorTables.map(t => t.area_id).filter(Boolean)))
    const areas = uniqueAreaIds.length > 0
      ? uniqueAreaIds.map(aid => ({ id: aid!, name: aid!, color: null }))
      : []
    const areaTables = selectedArea
      ? floorTables.filter(t => t.area_id === selectedArea)
      : floorTables

    return (
      <div>
        <p className="text-sm text-zinc-500 mb-4">{r('adim.masa.opsiyonel')}</p>

        {/* Area tabs */}
        {areas.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {areas.map(a => {
              const count = floorTables.filter(t => t.area_id === a.id).length
              return (
                <button
                  key={a.id}
                  onClick={() => { setSelectedArea(a.id); setSelectedTable(null) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    selectedArea === a.id
                      ? 'bg-[#E53935] text-white border-[#E53935]'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-[#E53935] hover:text-[#E53935]'
                  }`}
                >
                  {a.color && (
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: a.color }} />
                  )}
                  {a.name}
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Floor plan canvas — izometrik InteractiveFloorMap */}
        <InteractiveFloorMap
          tables={toTableLayouts(areaTables, selectedArea ?? 'salon')}
          selectedId={selectedTable}
          onSelect={setSelectedTable}
          businessType={businessType}
          areas={specialAreas}
        />

        {/* Skip button */}
        <div className="flex justify-center mt-4">
          {!selectedTable && (
            <button
              onClick={() => goNext()}
              className="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2 transition-colors"
            >
              {r('adim.masa.opsiyonel')} — {r('step.atla')}
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderHizmetSelect = () => (
    <div className="space-y-3">
      {hizmetler.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-zinc-800 font-semibold text-base mb-1">Henüz hizmet tanımlanmamış</p>
          <p className="text-zinc-400 text-sm">Bu işletme şu anda online rezervasyon almıyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {hizmetler.map(h => {
            const sel = selectedService === h.id
            return (
              <motion.button
                key={h.id}
                onClick={() => setSelectedService(sel ? null : h.id)}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all
                  ${sel
                    ? 'border-[#E53935] bg-red-50 shadow-md shadow-red-100'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'}`}
              >
                <div>
                  <p className={`font-bold text-sm ${sel ? 'text-[#E53935]' : 'text-zinc-900'}`}>
                    {h.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {h.price != null && (
                      <span className="text-xs font-semibold text-zinc-500">
                        {r('adim.hizmet.fiyat')}: {h.price} ₺
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">
                      {r('adim.hizmet.sure')}: {h.duration_minutes} {r('adim.hizmet.dk')}
                    </span>
                  </div>
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
      )}
    </div>
  )

  const renderCalisanSelect = () => (
    <div className="space-y-3">
      <button
        onClick={() => setSelectedStaff(selectedStaff === null ? '__any__' : null)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
          selectedStaff === '__any__'
            ? 'border-[#E53935] bg-red-50 shadow-md shadow-red-100'
            : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
        }`}
      >
        <div>
          <p className={`font-bold text-sm ${selectedStaff === '__any__' ? 'text-[#E53935]' : 'text-zinc-900'}`}>
            {r('adim.calisan.farkEtmez')}
          </p>
        </div>
        {selectedStaff === '__any__' && (
          <div className="w-6 h-6 rounded-full bg-[#E53935] text-white flex items-center justify-center shrink-0">
            <Check size={14} strokeWidth={3} />
          </div>
        )}
      </button>
      {calisanlar.map(c => {
        const sel = selectedStaff === c.id
        return (
          <motion.button
            key={c.id}
            onClick={() => setSelectedStaff(sel ? null : c.id)}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all
              ${sel
                ? 'border-[#E53935] bg-red-50 shadow-md shadow-red-100'
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={`font-bold text-sm ${sel ? 'text-[#E53935]' : 'text-zinc-900'}`}>
                  {c.name}
                </p>
                {c.title && (
                  <span className="text-xs text-zinc-400">{c.title}</span>
                )}
              </div>
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
  )

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

  const renderSummary = () => {
    const masaLabel = selectedTable
      ? floorTables.find(t => t.id === selectedTable)?.label ?? null
      : null
    const hizmetLabel = selectedService
      ? hizmetler.find(h => h.id === selectedService)?.name ?? null
      : null
    const calisanLabel = selectedStaff && selectedStaff !== '__any__'
      ? calisanlar.find(c => c.id === selectedStaff)?.name ?? null
      : selectedStaff === '__any__' ? r('adim.calisan.farkEtmez') : null

    return (
      <div className="space-y-5">
        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 space-y-3">
          <SummaryRow icon={Building2} label={r('adim.ozet.isletme')} value={businessName} />
          {isServiceBased && hizmetLabel && (
            <SummaryRow icon={Building2} label={r('adim.ozet.hizmet')} value={hizmetLabel} />
          )}
          {isServiceBased && calisanLabel && (
            <SummaryRow icon={User} label={r('adim.ozet.calisan')} value={calisanLabel} />
          )}
          <SummaryRow icon={Calendar} label={r('adim.ozet.tarih')} value={selectedDate} />
          <SummaryRow icon={Clock}    label={r('adim.ozet.saat')}  value={selectedTime} />
          {isRestaurant && (
            <SummaryRow icon={Users} label={r('adim.ozet.kisi')} value={`${partySize} ${r('adim.kisi.kisi')}`} />
          )}
          {isRestaurant && masaLabel && (
            <SummaryRow icon={MapPin} label={r('adim.ozet.masa')} value={masaLabel} />
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
    const mapsUrl = businessAddress
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(businessAddress)}`
      : null

    return (
      <div className="text-center py-8 px-4 rounded-2xl bg-gradient-to-b from-red-50 via-white to-white">
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
            {r('adim.basari.idKart')}: <span className="tracking-wider">{rezId}</span>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 max-w-xs mx-auto mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">{r('adim.ozet.isletme')}</span>
              <span className="font-semibold text-zinc-900">{businessName}</span>
            </div>
            {isServiceBased && selectedService && (
              <div className="flex justify-between">
                <span className="text-zinc-400">{r('adim.ozet.hizmet')}</span>
                <span className="font-semibold text-zinc-900">{hizmetler.find(h => h.id === selectedService)?.name}</span>
              </div>
            )}
            {isServiceBased && selectedStaff && (
              <div className="flex justify-between">
                <span className="text-zinc-400">{r('adim.ozet.calisan')}</span>
                <span className="font-semibold text-zinc-900">{selectedStaff === '__any__' ? r('adim.calisan.farkEtmez') : (calisanlar.find(c => c.id === selectedStaff)?.name ?? '')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-400">{r('adim.ozet.tarih')}</span>
              <span className="font-semibold text-zinc-900">{formatDateTR(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{r('adim.ozet.saat')}</span>
              <span className="font-semibold text-zinc-900">{selectedTime}</span>
            </div>
            {isRestaurant && (
              <div className="flex justify-between">
                <span className="text-zinc-400">{r('adim.ozet.kisi')}</span>
                <span className="font-semibold text-zinc-900">{partySize} {r('adim.kisi.kisi')}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/rezervasyonlarim')}
              className="rounded-full bg-zinc-900 text-white px-6 py-2.5 text-sm font-bold hover:bg-zinc-700 transition-colors"
            >
              {r('adim.basari.rezervasyonlarim')}
            </button>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 text-zinc-700 px-6 py-2.5 text-sm font-bold hover:bg-zinc-50 transition-colors"
              >
                <MapPin size={16} />
                {r('adim.basari.yolTarifi')}
              </a>
            )}
            <button
              onClick={() => router.push('/')}
              className="rounded-full text-zinc-400 px-6 py-2.5 text-sm font-semibold hover:text-zinc-700 transition-colors"
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
          {allSteps[step] === 'kisi'    && renderPartySize()}
          {allSteps[step] === 'hizmet'  && renderHizmetSelect()}
          {allSteps[step] === 'calisan' && renderCalisanSelect()}
          {allSteps[step] === 'tarih'   && renderCalendar()}
          {allSteps[step] === 'saat'    && renderTimeSlots()}
          {allSteps[step] === 'masa'    && renderMasaSelect()}
          {allSteps[step] === 'bilgi'   && renderInfoForm()}
          {allSteps[step] === 'ozet'    && renderSummary()}
          {allSteps[step] === 'basari'  && renderSuccess()}
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
