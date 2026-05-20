'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import dynamic from 'next/dynamic'

type MasaTipi   = { id: string; ad: string; ad_en: string | null; ad_ar: string | null; ad_de: string | null; ad_da: string | null; ad_es: string | null; ad_ru: string | null; kapasite: number }

function getMasaAd(m: MasaTipi, locale: string): string {
  const key = `ad_${locale}` as keyof MasaTipi
  return (m[key] as string | null) || m.ad
}
type Hizmet     = { id: string; name: string; duration_minutes: number; price: number | null }
type Calisan    = { id: string; name: string; title: string | null }
type FloorTable = {
  id: string; label: string; capacity: number
  x: number; y: number; width: number; height: number; shape: 'rect' | 'circle'
}

// react-konva is browser-only
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

const BEAUTY_TYPES = ['spa', 'beauty_salon', 'barber', 'hairdresser']

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

  const [selectedDate, setSelectedDate] = useState(dates[0].value)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedMasa, setSelectedMasa] = useState<string | null>(null)
  const [selectedHizmet, setSelectedHizmet] = useState<string | null>(null)
  const [selectedCalisan, setSelectedCalisan] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState('2')
  const [specialRequests, setSpecialRequests] = useState('')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [dresscode, setDresscode] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [privacyError, setPrivacyError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isBeauty = BEAUTY_TYPES.includes(businessType)

  const DRESSCODE_OPTIONS: Record<string, string[]> = {
    restaurant:    ['Serbest', 'Smart Casual', 'Business Casual', 'Formal', 'Kokteyl'],
    spa:           ['Rahat', 'Havlu/Bornoz sağlanır', 'Spor kıyafet önerilir'],
    beauty_salon:  ['Rahat', 'Havlu/Bornoz sağlanır', 'Spor kıyafet önerilir'],
    barber:        ['Serbest'],
    hairdresser:   ['Serbest'],
    default:       ['Serbest', 'Smart Casual', 'Casual'],
  }
  const dresscodeOptions = DRESSCODE_OPTIONS[businessType] ?? DRESSCODE_OPTIONS.default
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
        special_requests: dresscode ? `[Dresscode: ${dresscode}] ${specialRequests}`.trim() : specialRequests,
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
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">{t('successTitle')}</h2>
        <p className="text-zinc-500 mb-6">
          <span className="font-semibold text-zinc-700">{businessName}</span>{' '}
          {t('successDesc')}
        </p>
        <button
          onClick={() => router.push('/rezervasyon')}
          className="rounded-full bg-zinc-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-zinc-700 transition-colors"
        >
          {t('backToBusinesses')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Tarih */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-3">{t('selectDate')} *</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => setSelectedDate(d.value)}
              className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border text-sm font-semibold transition-colors
                ${selectedDate === d.value
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-red-300'}`}
            >
              <span className="text-xs font-normal opacity-80">{d.label}</span>
              <span className="text-lg font-extrabold">{d.day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Saat */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-3">{t('selectTime')} *</label>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map(slot => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedTime(slot)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                ${selectedTime === slot
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-red-300'}`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Kroki — masa seçimi (floor_plan_enabled işletmelerde) */}
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

      {/* Masa tipi — restoran */}
      {!isBeauty && masaTipleri.length > 0 && (
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

      {/* Hizmet seçimi — güzellik sektörü */}
      {isBeauty && hizmetler.length > 0 && (
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

      {/* Personel seçimi — güzellik sektörü */}
      {isBeauty && calisanlar.length > 0 && (
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

      {!isBeauty && (
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

      {/* Dresscode */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-3">
          Dresscode <span className="font-normal text-zinc-400">(opsiyonel)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {dresscodeOptions.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setDresscode(dresscode === opt ? '' : opt)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
                ${dresscode === opt
                  ? 'bg-zinc-900 border-zinc-900 text-white'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

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

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-4 text-base transition-colors
          ${!privacyAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? t('submitting') : t('submit')}
      </button>

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
