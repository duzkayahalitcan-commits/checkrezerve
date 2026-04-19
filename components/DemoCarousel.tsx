'use client'

import { useState, useEffect, useCallback } from 'react'

const INTERVAL = 5000

type ServiceOption = { label: string; sub: string }

type DemoConfig = {
  id: string
  type: string
  name: string
  location: string
  accent: {
    badge: string
    selected: string
    button: string
    dot: string
    bar: string
  }
  icon: React.ReactNode
  serviceLabel: string
  services: [ServiceOption, ServiceOption]
  fields: Array<{ label: string; placeholder: string }>
  buttonText: string
}

const DEMOS: DemoConfig[] = [
  {
    id: 'bosphorus',
    type: 'Restoran',
    name: 'Bosphorus Restaurant',
    location: 'Beşiktaş, İstanbul',
    accent: {
      badge: 'bg-orange-100 text-orange-700',
      selected: 'border-orange-400 bg-orange-50 text-orange-700',
      button: 'bg-orange-600 hover:bg-orange-700',
      dot: 'bg-orange-500',
      bar: 'bg-orange-500',
    },
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2a5 5 0 0 0-5 5v6h4v7"/>
      </svg>
    ),
    serviceLabel: 'Alan Seçin',
    services: [
      { label: 'Cam Kenarı', sub: '2–4 kişi' },
      { label: 'Bahçe', sub: '4–8 kişi' },
    ],
    fields: [
      { label: 'Ad Soyad', placeholder: 'Ahmet Yılmaz' },
      { label: 'Telefon', placeholder: '0532 000 00 00' },
      { label: 'Tarih', placeholder: '12.04.2026' },
      { label: 'Kişi Sayısı', placeholder: '4 kişi' },
    ],
    buttonText: 'Rezervasyon Yap',
  },
  {
    id: 'lotus-spa',
    type: 'Spa',
    name: 'Lotus Spa',
    location: 'Etiler, İstanbul',
    accent: {
      badge: 'bg-teal-100 text-teal-700',
      selected: 'border-teal-400 bg-teal-50 text-teal-700',
      button: 'bg-teal-600 hover:bg-teal-700',
      dot: 'bg-teal-500',
      bar: 'bg-teal-500',
    },
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
    serviceLabel: 'Hizmet Seçin',
    services: [
      { label: 'Aromaterapi Masaj', sub: '60 dk' },
      { label: 'Türk Hamamı', sub: '90 dk' },
    ],
    fields: [
      { label: 'Ad Soyad', placeholder: 'Ayşe Demir' },
      { label: 'Telefon', placeholder: '0532 000 00 00' },
      { label: 'Tarih', placeholder: '14.04.2026' },
      { label: 'Saat', placeholder: '11:00' },
    ],
    buttonText: 'Randevu Al',
  },
  {
    id: 'elit-kuafor',
    type: 'Kuaför',
    name: 'Elit Kuaför',
    location: 'Nişantaşı, İstanbul',
    accent: {
      badge: 'bg-pink-100 text-pink-700',
      selected: 'border-pink-400 bg-pink-50 text-pink-700',
      button: 'bg-pink-600 hover:bg-pink-700',
      dot: 'bg-pink-500',
      bar: 'bg-pink-500',
    },
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3"/>
        <circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/>
        <line x1="14.47" y1="14.48" x2="20" y2="20"/>
        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
    ),
    serviceLabel: 'Hizmet Seçin',
    services: [
      { label: 'Saç Kesimi', sub: '45 dk' },
      { label: 'Boya & Röfle', sub: '90 dk' },
    ],
    fields: [
      { label: 'Ad Soyad', placeholder: 'Zeynep Kaya' },
      { label: 'Telefon', placeholder: '0532 000 00 00' },
      { label: 'Tarih', placeholder: '12.04.2026' },
      { label: 'Saat', placeholder: '14:30' },
    ],
    buttonText: 'Randevu Al',
  },
  {
    id: 'hk-berber',
    type: 'Berber',
    name: 'HK Berber',
    location: 'Kadıköy, İstanbul',
    accent: {
      badge: 'bg-blue-100 text-blue-700',
      selected: 'border-blue-400 bg-blue-50 text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      dot: 'bg-blue-500',
      bar: 'bg-blue-500',
    },
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2v7a3 3 0 0 0 6 0V2"/>
        <path d="M9 2v20"/>
        <path d="M3 2h6M12 2h9"/>
        <path d="M21 8H15"/>
        <path d="M21 14H15"/>
        <path d="M21 20H15"/>
      </svg>
    ),
    serviceLabel: 'Hizmet Seçin',
    services: [
      { label: 'Saç & Sakal', sub: '30 dk' },
      { label: 'Sadece Saç', sub: '20 dk' },
    ],
    fields: [
      { label: 'Ad Soyad', placeholder: 'Hüseyin K.' },
      { label: 'Telefon', placeholder: '0532 000 00 00' },
      { label: 'Tarih', placeholder: '15.04.2026' },
      { label: 'Saat', placeholder: '10:00' },
    ],
    buttonText: 'Randevu Al',
  },
  {
    id: 'dr-elif',
    type: 'Psikolog',
    name: 'Dr. Elif Danışmanlık',
    location: 'Çankaya, Ankara',
    accent: {
      badge: 'bg-purple-100 text-purple-700',
      selected: 'border-purple-400 bg-purple-50 text-purple-700',
      button: 'bg-purple-600 hover:bg-purple-700',
      dot: 'bg-purple-500',
      bar: 'bg-purple-500',
    },
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.24Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.24Z"/>
      </svg>
    ),
    serviceLabel: 'Seans Türü',
    services: [
      { label: 'Bireysel Seans', sub: '50 dk' },
      { label: 'Çift Terapisi', sub: '90 dk' },
    ],
    fields: [
      { label: 'Ad Soyad', placeholder: 'Selin Arslan' },
      { label: 'Telefon', placeholder: '0532 000 00 00' },
      { label: 'Tarih', placeholder: '16.04.2026' },
      { label: 'Saat', placeholder: '15:00' },
    ],
    buttonText: 'Seans Rezervasyonu',
  },
]

