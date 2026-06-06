'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

type Feature = { title: string; desc: string }
type SectorData = { img: string; title: string; desc: string; features: Feature[] }

const SECTORS = [
  { id: 'restoran', icon: '🍽️', label: 'Restoran' },
  { id: 'spa',      icon: '💆', label: 'Spa & Güzellik' },
  { id: 'kuafor',   icon: '✂️', label: 'Kuaför & Berber' },
  { id: 'psikolog', icon: '🧠', label: 'Psikolog & Danışman' },
  { id: 'pilates',  icon: '🧘', label: 'Pilates & Yoga' },
  { id: 'klinik',   icon: '🏥', label: 'Klinik & Fizik Tedavi' },
]

export default function SectorTabs() {
  const t = useTranslations('useCases')
  const searchParams = useSearchParams()
  const tabsRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState('restoran')

  useEffect(() => {
    const sektor = searchParams.get('sektor')
    if (sektor && SECTORS.find(s => s.id === sektor)) {
      setActive(sektor)
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [searchParams])

  const SECTOR_DATA: Record<string, SectorData> = {
    restoran: {
      img:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80',
      title: t('sectorRestaurantTitle'),
      desc:  t('sectorRestaurantDesc'),
      features: [
        { title: t('restaurantF1T'), desc: t('restaurantF1D') },
        { title: t('restaurantF2T'), desc: t('restaurantF2D') },
        { title: t('restaurantF3T'), desc: t('restaurantF3D') },
        { title: t('restaurantF4T'), desc: t('restaurantF4D') },
        { title: t('restaurantF5T'), desc: t('restaurantF5D') },
      ],
    },
    spa: {
      img:   'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80',
      title: t('sectorSpaTitle'),
      desc:  t('sectorSpaDesc'),
      features: [
        { title: t('spaF1T'), desc: t('spaF1D') },
        { title: t('spaF2T'), desc: t('spaF2D') },
        { title: t('spaF3T'), desc: t('spaF3D') },
        { title: t('spaF4T'), desc: t('spaF4D') },
        { title: t('spaF5T'), desc: t('spaF5D') },
      ],
    },
    kuafor: {
      img:   'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=700&q=80',
      title: t('sectorBarberTitle'),
      desc:  t('sectorBarberDesc'),
      features: [
        { title: t('barberF1T'), desc: t('barberF1D') },
        { title: t('barberF2T'), desc: t('barberF2D') },
        { title: t('barberF3T'), desc: t('barberF3D') },
        { title: t('barberF4T'), desc: t('barberF4D') },
        { title: t('barberF5T'), desc: t('barberF5D') },
      ],
    },
    psikolog: {
      img:   'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=700&q=80',
      title: 'Psikolog & Danışman Klinikleri İçin',
      desc:  'Seans yönetiminden hasta takibine, randevu hatırlatmalarından gizlilik güvencesine kadar profesyonel danışmanlık altyapısı.',
      features: [
        { title: 'Online Seans Desteği',  desc: 'Video görüşme linki otomatik gönderilir' },
        { title: 'Tekrarlayan Randevu',   desc: 'Haftalık/aylık seans serileri oluştur' },
        { title: 'Hasta Notları',         desc: 'Her seans için özel not alanı' },
        { title: 'Gizlilik Modu',         desc: 'Hasta bilgileri şifreli, paylaşılmaz' },
      ],
    },
    pilates: {
      img:   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&q=80',
      title: 'Pilates & Yoga Stüdyoları İçin',
      desc:  'Ekipman rezervasyonundan grup derslerine, paket satışından devam takibine kadar stüdyo yönetimi.',
      features: [
        { title: 'Grup & Bireysel Ders', desc: 'Kapasiteye göre katılımcı yönetimi' },
        { title: 'Ekipman Takibi',       desc: 'Reformer, halı, araç-gereç rezervasyonu' },
        { title: 'Paket Satışı',         desc: '10 ders, 20 ders paketleri tanımla' },
        { title: 'Devam Takibi',         desc: 'Müşteri katılım geçmişi ve istatistikleri' },
      ],
    },
    klinik: {
      img:   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&q=80',
      title: 'Klinik & Fizik Tedavi Merkezleri İçin',
      desc:  'Doktor ve fizyoterapist randevu yönetiminden cihaz rezervasyonuna, tedavi takibine kadar klinik altyapısı.',
      features: [
        { title: 'Uzman Seçimi',       desc: 'Doktor/fizyoterapiste göre müsaitlik takvimi' },
        { title: 'Tedavi Süresi',      desc: 'Seans uzunluğu servise göre otomatik hesaplanır' },
        { title: 'Cihaz Rezervasyonu', desc: 'Ultrason, lazer, TENS cihazları için slot' },
        { title: 'Takip Seansları',    desc: 'Tedavi protokolüne bağlı otomatik hatırlatma' },
      ],
    },
  }

  const sector = SECTOR_DATA[active]

  return (
    <>
      {/* Tab Buttons — scroll hedefi, scroll-mt-28 sticky header için */}
      <div ref={tabsRef} className="flex flex-wrap gap-2 justify-center mb-12 scroll-mt-28">
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 ${
              active === s.id
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-red-300 hover:text-red-600'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-shrink-0 w-full lg:w-[480px]">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-zinc-100 bg-zinc-100 w-full h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={sector.img}
              src={sector.img}
              alt={sector.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="eager"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">{t('sectorUsageLabel')}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2 mb-3">{sector.title}</h2>
          <p className="text-zinc-600 leading-relaxed mb-6">{sector.desc}</p>
          <div className="space-y-3">
            {sector.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                <span className="mt-0.5 text-red-500 font-bold shrink-0">✓</span>
                <div>
                  <strong className="text-sm text-zinc-900">{f.title}</strong>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/kayit"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-6 py-3 text-sm font-semibold text-white transition-colors">
              {t('sectorTrialButton')}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
