'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'motion/react'

type MasaTipi = { id: string; ad: string; ad_en: string | null; ad_ar: string | null; ad_de: string | null; ad_da: string | null; ad_es: string | null; ad_ru: string | null; kapasite: number }

function getMasaAd(m: MasaTipi, locale: string): string {
  const key = `ad_${locale}` as keyof MasaTipi
  return (m[key] as string | null) || m.ad
}
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

const DAYS_KEYS = ['daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat']

const SPECIAL_LABEL_KEYS: Record<string, string> = {
  restaurant:   'specialRequestRestaurant',
  psychologist: 'specialRequestPsych',
  spa:          'specialRequestSpa',
  hairdresser:  'specialRequestHairdresser',
  barber:       'specialRequestBarber',
  dentist:      'specialRequestDentist',
  default:      'specialRequestDefault',
}

const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
  const totalMin = 9 * 60 + i * 30
  const h = Math.floor(totalMin / 60).toString().padStart(2, '0')
  const m = (totalMin % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})

const BARBER_SERVICES = ['Saç Kesimi', 'Sakal', 'Saç + Sakal', 'Saç Boyama', 'Fön', 'Keratin', 'Komple Bakım']

export default function BookingForm({
  businessId, businessName, businessType,
  masaTipleri, hizmetler, calisanlar,
  floorPlanEnabled, floorTables,
}: Props) {
  const router = useRouter()
  const t = useTranslations('bookingForm')
  const locale = useLocale()

  const getDates = () => Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      label: i === 0 ? t('today') : i === 1 ? t('tomorrow') : t(DAYS_KEYS[d.getDay()] as Parameters<typeof t>[0]),
      day: d.getDate(),
      month: d.getMonth() + 1,
      value: d.toISOString().split('T')[0],
    }
  })

  const dates = getDates()

  const [selectedDate, setSelectedDate]       = useState(dates[0].value)
  const [selectedTime, setSelectedTime]       = useState('')
  const [selectedMasa, setSelectedMasa]       = useState<string | null>(null)
  const [selectedHizmet, setSelectedHizmet]   = useState<string | null>(null)
  const [selectedCalisan, setSelectedCalisan] = useState<string | null>(null)
  const [name, setName]                       = useState('')
  const [phone, setPhone]                     = useState('')
  const [partySize, setPartySize]             = useState('2')
  const [specialRequests, setSpecialRequests] = useState('')
  const [selectedTable, setSelectedTable]     = useState<string | null>(null)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [privacyError, setPrivacyError]       = useState(false)
  const [occupiedSlots, setOccupiedSlots]     = useState<Set<string>>(new Set())
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [success, setSuccess]                 = useState(false)

  // Type-specific fields
  const [occasion, setOccasion]           = useState('')  // restaurant
  const [sessionMode, setSessionMode]     = useState('')  // psychologist
  const [problemArea, setProblemArea]     = useState('')  // chiropractor
  const [visitReason, setVisitReason]     = useState('')  // dentist
  const [petType, setPetType]             = useState('')  // veterinary
  const [sessionFormat, setSessionFormat] = useState('')  // fitness/pilates
  const [sessionLevel, setSessionLevel]   = useState('')  // fitness/pilates
  const [selectedBarberServices, setSelectedBarberServices] = useState<string[]>([])  // barber/hairdresser

  useEffect(() => {
    if (!selectedDate || !businessId) return
    fetch(`/api/rezervasyon/musait?business_id=${businessId}&date=${selectedDate}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.times) setOccupiedSlots(new Set(json.times)) })
      .catch(() => {})
  }, [selectedDate, businessId])

  useEffect(() => {
    if (success) {
      import('canvas-confetti').then(m => {
        m.default({ particleCount: 140, spread: 90, origin: { y: 0.6 } })
      })
    }
  }, [success])

  const isRestaurant    = businessType === 'restaurant' || businessType === 'other'
  const isBarberType    = ['barber', 'hairdresser', 'beauty_salon'].includes(businessType)
  const hasServices     = hizmetler.length > 0 && !isRestaurant && !isBarberType
  const hasStaff        = calisanlar.length > 0 && !isRestaurant && !isBarberType
  const specialLabelKey = SPECIAL_LABEL_KEYS[businessType] ?? SPECIAL_LABEL_KEYS.default

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim() || !selectedDate || !selectedTime) {
      setError(t('requiredFields'))
      return
    }
    if (!privacyAccepted) {
      setPrivacyError(true)
      return
    }

    const typeExtras: string[] = []
    if (isBarberType && selectedBarberServices.length > 0) typeExtras.push(`[${selectedBarberServices.join(', ')}]`)
    if (occasion)      typeExtras.push(`[${occasion}]`)
    if (sessionMode)   typeExtras.push(`[${sessionMode}]`)
    if (problemArea)   typeExtras.push(`[${problemArea}]`)
    if (visitReason)   typeExtras.push(`[${visitReason}]`)
    if (petType)       typeExtras.push(`[${petType}]`)
    if (sessionFormat) typeExtras.push(`[${sessionFormat}]`)
    if (sessionLevel)  typeExtras.push(`[${sessionLevel}]`)
    const finalSpecialRequests = [...typeExtras, specialRequests].filter(Boolean).join(' ').trim()

    setLoading(true)
    const res = await fetch('/api/rezervasyon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: businessId,
        customer_name: name,
        phone,
        party_size: partySize,
        date: selectedDate,
        time: selectedTime,
        service_id: selectedHizmet,
        staff_id: selectedCalisan,
        masa_tipi_id: selectedMasa,
        table_id: selectedTable,
        special_requests: finalSpecialRequests,
      }),
    })
    setLoading(false)

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? t('genericError'))
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="w-12 h-12 stroke-green-600"
            fill="none"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <motion.path d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">{t('successTitle')}</h2>
          <p className="text-zinc-500 mb-2">
            <span className="font-semibold text-zinc-700">{businessName}</span>{' '}
            {t('successDesc')}
          </p>
          <p className="text-sm text-zinc-400 mb-8">
            {selectedDate} — {selectedTime} | {partySize} kişi
          </p>

          <div className="bg-zinc-50 rounded-2xl p-5 text-left max-w-sm mx-auto mb-8 border border-zinc-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-sm font-bold text-zinc-900">{businessName}</p>
                <p className="text-xs text-zinc-500">{selectedDate} — {selectedTime}</p>
              </div>
            </div>
            <div className="text-xs text-zinc-500 flex gap-4">
              <span>👤 {name}</span>
              <span>📞 {phone}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/rezervasyon')}
            className="rounded-full bg-zinc-900 text-white px-8 py-3 text-sm font-semibold hover:bg-zinc-700 transition-colors"
          >
            {t('backToBusinesses')}
          </button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Tarih */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-3">{t('selectDate')} *</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map(d => (
            <motion.button
              key={d.value}
              type="button"
              onClick={() => setSelectedDate(d.value)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border text-sm font-semibold transition-colors
                ${selectedDate === d.value
                  ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-200'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-red-300'}`}
            >
              <span className="text-xs font-normal opacity-80">{d.label}</span>
              <span className="text-lg font-extrabold">{d.day}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Psikolog — seans türü */}
      {businessType === 'psychologist' && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">Seans Türü *</label>
          <div className="flex gap-3">
            {[{ val: 'Yüz Yüze', icon: '🏢' }, { val: 'Online', icon: '💻' }].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setSessionMode(sessionMode === opt.val ? '' : opt.val)}
                className={`flex-1 flex flex-col items-center gap-1.5 p-4 rounded-xl border text-sm font-semibold transition-colors
                  ${sessionMode === opt.val
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-zinc-200 bg-white hover:border-emerald-200 text-zinc-700'}`}
              >
                <span className="text-2xl">{opt.icon}</span>
                {opt.val}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">🔒 Tüm seanslar KVKK kapsamında gizlilik içinde yürütülür.</p>
        </div>
      )}

      {/* Saat */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-3">{t('selectTime')} *</label>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot, i) => {
            const isOccupied = occupiedSlots.has(slot)
            const isSelected = selectedTime === slot
            return (
              <motion.button
                key={slot}
                type="button"
                disabled={isOccupied}
                onClick={() => !isOccupied && setSelectedTime(slot)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.015 }}
                whileHover={isOccupied ? {} : { scale: 1.08 }}
                whileTap={isOccupied ? {} : { scale: 0.9 }}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${isSelected
                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                    : isOccupied
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through cursor-not-allowed'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-red-300'}`}
              >
                {slot}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Kroki — masa seçimi */}
      {floorPlanEnabled && floorTables.length > 0 && selectedDate && selectedTime && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            {t('selectTable')}
            <span className="ml-2 text-xs font-normal text-zinc-400">({t('optional')})</span>
          </label>
          <FloorPlanPicker
            restaurantId={businessId}
            tables={floorTables}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedTableId={selectedTable}
            onSelect={setSelectedTable}
          />
        </div>
      )}

      {/* Masa tipi — sadece restoran */}
      {isRestaurant && masaTipleri.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">{t('tableType')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {masaTipleri.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMasa(selectedMasa === m.id ? null : m.id)}
                className={`p-3 rounded-xl border text-left transition-colors
                  ${selectedMasa === m.id
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-zinc-200 bg-white hover:border-red-200'}`}
              >
                <p className="font-semibold text-sm">{getMasaAd(m, locale)}</p>
                <p className="text-xs opacity-70 mt-0.5">{t('maxPeople', { count: m.kapasite })}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kuaför/Berber — Hizmet chip'leri (hardcoded, multi-select) */}
      {isBarberType && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            Hizmet Seçimi <span className="font-normal text-zinc-400">(birden fazla seçebilirsiniz)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BARBER_SERVICES.map(svc => {
              const isSelected = selectedBarberServices.includes(svc)
              return (
                <button
                  key={svc}
                  type="button"
                  onClick={() => setSelectedBarberServices(prev =>
                    prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
                  )}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors
                    ${isSelected
                      ? 'bg-red-600 border-red-600 text-white shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-red-300'}`}
                >
                  {svc}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Kuaför/Berber — Çalışan kartları */}
      {isBarberType && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            Çalışan Seçimi <span className="font-normal text-zinc-400">(opsiyonel)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedCalisan(null)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border w-[76px] transition-colors
                ${selectedCalisan === null
                  ? 'border-red-500 bg-red-50'
                  : 'border-zinc-200 bg-white hover:border-red-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-xl">🎲</div>
              <span className="text-xs font-semibold text-zinc-600">Fark Etmez</span>
            </button>
            {calisanlar.map(c => {
              const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              const isSelected = selectedCalisan === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCalisan(isSelected ? null : c.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border w-[76px] transition-colors
                    ${isSelected
                      ? 'border-red-500 bg-red-50'
                      : 'border-zinc-200 bg-white hover:border-red-200'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    ${isSelected ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-600'}`}>
                    {initials}
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 truncate w-full text-center">
                    {c.name.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Hizmet seçimi — diğer türler (DB'den) */}
      {hasServices && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">{t('selectService')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hizmetler.map(h => (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedHizmet(selectedHizmet === h.id ? null : h.id)}
                className={`p-4 rounded-xl border text-left transition-colors
                  ${selectedHizmet === h.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-zinc-200 bg-white hover:border-red-200'}`}
              >
                <p className={`font-semibold text-sm ${selectedHizmet === h.id ? 'text-red-700' : 'text-zinc-900'}`}>
                  {h.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-zinc-500">{h.duration_minutes} {t('min')}</span>
                  {h.price && (
                    <span className="text-xs font-semibold text-zinc-700">
                      {h.price.toLocaleString('tr-TR')} ₺
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Personel seçimi — diğer türler */}
      {hasStaff && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            {t('selectStaff')} <span className="font-normal text-zinc-400">({t('optional')})</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {calisanlar.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCalisan(selectedCalisan === c.id ? null : c.id)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors
                  ${selectedCalisan === c.id
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-zinc-200 bg-white hover:border-red-200 text-zinc-700'}`}
              >
                <span className="font-semibold">{c.name}</span>
                {c.title && <span className="block text-xs opacity-70">{c.title}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kişisel bilgiler */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{t('fullName')} *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('fullNamePlaceholder')}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{t('phone')} *</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder={t('phonePlaceholder')}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition-colors"
            required
          />
        </div>
      </div>

      {/* Kişi sayısı — sadece restoran */}
      {isRestaurant && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">{t('partySize')}</label>
          <div className="flex gap-2 flex-wrap">
            {['1','2','3','4','5','6','7','8+'].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setPartySize(n)}
                className={`w-12 h-12 rounded-xl border text-sm font-semibold transition-colors
                  ${partySize === n
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-red-300'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Restoran — Ziyaret Sebebi */}
      {businessType === 'restaurant' && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            Ziyaret Sebebi <span className="font-normal text-zinc-400">(opsiyonel)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 'Sıradan Ziyaret', icon: '🍽️' },
              { val: 'Doğum Günü',      icon: '🎂' },
              { val: 'Yıldönümü',       icon: '💑' },
              { val: 'İş Yemeği',       icon: '💼' },
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setOccasion(occasion === opt.val ? '' : opt.val)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-colors
                  ${occasion === opt.val
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-zinc-200 bg-white hover:border-amber-200 text-zinc-700'}`}
              >
                <span className="text-xl">{opt.icon}</span>
                {opt.val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Diş Kliniği — Ziyaret Sebebi */}
      {businessType === 'dentist' && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            Ziyaret Sebebi <span className="font-normal text-zinc-400">(opsiyonel)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['Kontrol', 'Temizlik', 'Dolgu', 'Çekim', 'Kanal Tedavisi', 'Diğer'].map(reason => (
              <button
                key={reason}
                type="button"
                onClick={() => setVisitReason(visitReason === reason ? '' : reason)}
                className={`p-3 rounded-xl border text-sm font-medium text-center transition-colors
                  ${visitReason === reason
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 bg-white hover:border-blue-200 text-zinc-700'}`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Veteriner — Evcil Hayvan Türü */}
      {businessType === 'veterinary' && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            Evcil Hayvan Türü <span className="font-normal text-zinc-400">(opsiyonel)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 'Köpek', icon: '🐕' },
              { val: 'Kedi',  icon: '🐈' },
              { val: 'Kuş',   icon: '🐦' },
              { val: 'Balık', icon: '🐠' },
              { val: 'Diğer', icon: '🐾' },
            ].map(pet => (
              <button
                key={pet.val}
                type="button"
                onClick={() => setPetType(petType === pet.val ? '' : pet.val)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors
                  ${petType === pet.val
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-violet-300'}`}
              >
                <span>{pet.icon}</span>
                {pet.val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kayropraktik — Şikâyet Bölgesi */}
      {businessType === 'chiropractor' && (
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            Şikâyet Bölgesi <span className="font-normal text-zinc-400">(opsiyonel)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {['Boyun', 'Üst Sırt', 'Bel', 'Omuz', 'Kalça', 'Tüm Vücut'].map(area => (
              <button
                key={area}
                type="button"
                onClick={() => setProblemArea(problemArea === area ? '' : area)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
                  ${problemArea === area
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-emerald-300'}`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spor Salonu / Pilates — Format ve Seviye */}
      {['fitness', 'pilates'].includes(businessType) && (
        <>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-3">
              Ders Formatı <span className="font-normal text-zinc-400">(opsiyonel)</span>
            </label>
            <div className="flex gap-3">
              {[{ val: 'Bireysel', icon: '👤' }, { val: 'Grup', icon: '👥' }].map(f => (
                <button
                  key={f.val}
                  type="button"
                  onClick={() => setSessionFormat(sessionFormat === f.val ? '' : f.val)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-colors
                    ${sessionFormat === f.val
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-zinc-200 bg-white hover:border-orange-200 text-zinc-700'}`}
                >
                  <span className="text-lg">{f.icon}</span>
                  {f.val}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-3">
              Seviye <span className="font-normal text-zinc-400">(opsiyonel)</span>
            </label>
            <div className="flex gap-2">
              {['Başlangıç', 'Orta', 'İleri'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSessionLevel(sessionLevel === level ? '' : level)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors
                    ${sessionLevel === level
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-orange-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
          {t(specialLabelKey as Parameters<typeof t>[0])}
        </label>
        <textarea
          value={specialRequests}
          onChange={e => setSpecialRequests(e.target.value)}
          rows={3}
          placeholder={t('specialRequestPlaceholder')}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-red-400 transition-colors resize-none"
        />
      </div>

      {/* Privacy checkbox */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${privacyError && !privacyAccepted ? 'border-red-400 bg-red-50' : 'border-zinc-200 bg-zinc-50'}`}>
        <input
          type="checkbox"
          id="privacy"
          checked={privacyAccepted}
          onChange={e => { setPrivacyAccepted(e.target.checked); setPrivacyError(false) }}
          className="mt-0.5 accent-red-600 w-4 h-4 shrink-0 cursor-pointer"
        />
        <label htmlFor="privacy" className="text-sm text-zinc-700 cursor-pointer leading-relaxed">
          <button type="button" onClick={() => setPrivacyModalOpen(true)} className="text-red-600 font-semibold hover:underline">
            Gizlilik Sözleşmesi ve Rezervasyon Koşulları
          </button>
          {"'nı okudum, kabul ediyorum"}
        </label>
      </div>
      {privacyError && !privacyAccepted && (
        <p className="text-sm text-red-600 -mt-4">Devam etmek için koşulları onaylamanız gerekmektedir.</p>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-4 text-base transition-colors
          ${!privacyAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            {t('submitting')}
          </span>
        ) : t('submit')}
      </motion.button>

      <p className="text-center text-xs text-zinc-400">
        {t('confirmationNote')}
      </p>

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
              <h2 className="text-lg font-bold text-zinc-900">Gizlilik Sözleşmesi & Rezervasyon Koşulları</h2>
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
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-sm transition-colors"
              >
                Okudum, Onaylıyorum ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
