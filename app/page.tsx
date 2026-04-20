import type { Metadata } from 'next'
import { PricingToggle } from './PricingToggle'
import DemoCarousel from '../components/DemoCarousel'

export const metadata: Metadata = {
  title: 'checkrezerve — Akıllı Randevu & Rezervasyon Sistemi',
  description:
    'Restoran, berber, kuaför, psikolog ve daha fazlası için WhatsApp entegrasyonlu akıllı randevu sistemi. %0 komisyon. 10 dakikada kur.',
  keywords: [
    'online randevu sistemi',
    'restoran rezervasyon',
    'berber randevu',
    'kuaför randevu',
    'psikolog randevu',
    'whatsapp randevu',
    'randevu yönetimi',
    'checkrezerve',
  ],
  openGraph: {
    title: 'checkrezerve — Her sektör için akıllı randevu sistemi',
    description: 'WhatsApp hatırlatmalı, komisyonsuz, 10 dakikada canlı. Restoran\'dan berbere, kuaförden psikoloğa.',
    type: 'website',
    locale: 'tr_TR',
    url: 'https://checkrezerve.com',
  },
}

// ─── Sector SVG icons ─────────────────────────────────────────────────────────
const IconUtensils = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6h4v7"/>
  </svg>
)

const IconScissors = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/>
    <circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
)

const IconComb = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2h14a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
    <path d="M8 7v13"/>
    <path d="M12 7v13"/>
    <path d="M16 7v13"/>
  </svg>
)

const IconBrain = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.24Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.24Z"/>
  </svg>
)

const IconLeaf = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
)

const IconSparkles = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    <path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>
  </svg>
)

const IconTooth = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5.5C12 3.6 10.4 2 8.5 2S5 3.6 5 5.5c0 .7.2 1.3.5 1.8L6 9c.5 2 .5 4.5.5 5.5 0 2.5.7 4.5 2 4.5s1.5-1 2-1.5.7-1.5 1.5-1.5 1 1 1.5 1.5 1 1.5 2 1.5 2-2 2-4.5c0-1 0-3.5.5-5.5l.5-1.7c.3-.5.5-1.1.5-1.8C21 3.6 19.4 2 17.5 2S14 3.6 14 5.5"/>
    <path d="M12 5.5v3"/>
  </svg>
)

const IconDumbbell = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11"/>
    <path d="M6.5 17.5h11"/>
    <path d="M12 6.5v11"/>
    <rect x="4" y="5" width="3" height="14" rx="1.5"/>
    <rect x="17" y="5" width="3" height="14" rx="1.5"/>
    <rect x="2" y="8" width="2" height="8" rx="1"/>
    <rect x="20" y="8" width="2" height="8" rx="1"/>
  </svg>
)

const IconPaw = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="4" r="2"/>
    <circle cx="18" cy="8" r="2"/>
    <circle cx="20" cy="16" r="2"/>
    <circle cx="4" cy="16" r="2"/>
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>
  </svg>
)
// ─────────────────────────────────────────────────────────────────────────────

const SECTORS = [
  { icon: <IconUtensils className="w-7 h-7" />, label: 'Restoran',   color: 'bg-orange-50  text-orange-600  border-orange-100'  },
  { icon: <IconScissors className="w-7 h-7" />, label: 'Berber',     color: 'bg-blue-50    text-blue-600    border-blue-100'    },
  { icon: <IconComb     className="w-7 h-7" />, label: 'Kuaför',     color: 'bg-pink-50    text-pink-600    border-pink-100'    },
  { icon: <IconBrain    className="w-7 h-7" />, label: 'Psikolog',   color: 'bg-purple-50  text-purple-600  border-purple-100'  },
  { icon: <IconLeaf     className="w-7 h-7" />, label: 'Spa',        color: 'bg-teal-50    text-teal-600    border-teal-100'    },
  { icon: <IconSparkles className="w-7 h-7" />, label: 'Güzellik',   color: 'bg-rose-50    text-rose-600    border-rose-100'    },
  { icon: <IconTooth    className="w-7 h-7" />, label: 'Diş Hekimi', color: 'bg-sky-50     text-sky-600     border-sky-100'     },
  { icon: <IconDumbbell className="w-7 h-7" />, label: 'Fitness',    color: 'bg-green-50   text-green-600   border-green-100'   },
  { icon: <IconPaw      className="w-7 h-7" />, label: 'Veteriner',  color: 'bg-amber-50   text-amber-600   border-amber-100'   },
]

