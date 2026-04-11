'use client'

import { useState } from 'react'

export function PricingToggle() {
  const [yearly, setYearly] = useState(false)

  const monthly  = { starter: 1499, pro: 4499 }
  const annually = {
    starter: Math.round(monthly.starter * 0.8),
    pro:     Math.round(monthly.pro     * 0.8),
  }
  const prices = yearly ? annually : monthly

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-medium ${!yearly ? 'text-zinc-900' : 'text-zinc-400'}`}>Aylık</span>
        <button
          onClick={() => setYearly(v => !v)}
          aria-label="Yıllık ödemeye geç"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            yearly ? 'bg-amber-500' : 'bg-zinc-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            yearly ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <span className={`text-sm font-medium ${yearly ? 'text-zinc-900' : 'text-zinc-400'}`}>
          Yıllık
          <span className="ml-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5">
            %20 indirim
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-3 gap-6">

        {/* Başlangıç */}
        <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Başlangıç</p>
            <p className="text-sm text-zinc-500 mb-4">Berber, psikolog ve tek masalı hizmetler için</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-zinc-900">₺{prices.starter.toLocaleString('tr-TR')}</span>
              <span className="text-sm text-zinc-400">/ ay</span>
            </div>
            {yearly && (
              <p className="text-xs text-emerald-600 mt-1">
                Yıllık ödeme · ₺{(prices.starter * 12).toLocaleString('tr-TR')} / yıl
              </p>
            )}
          </div>
          <ul className="flex flex-col gap-2.5 flex-1">
            {[
              'Aylık 100 rezervasyon sınırı',
              'Temel yönetim paneli',
              'SMS bildirimi (ücretli)',
              'Mobil uyumlu form',
            ].map(f => (
              <li key={f} className="text-sm text-zinc-600 flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-emerald-500 text-xs">✓</span>{f}
              </li>
            ))}
          </ul>
          <a
            href="/kayit"
            className="rounded-xl border border-zinc-900 py-3.5 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Başla →
          </a>
        </div>

        {/* Profesyonel — highlight */}
        <div className="relative flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-white shadow-2xl shadow-zinc-900/30">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-0.5 text-xs font-semibold text-white shadow-sm">
            En Popüler
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-1">Profesyonel</p>
            <p className="text-sm text-zinc-400 mb-4">Orta ölçekli restoranlar ve klinikler için</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">₺{prices.pro.toLocaleString('tr-TR')}</span>
              <span className="text-sm text-zinc-400">/ ay</span>
            </div>
            {yearly && (
              <p className="text-xs text-emerald-400 mt-1">
                Yıllık ödeme · ₺{(prices.pro * 12).toLocaleString('tr-TR')} / yıl
              </p>
            )}
          </div>
          <ul className="flex flex-col gap-2.5 flex-1">
            {[
              'Sınırsız rezervasyon',
              'Gelişmiş yönetim paneli',
              '500 ücretsiz SMS / ay',
              'Yapay zeka ile otomatik kayıt',
              'Öncelikli destek',
            ].map(f => (
              <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-amber-400 text-xs">✓</span>{f}
              </li>
            ))}
          </ul>
          <a
            href="/kayit"
            className="rounded-xl bg-amber-500 py-3.5 text-center text-sm font-semibold text-white hover:bg-amber-400 transition-colors"
          >
            Profesyonel&apos;e Geç →
          </a>
        </div>

        {/* Kurumsal */}
        <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Kurumsal</p>
            <p className="text-sm text-zinc-500 mb-4">Büyük hizmet işletmeleri ve zincirler için</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-zinc-900">Teklif Alın</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Özel fiyatlandırma · Ekibimiz ulaşır</p>
          </div>
          <ul className="flex flex-col gap-2.5 flex-1">
            {[
              'Özel alan adı (white-label)',
              'Sınırsız SMS',
              'Özel API erişimi',
              '7/24 VIP destek',
              'Çoklu şube yönetimi',
            ].map(f => (
              <li key={f} className="text-sm text-zinc-600 flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-emerald-500 text-xs">✓</span>{f}
              </li>
            ))}
          </ul>
          <a
            href="mailto:merhaba@checkrezerve.com?subject=Kurumsal Teklif"
            className="rounded-xl border border-zinc-900 py-3.5 text-center text-sm font-semibold text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            Teklif İste →
          </a>
        </div>

      </div>
    </>
  )
}
