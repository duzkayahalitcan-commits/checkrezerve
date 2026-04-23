import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'

export const metadata: Metadata = {
  title: 'Kullanım Alanları — CheckRezerve',
  description:
    'CheckRezerve rezervasyon altyapısını restoranlar, kafeler, oteller ve etkinlik mekanları için nasıl kullanabileceğinizi keşfedin.',
}

const AREAS = [
  {
    icon: '🍽️',
    title: 'Restoranlar',
    desc: 'Masa rezervasyonu, ön ödeme ve no-show yönetimi ile restoran operasyonlarınızı kontrol altına alın. Kroki üzerinden masa ataması, bölüm bazlı yönetim ve konfirmasyon talebi.',
  },
  {
    icon: '☕',
    title: 'Kafeler',
    desc: 'Yoğun saatlerde kapasite kontrolü yapın. Özel etkinlikler için alan rezervasyonu alın. Müşteri geçmişini CRM ile takip edin.',
  },
  {
    icon: '🏨',
    title: 'Oteller',
    desc: 'Restoran ve spa gibi tesisleriniz için rezervasyon alın. Misafirlerinizin deneyimini kişiselleştirin ve geri bildirim toplayın.',
  },
  {
    icon: '🎪',
    title: 'Etkinlik Mekanları',
    desc: 'Kapasite sınırlı etkinlikler için ön ödemeli rezervasyon alın. Waitlist yönetimiyle doluluk oranını maksimize edin.',
  },
]

export default function KullanimAlanlariPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <section className="pt-28 pb-16 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 mb-5 leading-tight">
            Her sektöre uygun<br />rezervasyon altyapısı
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            CheckRezerve&apos;i restoranlardan etkinlik mekanlarına, kafelerden otellere kadar
            her işletme tipinde kolayca kullanabilirsiniz.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {AREAS.map(a => (
              <div key={a.title}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8 hover:border-red-100 hover:shadow-sm transition-all duration-200">
                <div className="text-4xl mb-4">{a.icon}</div>
                <h2 className="text-xl font-bold text-zinc-900 mb-3">{a.title}</h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/kayit"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 text-sm font-semibold text-white transition-colors shadow-sm">
              Ücretsiz Deneyin →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-zinc-900 text-white py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">CR</span>
            </div>
            <span className="text-sm font-bold">CheckRezerve</span>
          </Link>
          <p className="text-xs text-zinc-500">© 2026 CheckRezerve Teknoloji</p>
        </div>
      </footer>
    </div>
  )
}
