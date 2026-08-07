import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { PricingToggle } from '../PricingToggle'
import FAQSection from '../FAQSection'
import { Link } from '@/i18n/navigation'
import { Map, Bot, Sparkles, QrCode, ShieldCheck, Ban, Undo2, Phone, Lock, Flag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fiyatlar — CheckRezerve',
  description:
    'Komisyon yok, gizli ücret yok. Küçük işletmeden zincir restoran operasyonlarına kadar her büyüklük için şeffaf fiyatlandırma.',
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const p = await getTranslations('pricing')

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="pt-32 pb-12 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block bg-white/5 border border-white/10 text-zinc-400 text-[11px] font-semibold px-4 py-1.5 rounded-full tracking-[0.12em] uppercase mb-6">
            {p('pageHeroLabel')}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
            {p('pageTitle')}
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {p('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* ── Pricing Cards + Toggle ── */}
      <section className="pb-10 px-6">
        <div className="mx-auto max-w-5xl">
          <PricingToggle />
        </div>
      </section>

      {/* ── Feature Highlights Grid ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight"
              style={{ fontFamily: 'var(--font-outfit)' }}>
              Her Şey Dahil
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              CheckRezerve ile işletmenizi bir üst seviyeye taşıyacak tüm araçlar tek platformda.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Card 1 — Kroki */}
            <div className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 sm:p-8 hover:bg-white/[0.08] hover:border-red-500/30 transition-all duration-300 overflow-hidden">
              {/* Illus tration — floor plan */}
              <div className="absolute -top-10 -right-10 w-48 h-48 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-red-400">
                  <rect x="15" y="15" width="170" height="170" rx="12" stroke="currentColor" strokeWidth="0.5" />
                  <rect x="35" y="35" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="0.4" fill="currentColor" fillOpacity="0.05" />
                  <rect x="110" y="35" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="0.4" fill="currentColor" fillOpacity="0.05" />
                  <rect x="35" y="110" width="40" height="60" rx="4" stroke="currentColor" strokeWidth="0.4" fill="currentColor" fillOpacity="0.05" />
                  <rect x="90" y="110" width="80" height="40" rx="4" stroke="currentColor" strokeWidth="0.4" fill="currentColor" fillOpacity="0.05" />
                  <circle cx="55" cy="55" r="8" stroke="currentColor" strokeWidth="0.3" fill="currentColor" fillOpacity="0.08" />
                  <circle cx="130" cy="55" r="8" stroke="currentColor" strokeWidth="0.3" fill="currentColor" fillOpacity="0.08" />
                  <path d="M55 110v10M55 120h40" stroke="currentColor" strokeWidth="0.3" />
                </svg>
              </div>
              {/* Accent glow */}
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-red-500/5 blur-[60px]" />
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform relative">
                <Map size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 relative">Kroki Özelliği</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4 relative">
                İşletmenize özel interaktif masa, alan veya salon yerleşim planı.
              </p>
              <ul className="space-y-2 relative">
                {['Sürükle-bırak masa düzenleme', 'Gerçek zamanlı müsaitlik göstergesi', 'Mobil ve masaüstü uyumlu'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <span className="w-1 h-1 rounded-full bg-red-500/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Card 2 — Chatbot */}
            <div className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 sm:p-8 hover:bg-white/[0.08] hover:border-red-500/30 transition-all duration-300 overflow-hidden">
              {/* Illustration — chat bubbles */}
              <div className="absolute -bottom-6 -right-6 w-44 h-44 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-red-400">
                  <path d="M30 80c0-20 16-36 36-36h68c20 0 36 16 36 36v40c0 20-16 36-36 36h-20l-28 24v-24h-20c-20 0-36-16-36-36V80z" stroke="currentColor" strokeWidth="0.5" fill="currentColor" fillOpacity="0.04" />
                  <circle cx="85" cy="95" r="4" fill="currentColor" fillOpacity="0.1" />
                  <circle cx="105" cy="95" r="4" fill="currentColor" fillOpacity="0.1" />
                  <circle cx="125" cy="95" r="4" fill="currentColor" fillOpacity="0.1" />
                  <path d="M85 115c5 6 20 6 25 0" stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" />
                  <path d="M45 50l10-10M155 50l-10-10" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
                  <circle cx="25" cy="20" r="3" fill="currentColor" fillOpacity="0.05" />
                  <circle cx="175" cy="25" r="2" fill="currentColor" fillOpacity="0.05" />
                </svg>
              </div>
              <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-red-500/5 blur-[50px]" />
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform relative">
                <Bot size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 relative">Yapay Zeka Chatbot</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4 relative">
                7/24 otomatik rezervasyon alan, müşteri sorularını yanıtlayan akıllı asistan.
              </p>
              <ul className="space-y-2 relative">
                {['Doğal dil ile rezervasyon', 'Sohbet üzerinden takvim görüntüleme', 'WhatsApp & web entegrasyonu'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <span className="w-1 h-1 rounded-full bg-red-500/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Card 3 — Premium Otomasyon */}
            <div className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 sm:p-8 hover:bg-white/[0.08] hover:border-red-500/30 transition-all duration-300 overflow-hidden">
              {/* Illustration — automation flow */}
              <div className="absolute -top-12 -left-12 w-52 h-52 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-red-400">
                  <circle cx="40" cy="50" r="16" stroke="currentColor" strokeWidth="0.5" fill="currentColor" fillOpacity="0.04" />
                  <circle cx="160" cy="50" r="16" stroke="currentColor" strokeWidth="0.5" fill="currentColor" fillOpacity="0.04" />
                  <circle cx="100" cy="140" r="16" stroke="currentColor" strokeWidth="0.5" fill="currentColor" fillOpacity="0.04" />
                  <path d="M56 50l88 0M68 60l26 66M132 60l-26 66" stroke="currentColor" strokeWidth="0.4" />
                  <circle cx="40" cy="50" r="4" fill="currentColor" fillOpacity="0.15" />
                  <circle cx="160" cy="50" r="4" fill="currentColor" fillOpacity="0.15" />
                  <circle cx="100" cy="140" r="4" fill="currentColor" fillOpacity="0.15" />
                  <path d="M20 18l15-8M20 18l8 15" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
                  <path d="M180 18l-15-8M180 18l-8 15" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
                </svg>
              </div>
              <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-red-500/5 blur-[50px]" />
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform relative">
                <Sparkles size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 relative">Premium İşletme Otomasyonu</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4 relative">
                Hatırlatma zincirleri, otomatik onay akışları ve akıllı iş akışları.
              </p>
              <ul className="space-y-2 relative">
                {['SMS/E-posta hatırlatma zinciri', 'Tek tıkla toplu onay/red', 'Akıllı zamanlama & kapasite yönetimi'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <span className="w-1 h-1 rounded-full bg-red-500/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Card 4 — Karekod */}
            <div className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 sm:p-8 hover:bg-white/[0.08] hover:border-red-500/30 transition-all duration-300 overflow-hidden">
              {/* Illustration — QR + menu */}
              <div className="absolute -bottom-8 -right-8 w-44 h-44 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-red-400">
                  <rect x="20" y="20" width="70" height="70" rx="6" stroke="currentColor" strokeWidth="0.5" fill="currentColor" fillOpacity="0.03" />
                  <rect x="30" y="30" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.1" />
                  <rect x="50" y="30" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.1" />
                  <rect x="70" y="30" width="10" height="12" rx="2" fill="currentColor" fillOpacity="0.08" />
                  <rect x="30" y="50" width="12" height="10" rx="2" fill="currentColor" fillOpacity="0.08" />
                  <rect x="50" y="50" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.1" />
                  <rect x="30" y="70" width="12" height="10" rx="2" fill="currentColor" fillOpacity="0.08" />
                  <rect x="120" y="20" width="60" height="8" rx="2" fill="currentColor" fillOpacity="0.08" />
                  <rect x="120" y="38" width="50" height="6" rx="2" fill="currentColor" fillOpacity="0.05" />
                  <rect x="120" y="54" width="40" height="6" rx="2" fill="currentColor" fillOpacity="0.05" />
                  <rect x="120" y="70" width="55" height="6" rx="2" fill="currentColor" fillOpacity="0.05" />
                  <rect x="30" y="100" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.1" />
                  <rect x="50" y="100" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.1" />
                  <rect x="70" y="100" width="10" height="12" rx="2" fill="currentColor" fillOpacity="0.08" />
                  <rect x="30" y="120" width="50" height="10" rx="2" fill="currentColor" fillOpacity="0.08" />
                  <rect x="100" y="100" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="0.3" />
                  <rect x="140" y="100" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="0.3" />
                  <rect x="100" y="150" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="0.3" />
                </svg>
              </div>
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-red-500/5 blur-[50px]" />
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform relative">
                <QrCode size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-3 relative">Karekod Sticker & Online Menü</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4 relative">
                Masalara özel fiziksel karekod sticker ve dijital menü/rezervasyon.
              </p>
              <ul className="space-y-2 relative">
                {['Bas-çıkart sticker çözümleri', 'Anında dijital menü güncelleme', 'Rezervasyon + sipariş tek karekodda'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <span className="w-1 h-1 rounded-full bg-red-500/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise / Custom Section ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-red-500/[0.04] p-10 sm:p-14 text-center overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-red-500/10 blur-[100px]" />
            <div className="relative z-10">
              <span className="inline-block bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                ✦ {p('enterpriseName')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Size Özel Çözümler</h2>
              <p className="text-zinc-400 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
                Zincir restoran, otel grubu veya çok şubeli işletme misiniz? Ekibimiz sizinle iletişime geçsin, ihtiyaçlarınıza özel bir paket oluşturalım.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:destek@checkrezerve.com?subject=Kurumsal Paket Teklifi"
                  className="rounded-full bg-red-600 hover:bg-red-500 px-9 py-3.5 text-sm font-bold text-white transition-colors shadow-lg shadow-red-900/30 w-full sm:w-auto text-center"
                >
                  {p('enterpriseCta')} →
                </a>
                <Link
                  href="/kayit"
                  className="rounded-full border border-white/20 text-zinc-300 hover:text-white hover:border-white/40 px-9 py-3.5 text-sm font-semibold transition-colors w-full sm:w-auto text-center"
                >
                  {p('cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Comparison Matrix ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Tüm Özellikleri Karşılaştırın</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Planınızda hangi özelliklerin olduğunu detaylıca görün.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-4 pr-6 text-zinc-400 font-semibold text-xs uppercase tracking-wider">Özellik</th>
                  <th className="py-4 px-4 text-center text-zinc-400 font-semibold text-xs uppercase tracking-wider w-[120px]">
                    <span className="text-zinc-500">{p('starterName')}</span>
                  </th>
                  <th className="py-4 px-4 text-center text-zinc-400 font-semibold text-xs uppercase tracking-wider w-[120px]">
                    <span className="text-red-500">{p('proName')}</span>
                  </th>
                  <th className="py-4 px-4 text-center text-zinc-400 font-semibold text-xs uppercase tracking-wider w-[120px]">
                    <span className="text-zinc-500">{p('enterpriseName')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Category: Rezervasyon Yönetimi */}
                <tr className="border-b border-white/[0.04]">
                  <td colSpan={4} className="py-5 pr-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Rezervasyon Yönetimi & Temel Özellikler
                  </td>
                </tr>
                {[
                  { name: 'Rezervasyon Yönetimi', s: true, p: true, e: true },
                  { name: 'Müşteri Kaydı (CRM)', s: true, p: true, e: true },
                  { name: 'Temel Raporlama', s: true, p: true, e: true },
                  { name: 'Masa / Alan Yönetimi', s: true, p: true, e: true },
                  { name: 'Ön Ödemeli Rezervasyon', s: true, p: true, e: true },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-white/[0.03]">
                    <td className="py-3.5 pr-6 text-zinc-300">{row.name}</td>
                    <td className="py-3.5 px-4 text-center">{row.s ? <Check /> : <Dash />}</td>
                    <td className="py-3.5 px-4 text-center">{row.p ? <Check /> : <Dash />}</td>
                    <td className="py-3.5 px-4 text-center">{row.e ? <Check /> : <Dash />}</td>
                  </tr>
                ))}

                {/* Category: Gelişmiş Otomasyon */}
                <tr className="border-b border-white/[0.04]">
                  <td colSpan={4} className="py-5 pr-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Gelişmiş Otomasyon & Bildirimler
                  </td>
                </tr>
                {[
                  { name: 'SMS & E-posta Bildirimleri', s: true, p: true, e: true },
                  { name: 'Konfirmasyon & Onay Akışı', s: false, p: true, e: true },
                  { name: 'Rezervasyon Hatırlatma Zinciri', s: false, p: true, e: true },
                  { name: 'Bekleme Listesi (Waitlist)', s: false, p: true, e: true },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-white/[0.03]">
                    <td className="py-3.5 pr-6 text-zinc-300">{row.name}</td>
                    <td className="py-3.5 px-4 text-center">{row.s ? <Check /> : <Dash />}</td>
                    <td className="py-3.5 px-4 text-center">{row.p ? <Check /> : <Dash />}</td>
                    <td className="py-3.5 px-4 text-center">{row.e ? <Check /> : <Dash />}</td>
                  </tr>
                ))}

                {/* Category: Dijital Çözümler */}
                <tr className="border-b border-white/[0.04]">
                  <td colSpan={4} className="py-5 pr-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Dijital Çözümler & Kanallar
                  </td>
                </tr>
                {[
                  { name: 'Online Rezervasyon Sayfası', s: false, p: true, e: true },
                  { name: 'İnteraktif Kroki Özelliği', s: false, p: true, e: true },
                  { name: 'Yapay Zeka Chatbot Entegrasyonu', s: false, p: true, e: true },
                  { name: 'Karekod Menü & Sticker Desteği', s: false, p: true, e: true },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-white/[0.03]">
                    <td className="py-3.5 pr-6 text-zinc-300">{row.name}</td>
                    <td className="py-3.5 px-4 text-center">{row.s ? <Check /> : <Dash />}</td>
                    <td className="py-3.5 px-4 text-center">{row.p ? <Check /> : <Dash />}</td>
                    <td className="py-3.5 px-4 text-center">{row.e ? <Check /> : <Dash />}</td>
                  </tr>
                ))}

                {/* Category: Kurumsal */}
                <tr className="border-b border-white/[0.04]">
                  <td colSpan={4} className="py-5 pr-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Kurumsal & Altyapı
                  </td>
                </tr>
                {[
                  { name: 'Gelişmiş Raporlama', s: false, p: true, e: true },
                  { name: 'Öncelikli Destek', s: false, p: 'Standard', e: 'Priority' },
                  { name: 'Çoklu Şube Yönetimi', s: false, p: false, e: true },
                  { name: 'API Entegrasyonu & Özel Entegrasyonlar', s: false, p: false, e: true },
                  { name: 'Caller ID', s: false, p: false, e: true },
                  { name: 'Pazarlama Araçları', s: false, p: false, e: true },
                  { name: 'Özel Müşteri Temsilcisi', s: false, p: false, e: true },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-white/[0.03]">
                    <td className="py-3.5 pr-6 text-zinc-300">{row.name}</td>
                    <td className="py-3.5 px-4 text-center">{typeof row.s === 'boolean' ? (row.s ? <Check /> : <Dash />) : <span className="text-[11px] text-zinc-500">{row.s}</span>}</td>
                    <td className="py-3.5 px-4 text-center">{typeof row.p === 'boolean' ? (row.p ? <Check /> : <Dash />) : <span className="text-[11px] text-red-400 font-semibold">{row.p}</span>}</td>
                    <td className="py-3.5 px-4 text-center">{typeof row.e === 'boolean' ? (row.e ? <Check /> : <Dash />) : <span className="text-[11px] text-red-400 font-semibold">{row.e}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="border-t border-white/[0.06] py-12 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { icon: Ban, label: 'Komisyon yok' },
              { icon: ShieldCheck, label: 'Gizli ücret yok' },
              { icon: Undo2, label: '30 gün iade garantisi' },
              { icon: Phone, label: 'Ücretsiz kurulum desteği' },
              { icon: Lock, label: 'Müşteri veriniz size ait' },
              { icon: Flag, label: 'Türkiye desteği, Türkçe panel' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <item.icon size={20} className="text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-400 leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-white mb-3">Sık Sorulan Sorular</h2>
            <p className="text-zinc-400">Her şeyi netleştiriyoruz.</p>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 via-red-600/5 to-transparent" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="mx-auto max-w-2xl relative z-10">
          <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            ✦ 14 gün ücretsiz
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            İşletmenizi dijitalleştirin
          </h2>
          <p className="text-zinc-400 mb-10 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            Kredi kartı gerekmez. Kurulum 5 dakika. İstediğinizde iptal edin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/kayit"
              className="rounded-full bg-red-600 hover:bg-red-500 px-9 py-4 text-base font-bold text-white transition-colors shadow-lg shadow-red-900/30 w-full sm:w-auto text-center"
            >
              Ücretsiz Başla →
            </Link>
            <Link
              href="/iletisim"
              className="rounded-full border border-white/20 text-zinc-300 hover:text-white hover:border-white/40 px-9 py-4 text-base font-semibold transition-colors w-full sm:w-auto text-center"
            >
              Demo İste
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-zinc-500 text-sm">
            <span>✓ 500+ İşletme</span>
            <span>✓ 50K+ Rezervasyon</span>
            <span>✓ %98 Memnuniyet</span>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

function Check() {
  return (
    <svg className="w-4 h-4 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function Dash() {
  return (
    <span className="text-zinc-600 text-xs mx-auto block">—</span>
  )
}