export default function DemoCarousel() {
  const [current, setCurrent] = useState(0)
  const [selectedService, setSelectedService] = useState(0)
  const [progress, setProgress] = useState(0)

  const advance = useCallback(() => {
    setCurrent(prev => (prev + 1) % DEMOS.length)
    setSelectedService(0)
  }, [])

  useEffect(() => {
    const timer = setInterval(advance, INTERVAL)
    return () => clearInterval(timer)
  }, [advance])

  useEffect(() => {
    setProgress(0)
    const start = Date.now()
    const raf = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / INTERVAL) * 100, 100)
      setProgress(pct)
    }, 50)
    return () => clearInterval(raf)
  }, [current])

  const demo = DEMOS[current]

  return (
    <div className="mx-auto max-w-sm sm:max-w-md">
      <div className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-6 shadow-2xl shadow-zinc-900/5">

        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 mb-5 pb-4 border-b border-zinc-100">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="ml-2 flex-1 rounded-full bg-zinc-100 px-3 py-1 text-[10px] text-zinc-400 font-mono">
            checkrezerve.com/{demo.id}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-100 rounded-full mb-5 overflow-hidden">
          <div
            className={`h-full rounded-full ${demo.accent.bar}`}
            style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* Business header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-base font-bold text-zinc-900">{demo.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{demo.location}</p>
            </div>
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold shrink-0 ${demo.accent.badge}`}>
              {demo.icon}
              {demo.type}
            </span>
          </div>

          {/* Service selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-zinc-500">{demo.serviceLabel}</span>
            <div className="flex gap-2 flex-wrap">
              {demo.services.map((svc, i) => (
                <button
                  key={svc.label}
                  onClick={() => setSelectedService(i)}
                  className={`rounded-lg border-2 px-2.5 py-2 text-xs font-medium transition-colors ${
                    selectedService === i
                      ? demo.accent.selected
                      : 'border-zinc-200 bg-white text-zinc-400'
                  }`}
                >
                  {svc.label} · {svc.sub}
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            {demo.fields.map(({ label, placeholder }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-zinc-500">{label}</span>
                <div className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-400">
                  {placeholder}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button className={`rounded-xl py-3 text-center text-xs font-semibold text-white transition-colors ${demo.accent.button}`}>
            {demo.buttonText}
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            onClick={() => { setCurrent(i); setSelectedService(0); setProgress(0) }}
            aria-label={d.name}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? `w-6 ${d.accent.dot}` : 'w-1.5 bg-zinc-300'
            }`}
          />
        ))}
      </div>

      <p className="text-center text-xs text-zinc-400 mt-3">
        Gerçek randevu formu böyle görünür
      </p>
    </div>
  )
}