const FEATURES = [
  {
    icon: '💬',
    badge: 'YENİ',
    title: 'WhatsApp Otomasyonu',
    desc: 'Randevu/rezervasyon anında onay mesajı, gün gelince hatırlatma. Konum linki ve iptal butonu otomatik gider.',
  },
  {
    icon: '📅',
    badge: null,
    title: 'Akıllı Takvim Yönetimi',
    desc: 'Çakışma yok, mükerrer kayıt yok. Her personelin müsaitlik takvimi ayrı ayrı yönetilir.',
  },
  {
    icon: '🤖',
    badge: 'AI',
    title: 'Mesajdan Otomatik Kayıt',
    desc: '"Yarın saat 14\'te randevu istiyorum" yazan WhatsApp mesajını Claude AI çözümler, sisteme kaydeder.',
  },
  {
    icon: '📊',
    badge: null,
    title: 'Haftalık Raporlama',
    desc: 'Doluluk oranı, gelir özeti, iptal yüzdesi — haftalık CSV raporu tek tıkla indir.',
  },
  {
    icon: '🔗',
    badge: null,
    title: 'Kişisel Randevu Linki',
    desc: 'checkrezerve.com/isyeriniz — Instagram bio\'dan WhatsApp\'a, her yere koyun. QR kod hazır.',
  },
  {
    icon: '🔐',
    badge: null,
    title: 'Rol Bazlı Erişim',
    desc: 'Her personel sadece kendi randevularını görür. Yönetici tüm takvimi kontrol eder. KVKK uyumlu.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'Müşterilerime artık "sizi arayacağım" demiyorum. Link gönderiyorum, randevu geliyor. Çok pratik.',
    name: 'Hüseyin K.',
    business: 'HK Berber, Kadıköy',
    icon: <IconScissors className="w-5 h-5" />,
    iconBg: 'bg-blue-500/20 text-blue-300',
  },
  {
    quote: 'Seans saatini unutan danışan yoktu artık. WhatsApp hatırlatması hayat kurtarıyor.',
    name: 'Dr. Elif T.',
    business: 'Psikoloji Danışmanlık, Ankara',
    icon: <IconBrain className="w-5 h-5" />,
    iconBg: 'bg-purple-500/20 text-purple-300',
  },
  {
    quote: 'Hafta sonu cam kenarı masalarımız hep doluyordu ama bilmiyorduk. Artık ayrı takip ediyoruz.',
    name: 'Mehmet A.',
    business: 'Bosphorus Restaurant, İstanbul',
    icon: <IconUtensils className="w-5 h-5" />,
    iconBg: 'bg-orange-500/20 text-orange-300',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">

      {/* ── Navigasyon ──────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CR</span>
            </div>
            <span className="text-base font-bold tracking-tight">checkrezerve</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
            <a href="#sectors"  className="hover:text-zinc-900 transition-colors">Sektörler</a>
            <a href="#features" className="hover:text-zinc-900 transition-colors">Özellikler</a>
            <a href="#how"      className="hover:text-zinc-900 transition-colors">Nasıl Çalışır</a>
            <a href="#pricing"  className="hover:text-zinc-900 transition-colors">Fiyatlar</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/admin" className="hidden sm:block text-sm text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-1.5">
              Giriş Yap
            </a>
            <a
              href="/kayit"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition-colors"
            >
              Sisteme Katıl
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="pt-36 pb-16 px-6 text-center">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-8">

          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50
                          px-4 py-1.5 text-xs font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Sistem aktif · 9 sektörde randevu yönetimi
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
            Her sektör için{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              akıllı randevu sistemi.
            </span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-zinc-500 leading-relaxed">
            Restorandan berbere, kuaförden psikoloğa — işletmenize özel link,{' '}
            <strong className="text-zinc-700">otomatik WhatsApp bildirimi</strong>,
            personel takvimi ve haftalık raporlama. Hepsi tek sistemde. Komisyon yok.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <a
              href="/kayit"
              className="w-full sm:w-auto rounded-full bg-zinc-900 px-8 py-4 text-sm font-semibold
                         text-white hover:bg-amber-500 transition-colors shadow-lg shadow-zinc-900/10"
            >
              Sisteme Katıl →
            </a>
            <a
              href="/nusret"
              className="w-full sm:w-auto rounded-full border border-zinc-200 px-8 py-4 text-sm
                         font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Canlı Demo&apos;yu Gör
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-100 w-full">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Anında Kurulum',
                desc: 'Teknik bilgi gerektirmeden 10 dakikada paneliniz hazır.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ),
                title: 'Akıllı Bildirimler',
                desc: 'WhatsApp ve SMS ile otomatik rezervasyon hatırlatmaları.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: 'Esnek Sektörler',
                desc: 'Restoran, Berber veya Psikolog; işinize göre özelleşen panel.',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Modern Arayüz',
                desc: 'Müşterileriniz için mobil uyumlu, hızlı rezervasyon deneyimi.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-left">
                <div className="w-9 h-9 rounded-xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                  {icon}
                </div>
                <p className="text-sm font-semibold text-zinc-800">{title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sektörler ───────────────────────────────────────────────── */}
      <section id="sectors" className="py-20 px-6 bg-zinc-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Sektörünüz ne olursa olsun
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Her iş kolunun ihtiyacına göre özelleştirilmiş randevu akışı, terminoloji ve bildirim şablonları.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {SECTORS.map(({ icon, label, color }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 cursor-default
                            hover:-translate-y-0.5 hover:shadow-sm transition-all ${color}`}
              >
                <div className="w-7 h-7 flex items-center justify-center">{icon}</div>
                <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Sektöre özel fark gösterimi */}
          <div className="mt-12 grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: <IconUtensils className="w-5 h-5" />,
                iconBg: 'bg-orange-50 text-orange-600',
                title: 'Restoran & Kafe',
                items: ['Masa & kişi sayısı', 'Cam kenarı / VIP alan takibi', 'Özel gün notu'],
              },
              {
                icon: <IconScissors className="w-5 h-5" />,
                iconBg: 'bg-blue-50 text-blue-600',
                title: 'Berber & Kuaför',
                items: ['Hizmet seçimi (kesim, boyama…)', 'Usta/personel tercih', 'Seans süresi otomatik'],
              },
              {
                icon: <IconBrain className="w-5 h-5" />,
                iconBg: 'bg-purple-50 text-purple-600',
                title: 'Psikolog & Terapist',
                items: ['Seans türü seçimi', '50/60/90 dk seans planı', 'Gizlilik ön plana, KVKK uyumlu'],
              },
            ].map(({ icon, iconBg, title, items }) => (
              <div key={title} className="rounded-2xl bg-white border border-zinc-100 p-6 hover:border-zinc-200 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
                  {icon}
                </div>
                <h3 className="font-semibold text-zinc-900 mb-3">{title}</h3>
                <ul className="flex flex-col gap-2">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-500">
                      <span className="text-amber-500 text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Carousel ───────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <DemoCarousel />
      </section>

      {/* ── Özellikler ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-zinc-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              İşletmenize özel her şey
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Telefonda kayıt alma, kağıda yazma, unutulan randevu devri kapandı.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, badge, title, desc }) => (
              <div
                key={title}
                className="relative flex flex-col gap-3 rounded-2xl bg-white border border-zinc-100
                           p-6 hover:border-zinc-200 hover:shadow-sm transition-all"
              >
                {badge && (
                  <span className="absolute top-4 right-4 rounded-full bg-amber-100 px-2 py-0.5
                                   text-[10px] font-bold text-amber-700">
                    {badge}
                  </span>
                )}
                <span className="text-3xl">{icon}</span>
                <h3 className="font-semibold text-zinc-900">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Güvenlik ────────────────────────────────────────────────── */}
      <section id="security" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-10 sm:p-16
                          flex flex-col sm:flex-row items-center gap-10">
            <div className="flex-1 flex flex-col gap-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl">
                🔐
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                Müşteri verileri<br />sadece <span className="text-amber-400">size aittir.</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Psikolog için hasta gizliliği, restoran için müşteri verisi — her sektörün gizlilik
                ihtiyacına göre izole edilmiş veri yapısı. KVKK tam uyumlu.
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  'Rol bazlı erişim kontrolü (RBAC)',
                  'TLS/SSL şifreli bağlantı',
                  'KVKK uyumlu veri saklama',
                  'İşletme bazında veri izolasyonu',
                  'Dışa aktarım denetim kaydı',
                  'HTTPOnly güvenli oturum çerezleri',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-amber-400 text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full sm:w-72 flex-shrink-0">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-zinc-400">Rol Bazlı Erişim</span>
                </div>
                {[
                  { role: 'Süper Admin',     access: 'Tüm işletmeler',       color: 'bg-amber-500' },
                  { role: 'İşletme Yönet.',  access: 'Sadece kendi verisi',  color: 'bg-blue-500'  },
                  { role: 'Personel',        access: 'Kendi randevuları',    color: 'bg-green-500' },
                  { role: 'Müşteri',         access: 'Sadece formu',         color: 'bg-zinc-500'  },
                ].map(({ role, access, color }) => (
                  <div key={role} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                    <div>
                      <div className="text-xs font-medium text-white">{role}</div>
                      <div className="text-[10px] text-zinc-500">{access}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nasıl Çalışır ───────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6 bg-zinc-50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bugün başlayın</h2>
            <p className="text-zinc-500">Teknik bilgi gerekmez. 10 dakikada canlı.</p>
          </div>
          <div className="relative">
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%-1px)] right-[calc(16.67%-1px)] h-px bg-zinc-200" />
            <div className="grid sm:grid-cols-3 gap-10">
              {[
                {
                  step: '1',
                  title: 'Demo İsteyin',
                  desc: 'Sektörünüzü ve işletme bilgilerinizi paylaşın, 24 saat içinde sisteminiz hazır olsun.',
                },
                {
                  step: '2',
                  title: 'Linki Paylaşın',
                  desc: 'Instagram, Google, WhatsApp, Linktree — randevu linkinizi nereye koyarsanız oradan gelir.',
                },
                {
                  step: '3',
                  title: 'Sistem Çalışsın',
                  desc: 'Onay ve hatırlatma mesajları otomatik gider. Siz sadece paneli izleyin.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center gap-4">
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-zinc-900 flex items-center
                                  justify-center shadow-lg shadow-zinc-900/10">
                    <span className="text-xl font-bold text-white">{step}</span>
                  </div>
                  <h3 className="font-semibold text-zinc-900">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WhatsApp Önizleme ────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600">
              Otomatik Bildirimler
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3 mb-4 leading-snug">
              Müşterileriniz unutmaz,<br />randevular kaçmaz.
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-6">
              Randevu anında <strong>onay mesajı</strong>, gün gelince{' '}
              <strong>hatırlatma mesajı</strong> otomatik WhatsApp ile gider.
              Berber, kuaför, psikolog — tüm sektörler için özel mesaj şablonları.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                '✅ Anlık onay + Google Maps konum linki',
                '🔔 Randevu günü hatırlatma (özelleştirilebilir saat)',
                '❌ Tek tıkla iptal bağlantısı',
                '💬 Twilio WhatsApp Business API',
                '🌍 Türkçe mesaj şablonları, sektöre özel',
              ].map(item => (
                <li key={item} className="text-sm text-zinc-700">{item}</li>
              ))}
            </ul>
          </div>

          {/* WhatsApp mockup */}
          <div className="w-full sm:w-80 flex-shrink-0">
            <div className="bg-[#ECE5DD] rounded-3xl p-4 space-y-3">
              <div className="flex items-center gap-2 bg-[#075E54] rounded-2xl px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <IconScissors className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Elit Kuaför Salonu</div>
                  <div className="text-[10px] text-white/70">checkrezerve</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Merhaba Zeynep 👋<br /><br />
                  <strong>✅ Randevunuz onaylandı!</strong><br />
                  ✂️ <strong>Elit Kuaför Salonu</strong><br /><br />
                  📅 12 Nisan Pazar • 🕐 14:30<br />
                  💇 Saç Kesimi · 45 dk<br /><br />
                  📍 <span className="text-blue-600 underline">Konumu Görüntüle</span>
                </p>
                <p className="text-[9px] text-zinc-400 text-right mt-1">14:23 ✓✓</p>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm">
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Merhaba Zeynep 👋<br /><br />
                  <strong>🔔 Bugün randevunuz var!</strong><br />
                  🕐 Saat: 14:30 · ✂️ Saç Kesimi<br /><br />
                  📍 <span className="text-blue-600 underline">Konum</span>
                  {'  '}❌ <span className="text-blue-600 underline">İptal Et</span>
                </p>
                <p className="text-[9px] text-zinc-400 text-right mt-1">09:00 ✓✓</p>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-400 mt-3">
              Otomatik WhatsApp mesajları böyle görünür
            </p>
          </div>
        </div>
      </section>

      {/* ── Müşteriler için ─────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600">
              Müşteriler İçin
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Rezervasyon artık 3 adımda.
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Arama, seçme, onay. Telefon görüşmesi yok, bekleme yok.
              Tüm işletmeler tek uygulamada.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {[
              {
                step: '1',
                emoji: '🔍',
                title: 'İşletme Bul',
                desc: 'Restoran, berber, spa veya psikolog — şehirdeki tüm işletmeleri göz at, filtrele, karşılaştır.',
              },
              {
                step: '2',
                emoji: '📅',
                title: 'Tarih & Saat Seç',
                desc: 'Müsait slotlar anlık güncellenir. Dolu saatler gri, boş saatler yeşil — kafa karışıklığı yok.',
              },
              {
                step: '3',
                emoji: '✅',
                title: 'Onayla & Git',
                desc: 'Rezervasyonunuz anında onaylanır, SMS ile bilgilendirilirsiniz. Randevularınızı uygulama üzerinden takip edin.',
              },
            ].map(({ step, emoji, title, desc }) => (
              <div key={step} className="flex flex-col gap-4 rounded-2xl bg-white border border-zinc-100 p-6 hover:border-zinc-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">{step}</span>
                  </div>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <h3 className="font-semibold text-zinc-900">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-8 sm:p-12 text-center text-white">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">
              Uygulama yakında App Store&apos;da
            </h3>
            <p className="text-white/80 max-w-md mx-auto mb-6 leading-relaxed">
              iOS ve Android için checkrezerve uygulaması — tüm randevularınız tek yerde,
              SMS bildirim, geçmiş görüntüleme ve iptal hepsi dahil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="rounded-2xl bg-black/30 border border-white/20 px-6 py-3 text-sm font-semibold backdrop-blur-sm cursor-default">
                🍎 App Store — Yakında
              </div>
              <div className="rounded-2xl bg-black/30 border border-white/20 px-6 py-3 text-sm font-semibold backdrop-blur-sm cursor-default">
                🤖 Google Play — Yakında
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Referanslar ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-900 text-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">İşletmeler ne diyor?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, business, icon, iconBg }) => (
              <div key={name} className="flex flex-col gap-4 rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                  {icon}
                </div>
                <span className="text-amber-400 text-2xl -mt-2">&ldquo;</span>
                <p className="text-sm text-zinc-300 leading-relaxed">{quote}</p>
                <div className="mt-auto pt-4 border-t border-white/10">
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-zinc-500">{business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fiyatlandırma ───────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Şeffaf fiyatlandırma</h2>
            <p className="text-zinc-500">Komisyon yok. Saklı ücret yok. İşletmenizin ölçeğine göre seçin.</p>
          </div>
          <PricingToggle />
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6 bg-amber-50 border-y border-amber-100">
        <div className="mx-auto max-w-2xl text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-2xl">
            📅
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold">
            İşletmenizi sisteme ekleyelim.
          </h2>
          <p className="text-zinc-600 max-w-md">
            Restoran, berber, kuaför, psikolog — sektörünüz ne olursa olsun
            24 saat içinde randevu linkiniz hazır. Teknik bilgi gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="mailto:merhaba@checkrezerve.com?subject=Demo İstiyorum&body=İşletme Adı:%0D%0ASektör:%0D%0ATelefon:%0D%0AŞehir:"
              className="rounded-full bg-zinc-900 px-8 py-4 text-sm font-semibold text-white
                         hover:bg-amber-500 transition-colors shadow-lg shadow-zinc-900/10 text-center"
            >
              Hemen Demo İste →
            </a>
            <a
              href="/admin"
              className="rounded-full border border-zinc-300 px-8 py-4 text-sm font-semibold
                         text-zinc-700 hover:bg-white transition-colors text-center"
            >
              Giriş Yap
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">CR</span>
              </div>
              <span className="text-sm font-bold">checkrezerve</span>
            </div>
            <p className="text-xs text-zinc-400 text-center">
              Türkiye&apos;nin çok sektörlü randevu altyapısı. © 2026 Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-xs text-zinc-400">
              <a href="/gizlilik"          className="hover:text-zinc-700 transition-colors">Gizlilik</a>
              <a href="/kullanim-sartlari" className="hover:text-zinc-700 transition-colors">Kullanım Şartları</a>
              <a href="mailto:merhaba@checkrezerve.com" className="hover:text-zinc-700 transition-colors">İletişim</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
