import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'
import { PricingToggle } from './PricingToggle'
import FAQSection from './FAQSection'
import BasvuruModal from '@/components/BasvuruModal'

export const metadata: Metadata = {
  title: 'CheckRezerve — Randevu & Rezervasyon Yönetim Sistemi',
  description:
    'Doluluk oranınızı artırın, gelir kaybını önleyin. CheckRezerve ile işletmenizin rezervasyonlarını tek panelden yönetin. Komisyon yok.',
}

const SECTORS = [
  {
    icon: '🍽️',
    title: 'Restoran & Kafe',
    desc: 'Masa bazlı rezervasyon, kroki üzerinden oturma düzeni ve no-show koruması ile doluluk oranınızı maksimuma taşıyın.',
  },
  {
    icon: '✂️',
    title: 'Kuaför & Berber',
    desc: 'Personel bazlı randevu takibi, müşteri geçmişi ve otomatik hatırlatmalarla salonunuzu verimli yönetin.',
  },
  {
    icon: '💆',
    title: 'Spa & Güzellik Salonu',
    desc: 'Hizmet süresi ve kapasite yönetimi ile çakışan randevuların önüne geçin. Müşteri sadakatini artırın.',
  },
  {
    icon: '🏨',
    title: 'Otel & Konaklama',
    desc: 'Oda rezervasyonlarını, erken check-in taleplerini ve ek hizmetleri tek panelden takip edin.',
  },
  {
    icon: '🎭',
    title: 'Etkinlik & Organizasyon',
    desc: 'Kontenjan yönetimi, bilet satışı ve misafir listesi kontrolünü kolaylaştırın.',
  },
  {
    icon: '🏋️',
    title: 'Spor & Fitness',
    desc: 'Ders, antrenör ve alan bazlı randevu sistemi ile üye deneyimini iyileştirin.',
  },
]

const HOW_STEPS = [
  {
    num: '1',
    title: 'Hesabınızı Oluşturun',
    desc: 'Birkaç dakika içinde kaydınızı tamamlayın, işletme bilgilerinizi girin.',
  },
  {
    num: '2',
    title: 'Sistemi Yapılandırın',
    desc: 'Hizmetlerinizi, personelinizi ve çalışma saatlerinizi tanımlayın.',
  },
  {
    num: '3',
    title: 'Rezervasyon Almaya Başlayın',
    desc: 'Müşterileriniz online rezervasyon yapabilir, siz anında bildirim alırsınız.',
  },
]

