'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function SectorTabs() {
  const t = useTranslations('useCases')
  const [active, setActive] = useState('restoran')

  const SECTORS = [
    { id: 'restoran', icon: '🍽️', labelKey: 'sectorRestaurantLabel' },
    { id: 'kafe',     icon: '☕',  labelKey: 'sectorCafeLabel' },
    { id: 'spa',      icon: '💆', labelKey: 'sectorSpaLabel' },
    { id: 'kuafor',   icon: '✂️', labelKey: 'sectorBarberLabel' },
    { id: 'otel',     icon: '🏨', labelKey: 'sectorHotelLabel' },
    { id: 'etkinlik', icon: '🎪', labelKey: 'sectorEventLabel' },
    { id: 'fitness',  icon: '🏋️', labelKey: 'sectorFitnessLabel' },
  ]

  const SECTOR_DATA: Record<string, {
    img: string
    titleKey: string
    descKey: string
    features: { titleKey: string; descKey: string }[]
  }> = {
    restoran: {
      img: '/images/sector-restoran.jpg',
      titleKey: 'sectorRestaurantTitle',
      descKey: 'sectorRestaurantDesc',
      features: [
        { titleKey: 'restaurantF1T', descKey: 'restaurantF1D' },
        { titleKey: 'restaurantF2T', descKey: 'restaurantF2D' },
        { titleKey: 'restaurantF3T', descKey: 'restaurantF3D' },
        { titleKey: 'restaurantF4T', descKey: 'restaurantF4D' },
        { titleKey: 'restaurantF5T', descKey: 'restaurantF5D' },
      ],
    },
    kafe: {
      img: '/images/sector-kafe.jpg',
      titleKey: 'sectorCafeTitle',
      descKey: 'sectorCafeDesc',
      features: [
        { titleKey: 'cafeF1T', descKey: 'cafeF1D' },
        { titleKey: 'cafeF2T', descKey: 'cafeF2D' },
        { titleKey: 'cafeF3T', descKey: 'cafeF3D' },
        { titleKey: 'cafeF4T', descKey: 'cafeF4D' },
        { titleKey: 'cafeF5T', descKey: 'cafeF5D' },
      ],
    },
    spa: {
      img: '/images/sector-spa.jpg',
      titleKey: 'sectorSpaTitle',
      descKey: 'sectorSpaDesc',
      features: [
        { titleKey: 'spaF1T', descKey: 'spaF1D' },
        { titleKey: 'spaF2T', descKey: 'spaF2D' },
        { titleKey: 'spaF3T', descKey: 'spaF3D' },
        { titleKey: 'spaF4T', descKey: 'spaF4D' },
        { titleKey: 'spaF5T', descKey: 'spaF5D' },
      ],
    },
    kuafor: {
      img: '/images/sector-kuafor.jpg',
      titleKey: 'sectorBarberTitle',
      descKey: 'sectorBarberDesc',
      features: [
        { titleKey: 'barberF1T', descKey: 'barberF1D' },
        { titleKey: 'barberF2T', descKey: 'barberF2D' },
        { titleKey: 'barberF3T', descKey: 'barberF3D' },
        { titleKey: 'barberF4T', descKey: 'barberF4D' },
        { titleKey: 'barberF5T', descKey: 'barberF5D' },
      ],
    },
    otel: {
      img: '/images/sector-otel.jpg',
      titleKey: 'sectorHotelTitle',
      descKey: 'sectorHotelDesc',
      features: [
        { titleKey: 'hotelF1T', descKey: 'hotelF1D' },
        { titleKey: 'hotelF2T', descKey: 'hotelF2D' },
        { titleKey: 'hotelF3T', descKey: 'hotelF3D' },
        { titleKey: 'hotelF4T', descKey: 'hotelF4D' },
        { titleKey: 'hotelF5T', descKey: 'hotelF5D' },
      ],
    },
    etkinlik: {
      img: '/images/sector-etkinlik.jpg',
      titleKey: 'sectorEventTitle',
      descKey: 'sectorEventDesc',
      features: [
        { titleKey: 'eventF1T', descKey: 'eventF1D' },
        { titleKey: 'eventF2T', descKey: 'eventF2D' },
        { titleKey: 'eventF3T', descKey: 'eventF3D' },
        { titleKey: 'eventF4T', descKey: 'eventF4D' },
        { titleKey: 'eventF5T', descKey: 'eventF5D' },
      ],
    },
    fitness: {
      img: '/images/sector-fitness.jpg',
      titleKey: 'sectorFitnessTitle',
      descKey: 'sectorFitnessDesc',
      features: [
        { titleKey: 'fitnessF1T', descKey: 'fitnessF1D' },
        { titleKey: 'fitnessF2T', descKey: 'fitnessF2D' },
        { titleKey: 'fitnessF3T', descKey: 'fitnessF3D' },
        { titleKey: 'fitnessF4T', descKey: 'fitnessF4D' },
        { titleKey: 'fitnessF5T', descKey: 'fitnessF5D' },
      ],
    },
  }

  const sector = SECTOR_DATA[active]

  return (
    <>
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 ${
              active === s.id
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-red-300 hover:text-red-600'
            }`}
          >
            {s.icon} {t(s.labelKey as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-shrink-0 w-full lg:w-[480px]">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-zinc-100">
            <Image
              src={sector.img}
              alt={t(sector.titleKey as Parameters<typeof t>[0])}
              width={480}
              height={340}
              className="w-full h-72 object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">{t('sectorUsageLabel')}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2 mb-3">{t(sector.titleKey as Parameters<typeof t>[0])}</h2>
          <p className="text-zinc-600 leading-relaxed mb-6">{t(sector.descKey as Parameters<typeof t>[0])}</p>
          <div className="space-y-3">
            {sector.features.map(f => (
              <div key={f.titleKey} className="flex items-start gap-3 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                <span className="mt-0.5 text-red-500 font-bold shrink-0">✓</span>
                <div>
                  <strong className="text-sm text-zinc-900">{t(f.titleKey as Parameters<typeof t>[0])}</strong>
                  <p className="text-xs text-zinc-500 mt-0.5">{t(f.descKey as Parameters<typeof t>[0])}</p>
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
