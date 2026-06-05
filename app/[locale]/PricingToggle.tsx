'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  CalendarCheck, Users, BarChart3, LayoutDashboard, CreditCard,
  Bell, CheckCircle, Clock, ListChecks,
  Globe, Map, Bot, QrCode,
  PieChart, Building2, Cpu, PhoneCall, TrendingUp, Headphones, Shield
} from 'lucide-react'

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Rezervasyon Yönetimi': <CalendarCheck size={14} />,
  'Müşteri Kaydı (CRM)': <Users size={14} />,
  'Temel Raporlama': <BarChart3 size={14} />,
  'Masa / Alan Yönetimi': <LayoutDashboard size={14} />,
  'Ön Ödemeli Rezervasyon': <CreditCard size={14} />,
  'SMS & E-posta Bildirimleri': <Bell size={14} />,
  'Konfirmasyon & Onay Akışı': <CheckCircle size={14} />,
  'Rezervasyon Hatırlatma Zinciri': <Clock size={14} />,
  'Bekleme Listesi (Waitlist)': <ListChecks size={14} />,
  'Online Rezervasyon Sayfası': <Globe size={14} />,
  'İnteraktif Kroki Özelliği': <Map size={14} />,
  'Yapay Zeka Chatbot Entegrasyonu': <Bot size={14} />,
  'Karekod Menü & Sticker Desteği': <QrCode size={14} />,
  'Gelişmiş Raporlama': <PieChart size={14} />,
  'Çoklu Şube Yönetimi': <Building2 size={14} />,
  'API Entegrasyonu & Özel Entegrasyonlar': <Cpu size={14} />,
  'Caller ID': <PhoneCall size={14} />,
  'Pazarlama Araçları': <TrendingUp size={14} />,
  'Özel Müşteri Temsilcisi': <Headphones size={14} />,
  'Öncelikli Destek': <Shield size={14} />,
}

function getFeatureIcon(name: string): React.ReactNode {
  for (const [key, icon] of Object.entries(FEATURE_ICONS)) {
    if (name.startsWith(key)) return icon
  }
  return <CheckCircle size={14} />
}

export function PricingToggle() {
  const t = useTranslations('pricing')
  const [yearly, setYearly] = useState(false)

  const monthly  = { starter: 2499, pro: 5499 }
  const annually = {
    starter: Math.round(monthly.starter * 0.8),
    pro:     Math.round(monthly.pro     * 0.8),
  }
  const prices = yearly ? annually : monthly

  const starterFeatures = [t('f1'), t('f2'), t('f3'), t('f4'), t('f5'), t('f6')]
  const proFeatures     = [t('f1'), t('f2'), t('f3'), t('f4'), t('f5'), t('f6'), t('f7'), t('f8'), t('f9'), t('f10'), t('f11'), t('f12')]
  const enterpriseFeatures = [t('f1'), t('f2'), t('f3'), t('f4'), t('f5'), t('f6'), t('f7'), t('f8'), t('f9'), t('f10'), t('f11'), t('f12'), t('f13'), t('f14'), t('f15'), t('f16'), t('f17'), t('f18')]

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-14">
        <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-white' : 'text-zinc-600'}`}>{t('monthly')}</span>
        <button
          onClick={() => setYearly(v => !v)}
          aria-label={t('switchYearly')}
          className="relative inline-flex h-7 w-12 items-center rounded-full bg-zinc-800 transition-colors data-[checked=true]:bg-red-600"
          data-checked={yearly}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
            yearly ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <span className={`text-sm font-medium transition-colors ${yearly ? 'text-white' : 'text-zinc-600'}`}>
          {t('yearly')}
          <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 tracking-wide shadow-lg shadow-red-900/40">
            2 AY ÜCRETSİZ
          </span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-3 gap-6">

        {/* ─── Starter ─── */}
        <div className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.15] hover:from-white/[0.08] hover:to-white/[0.03]">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">{t('starterName')}</p>
            <p className="text-sm text-zinc-500 mb-5">{t('starterDesc')}</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-5xl font-bold text-white tracking-tight">₺{prices.starter.toLocaleString('tr-TR')}</span>
              <span className="text-sm text-zinc-500 ml-1">/{t('perMonth')}</span>
            </div>
            {yearly && (
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                ₺{(prices.starter * 12).toLocaleString('tr-TR')} / {t('perYear')} · <span className="text-red-400">%20 tasarruf</span>
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-3 flex-1 mb-8">
            {starterFeatures.map(f => (
              <li key={f} className="text-sm text-zinc-400 flex items-center gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-zinc-600">{getFeatureIcon(f)}</span>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/kayit"
            className="mt-auto rounded-xl border border-white/15 py-3.5 text-center text-sm font-semibold text-white bg-white/[0.04] hover:bg-white hover:text-zinc-900 transition-all duration-200"
          >
            {t('cta')}
          </Link>
        </div>

        {/* ─── Professional — En Popüler ─── */}
        <div className="relative flex flex-col rounded-2xl border border-red-500/40 bg-gradient-to-b from-red-500/[0.08] to-red-500/[0.02] p-8 shadow-2xl shadow-red-900/20 transition-all duration-300 hover:border-red-500/60">
          {/* Glow effect */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-red-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-red-600 to-red-500 px-5 py-1 text-[11px] font-bold text-white tracking-wide shadow-lg shadow-red-900/40 whitespace-nowrap flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            {t('mostPopular')}
          </span>

          <div className="relative z-10 mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-400 mb-1">{t('proName')}</p>
            <p className="text-sm text-zinc-400 mb-5">{t('proDesc')}</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-5xl font-bold text-white tracking-tight">₺{prices.pro.toLocaleString('tr-TR')}</span>
              <span className="text-sm text-zinc-500 ml-1">/{t('perMonth')}</span>
            </div>
            {yearly && (
              <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                ₺{(prices.pro * 12).toLocaleString('tr-TR')} / {t('perYear')} · <span className="text-red-400">%20 tasarruf</span>
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-3 flex-1 mb-8 relative z-10">
            {proFeatures.map(f => (
              <li key={f} className="text-sm text-zinc-300 flex items-center gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center text-red-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-zinc-500">{getFeatureIcon(f)}</span>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/kayit"
            className="relative z-10 mt-auto rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3.5 text-center text-sm font-bold text-white hover:from-red-500 hover:to-red-400 transition-all duration-200 shadow-lg shadow-red-900/40"
          >
            {t('cta')}
          </Link>
        </div>

        {/* ─── Enterprise ─── */}
        <div className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.15] hover:from-white/[0.08] hover:to-white/[0.03]">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">{t('enterpriseName')}</p>
            <p className="text-sm text-zinc-500 mb-5">{t('enterpriseDesc')}</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-4xl font-bold text-white tracking-tight">{t('customPrice')}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-500" />
              {t('enterpriseContact')}
            </p>
          </div>

          <ul className="flex flex-col gap-3 flex-1 mb-8">
            {enterpriseFeatures.map(f => (
              <li key={f} className="text-sm text-zinc-400 flex items-center gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-zinc-600">{getFeatureIcon(f)}</span>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <a
            href={`mailto:merhaba@checkrezerve.com?subject=${t('enterpriseEmailSubject')}`}
            className="mt-auto rounded-xl border border-white/15 py-3.5 text-center text-sm font-semibold text-white bg-white/[0.04] hover:bg-white hover:text-zinc-900 transition-all duration-200"
          >
            {t('enterpriseCta')}
          </a>
        </div>

      </div>
    </>
  )
}