const FEATURES = [
  {
    icon: '📅',
    title: 'Akıllı Rezervasyon Yönetimi',
    desc: 'Günlük, haftalık ve aylık görünümlerle tüm randevularınızı tek ekranda takip edin. Çakışma uyarıları ve otomatik kapasite kontrolü ile hiç hata yapmayın.',
  },
  {
    icon: '💳',
    title: 'Ön Ödeme & Provizyon',
    desc: 'Rezervasyon anında müşterinizden güvence bedeli alın. Gelmeyene kesinti uygulayın, gelene iade edin. Siz kuralı belirleyin.',
  },
  {
    icon: '📲',
    title: 'SMS & E-posta Hatırlatmaları',
    desc: 'Otomatik hatırlatma mesajları ile unutulan randevuları minimuma indirin. Onay, iptal ve değişiklik bildirimlerini anında iletin.',
  },
  {
    icon: '👥',
    title: 'Müşteri Yönetimi (CRM)',
    desc: 'Her müşterinizin geçmişini, tercihlerini ve ziyaret sıklığını kayıt altına alın. Kara liste özelliği ile sorunlu müşterileri kolayca yönetin.',
  },
  {
    icon: '📊',
    title: 'Raporlama & Analiz',
    desc: 'Doluluk oranı, iptal istatistikleri ve gelir raporlarını anlık takip edin. Doğru kararları veriye dayanarak alın.',
  },
  {
    icon: '🖥️',
    title: 'Online Rezervasyon Sayfası',
    desc: 'Müşterileriniz size ait özel bir link üzerinden 7/24 rezervasyon yapabilir. Telefon trafiğini azaltın, dönüşümü artırın.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="pt-24 pb-24 text-white relative" style={{backgroundImage:"linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url('/hero-restaurant.jpg')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm mb-8 text-red-300 font-medium">
            Randevu &amp; Rezervasyon Yönetimi
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Doluluk Oranınızı Artırın,<br />
            <span className="text-red-400">Gelir Kaybını Önleyin</span>
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            CheckRezerve ile işletmenizin rezervasyonlarını tek panelden yönetin. Gelmeyenlere karşı ön ödeme alın, SMS ile hatırlatın, boş kalan zamanlarınızı geçmişe gömün.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 text-sm text-white/70">
            {[
              'Rezervasyon başına hiçbir komisyon ödemezsiniz',
              'Kurulum aynı gün, kullanım ilk dakikadan itibaren',
              'Tüm sektörlere uygun esnek yapı',
            ].map(t => (
              <span key={t} className="flex items-center gap-1.5 justify-center">
                <span className="text-red-400 font-bold">✓</span> {t}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BasvuruModal className="rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 text-base font-semibold text-white transition-colors shadow-lg shadow-red-900/30">
              14 Gün Ücretsiz Dene →
            </BasvuruModal>
            <a href="#nasil-calisir"
              className="rounded-full border border-white/30 hover:border-white/60 px-8 py-4 text-base font-semibold text-white transition-colors">
              Nasıl Çalışır?
            </a>
          </div>
        </div>
      </section>

      {/* ── Kullanım Alanları ── */}
      <section id="kullanim-alanlari" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Her Sektöre Uygun Rezervasyon Altyapısı
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Restorandan spa&apos;ya, kuaförden etkinlik mekanına kadar CheckRezerve her işletme tipine kolayca adapte olur.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTORS.map(s => (
              <div key={s.title}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-7 hover:border-red-100 hover:shadow-sm transition-all duration-200">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nasıl Çalışır ── */}
      <section id="nasil-calisir" className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">3 Adımda Hazırsınız</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_STEPS.map(step => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-extrabold mb-5 shadow-lg shadow-red-200">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ön Ödeme / No-Show ── */}
      <section className="py-20 bg-red-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6 leading-snug">
                Boş Kalan Her Seans<br />Bir Gelir Kaybıdır
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Haber vermeden gelmeyen müşteriler, işletmenizin en sessiz düşmanıdır. CheckRezerve&apos;in
                ön ödeme sistemi sayesinde rezervasyon anında güvence altına alınır.
              </p>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Müşteriniz randevusuna gelmediğinde aldığınız ön ödeme sizde kalır. Geldiğinde ise ödeme
                otomatik olarak işleme dönüşür ya da iade edilir — siz karar verirsiniz.
              </p>
              <p className="text-zinc-600 leading-relaxed mb-8">
                Tüm işlemler 3D Secure altyapısıyla güvence altındadır. Yerli ve yabancı tüm kredi kartları
                kabul edilir.
              </p>
              <BasvuruModal className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer p-0">
                Hemen Başla →
              </BasvuruModal>
            </div>

            <div className="flex-shrink-0 w-full lg:w-96">
              <Image
                src="/images/feature-rezervasyon.jpg"
                alt="Akıllı rezervasyon yönetimi"
                width={600}
                height={420}
                className="w-full rounded-2xl shadow-xl object-cover"
                style={{ height: '340px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section id="ozellikler" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              İşletmenizi Büyütecek Araçlar
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
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Büyüklüğünüze Göre Fiyat</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Uzun vadeli sözleşme yok. İstediğiniz zaman plan değiştirebilirsiniz.
            </p>
          </div>
          <PricingToggle />
        </div>
      </section>

      {/* ── SSS ── */}
      <section id="sss" className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Sıkça Sorulan Sorular</h2>
          </div>
          <FAQSection />
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
