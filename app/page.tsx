import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingHeader from '@/components/MarketingHeader'
import { PricingToggle } from './PricingToggle'
import FAQSection from './FAQSection'

export const metadata: Metadata = {
  title: 'CheckRezerve — Yeni Nesil Restoran Rezervasyon Altyapısı',
  description:
    'Rezervasyonlarınızı kontrol altına alın. No-show ve iptalleri azaltın, gelir kaybını durdurun. Komisyon yok.',
}

const FEATURES = [
  {
    icon: '📅',
    title: 'Rezervasyon Yönetimi',
    desc: 'Kolay ve hızlı rezervasyon oluşturma, düzenleme ve iptal işlemleri. Tek sayfadan tüm rezervasyonlarınızı yönetin.',
  },
  {
    icon: '💳',
    title: 'Ön Provizyon / Ön Ödeme Alma',
    desc: 'Rezervasyon sırasında ön ödeme alarak iptal riskini minimize edin. Güvenli ödeme entegrasyonları ile sorunsuz işlem yapın. Yerli ve yabancı tüm kredi kartlarından provizyon veya ödeme alabilirsiniz. Tüm işlemler 3D Secure sistemi ile gerçekleştirilir.',
  },
  {
    icon: '⭐',
    title: 'Deneyim Anketi Gönderimi',
    desc: 'Müşteri deneyimini ölçmek ve geri bildirim toplamak için otomatik anket gönderimi. Müşteri memnuniyetini artırın.',
  },
  {
    icon: '🗺️',
    title: 'Masa ve Alan Yönetimi',
    desc: 'Müşterileriniz masa ve alan seçimi yaparak rezervasyon oluşturabilir. Kroki üzerinden müşterinin oturacağı masa otomatik atanır.',
  },
  {
    icon: '🚫',
    title: 'Kara Liste Yönetimi',
    desc: 'Daha önce iptal yapan veya gelmeyen müşterileri kolayca engelleyebilirsiniz. No-show oranlarını düşürün.',
  },
  {
    icon: '📊',
    title: 'Raporlama ve Analitik',
    desc: 'Detaylı raporlar ve analizler ile işletmenizin performansını takip edin. Gelişmiş raporlama araçlarıyla doğru kararlar alın.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="pt-24 pb-24 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Yeni Nesil Rezervasyon Altyapısı
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Yeni Nesil Restoran<br />
            <span className="text-red-400">Rezervasyon Altyapısı</span>
          </h1>
          <p className="text-white/70 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
            Rezervasyonlarınızı kontrol altına alın. No-show ve iptalleri azaltın, gelir kaybını durdurun.
          </p>
          <p className="text-red-400 text-sm font-semibold mb-10">
            ✓ Rezervasyon ve no-show&apos;da komisyon yok.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kayit"
              className="rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 text-base font-semibold text-white transition-colors shadow-lg shadow-red-900/30">
              Ücretsiz Deneyin →
            </Link>
            <Link href="#fiyatlar"
              className="rounded-full border border-white/30 hover:border-white/60 px-8 py-4 text-base font-semibold text-white transition-colors">
              Fiyatları Gör
            </Link>
          </div>
        </div>
      </section>

      {/* ── No-show Odaklı ── */}
      <section className="py-20 bg-red-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 leading-snug">
                Kronik no-show sorununa<br />kalıcı bir çözüm
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Özellikle yoğun dönemlerde boş masaların can sıkıcı ve sinir bozucu olmasından
                kurtulmak için Ön Ödemeli Rezervasyon özelliğimizle no-show oranlarını büyük
                ölçüde azaltabilirsiniz.
              </p>
              <p className="text-zinc-600 leading-relaxed mb-8">
                Müşterilerinize sorumluluk yükleyen, sizi de maddi kayıplardan koruyan bu
                özelliği hemen kullanmaya başlayabilirsiniz.
              </p>
              <Link href="/kayit"
                className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors">
                Devamı →
              </Link>
            </div>

            <div className="flex-shrink-0 w-full lg:w-72 grid grid-cols-2 gap-4">
              {[
                { stat: '%60+', label: 'No-show azalması' },
                { stat: '%100', label: '3D Secure güvenlik' },
                { stat: '10 dk', label: 'Kurulum süresi' },
                { stat: '₺0', label: 'Komisyon' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl border border-red-100 p-5 text-center shadow-sm">
                  <div className="text-2xl font-bold text-red-600 mb-1">{item.stat}</div>
                  <div className="text-xs text-zinc-500 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ön Provizyon Açıklama ── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 leading-snug">
              Tek bir tıklama ile misafirlerinizden<br />provizyon / ön ödeme talep edin
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                step: '1',
                title: 'Link Gönder',
                desc: 'Rezervasyonu onaylamak için talep edeceğiniz provizyon veya ön ödeme için misafirinize bir link (bağlantı) gönderilir ve misafiriniz kart bilgilerini girerek işlemini kendisi gerçekleştirir.',
              },
              {
                step: '2',
                title: 'Provizyon Tutulur',
                desc: 'Alınan provizyon rezervasyon gününe kadar misafirin kredi kartında tutulur. Siz güvende, misafiriniz sorumlu.',
              },
              {
                step: '3',
                title: 'Check-in & İptal',
                desc: 'Misafir restoranınıza geldiği zaman check-in işlemi yapılır ve alınan provizyon otomatik olarak iptal edilir.',
              },
            ].map(item => (
              <div key={item.step} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-7">
                <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-500">
            Yerli ve Yabancı tüm kredi kartlarından provizyon veya ödeme alabilirsiniz.
            Yapılan tüm işlemler{' '}
            <strong className="text-zinc-700">3D Secure (Güvenli Ödeme)</strong> sistemi ile gerçekleştirilir.
          </p>
        </div>
      </section>

      {/* ── No-show Kayıp Telafi ── */}
      <section className="py-20 bg-zinc-900 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-snug">
              No-Show sebebi ile oluşan<br />
              <span className="text-red-400">kayıplarınızı telafi edin</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Müşterilerinizin hem rezervasyonu iptal etmediği hem de restoranınıza gelmediği durumlarda
              bloke edilen ücreti, satış işlemine (payment) dönüştürerek no-show nedeni ile yaşadığınız
              kayıpların azaltılması sağlayabilirsiniz.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-10">
              Misafirlerinize sorumluluk yükleyen, sizi de maddi kayıplardan koruyan Ön Ödeme
              özelliğini hemen kullanmaya başlayabilirsiniz.
            </p>
            <Link href="/kayit"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 text-sm font-semibold text-white transition-colors">
              Ücretsiz Deneyin →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section id="ozellikler" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Tüm ihtiyaçlarınız tek platformda
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              İşletmenizi büyütmek için ihtiyacınız olan tüm araçlar bir arada.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-7 hover:border-red-100 hover:shadow-sm transition-all duration-200">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fiyatlandırma ── */}
      <section id="fiyatlar" className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Şeffaf Fiyatlandırma</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Komisyon yok, gizli ücret yok. Yalnızca seçtiğiniz planın sabit abonelik ücreti.
            </p>
          </div>
          <PricingToggle />
        </div>
      </section>

      {/* ── SSS ── */}
      <section id="sss" className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Sık Sorulan Sorular</h2>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="iletisim" className="bg-zinc-900 text-white py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CR</span>
                </div>
                <span className="text-base font-bold">CheckRezerve</span>
              </div>
              <p className="text-sm text-zinc-400 leading-6 mb-4">
                Yeni nesil restoran rezervasyon altyapısı. Komisyon yok, kontrol tamamen sizde.
              </p>
              <a href="mailto:info@checkrezerve.com"
                className="text-sm text-zinc-400 hover:text-white transition-colors">
                info@checkrezerve.com
              </a>
              <p className="text-xs text-zinc-600 mt-3">© 2026 CheckRezerve Teknoloji</p>
            </div>

            {/* Hakkımızda */}
            <div id="hakkimizda">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Hakkımızda</h3>
              <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                <a href="#" className="hover:text-white transition-colors">Kurumsal</a>
                <a href="#" className="hover:text-white transition-colors">Başarı Hikayeleri</a>
                <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              </div>
            </div>

            {/* Kullanım Alanları */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Kullanım Alanları</h3>
              <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Restoranlar</Link>
                <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Kafeler</Link>
                <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Oteller</Link>
                <Link href="/kullanim-alanlari" className="hover:text-white transition-colors">Etkinlik Mekanları</Link>
              </div>
            </div>

            {/* Özellikler */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Özellikler</h3>
              <div className="flex flex-col gap-2.5 text-sm text-zinc-400">
                <a href="#ozellikler" className="hover:text-white transition-colors">Ön Ödemeli Rezervasyon</a>
                <a href="#ozellikler" className="hover:text-white transition-colors">Rezervasyon Yönetimi</a>
                <a href="#ozellikler" className="hover:text-white transition-colors">Masa Yönetimi</a>
                <a href="#ozellikler" className="hover:text-white transition-colors">CRM & Raporlama</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">Tüm hakları saklıdır. CheckRezerve Teknoloji.</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
              <Link href="/kullanim-kosullari" className="hover:text-zinc-300 transition-colors">Kullanım Koşulları</Link>
              <Link href="/cerez-politikasi" className="hover:text-zinc-300 transition-colors">Çerez Aydınlatma</Link>
              <Link href="/kvkk" className="hover:text-zinc-300 transition-colors">Kişisel Verilerin Korunması</Link>
              <Link href="/yasal/basvuru-formu-aydinlatma" className="hover:text-zinc-300 transition-colors">Başvuru Formu Aydınlatma</Link>
              <Link href="/kvkk-basvuru" className="hover:text-zinc-300 transition-colors">KVKK Başvuru Formu</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
