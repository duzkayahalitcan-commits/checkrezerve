import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { UtensilsCrossed, Scissors, Sparkles, BedDouble, CalendarRange, Dumbbell } from 'lucide-react'
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
    Icon: UtensilsCrossed,
    title: 'Restoran & Kafe',
    desc: 'Masa bazlı rezervasyon, kroki üzerinden oturma düzeni ve no-show koruması ile doluluk oranınızı maksimuma taşıyın.',
  },
  {
    Icon: Scissors,
    title: 'Kuaför & Berber',
    desc: 'Personel bazlı randevu takibi, müşteri geçmişi ve otomatik hatırlatmalarla salonunuzu verimli yönetin.',
  },
  {
    Icon: Sparkles,
    title: 'Spa & Güzellik Salonu',
    desc: 'Hizmet süresi ve kapasite yönetimi ile çakışan randevuların önüne geçin. Müşteri sadakatini artırın.',
  },
  {
    Icon: BedDouble,
    title: 'Otel & Konaklama',
    desc: 'Oda rezervasyonlarını, erken check-in taleplerini ve ek hizmetleri tek panelden takip edin.',
  },
  {
    Icon: CalendarRange,
    title: 'Etkinlik & Organizasyon',
    desc: 'Kontenjan yönetimi, bilet satışı ve misafir listesi kontrolünü kolaylaştırın.',
  },
  {
    Icon: Dumbbell,
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
    img: '/images/feature-rezervasyon.jpg',
    title: 'Akıllı Rezervasyon Yönetimi',
    desc: 'Günlük, haftalık ve aylık görünümlerle tüm randevularınızı tek ekranda takip edin. Çakışma uyarıları ve otomatik kapasite kontrolü ile hiç hata yapmayın.',
  },
  {
    icon: '💳',
    img: '/images/feature-odeme-new.png',
    title: 'Ön Ödeme & Provizyon',
    desc: 'Rezervasyon anında müşterinizden güvence bedeli alın. Gelmeyene kesinti uygulayın, gelene iade edin. Siz kuralı belirleyin.',
  },
  {
    icon: '📲',
    img: '/images/feature-bildirim.jpg',
    title: 'SMS & E-posta Hatırlatmaları',
    desc: 'Otomatik hatırlatma mesajları ile unutulan randevuları minimuma indirin. Onay, iptal ve değişiklik bildirimlerini anında iletin.',
  },
  {
    icon: '👥',
    img: '/images/feature-calisan.jpg',
    title: 'Çalışan & Müşteri Yönetimi',
    desc: 'Her müşterinizin geçmişini, tercihlerini ve ziyaret sıklığını kayıt altına alın. Personel ataması ve kara liste ile eksiksiz yönetim.',
  },
  {
    icon: '📊',
    img: '/images/blog-banner.jpg',
    title: 'Raporlama & Analiz',
    desc: 'Doluluk oranı, iptal istatistikleri ve gelir raporlarını anlık takip edin. Doğru kararları veriye dayanarak alın.',
  },
  {
    icon: '🖥️',
    img: '/images/feature-online.jpg',
    title: 'Online Rezervasyon Sayfası',
    desc: 'Müşterileriniz size ait özel bir link üzerinden 7/24 rezervasyon yapabilir. Telefon trafiğini azaltın, dönüşümü artırın.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="pt-24 pb-24 text-white relative" style={{backgroundImage:"linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url('/images/hero-premium.jpg')",backgroundSize:'cover',backgroundPosition:'center'}}>
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

      {/* ── Demo İste CTA ── */}
      <section className="bg-red-600 py-5">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white font-semibold text-base">
            CheckRezerve&apos;i canlı görmek ister misiniz?
          </p>
          <Link href="/iletisim"
            className="shrink-0 rounded-full bg-white text-red-600 hover:bg-red-50 px-7 py-2.5 text-sm font-bold transition-colors shadow">
            Demo İste →
          </Link>
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
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <s.Icon className="w-5 h-5 text-red-600" />
                </div>
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
          <div className="grid sm:grid-cols-3 gap-8 mb-16">
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

          {/* Demo Video Placeholder */}
          <div className="rounded-2xl overflow-hidden border border-zinc-200 max-w-3xl mx-auto relative aspect-video">
            <Image
              src="/images/hero-restaurant.jpg"
              alt="CheckRezerve demo önizlemesi"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-zinc-900/65 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg shadow-red-900/40">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="text-center px-4">
                <p className="text-white font-semibold text-base mb-1">Demo videosu çok yakında</p>
                <p className="text-zinc-300 text-sm mb-5">Sistemi canlı görmek ister misiniz?</p>
                <Link href="/iletisim"
                  className="rounded-full bg-red-600 hover:bg-red-700 px-6 py-2.5 text-sm font-bold text-white transition-colors inline-block">
                  Bize Yazın →
                </Link>
              </div>
            </div>
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
                className="rounded-2xl border border-zinc-100 bg-zinc-50 overflow-hidden hover:border-red-100 hover:shadow-md transition-all duration-200">
                <Image
                  src={f.img}
                  alt={f.title}
                  width={400}
                  height={160}
                  className="w-full object-cover"
                  style={{ height: '160px' }}
                />
                <div className="p-7">
                  <h3 className="text-base font-bold text-zinc-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Müşteri Yorumları ── */}
      <section className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-3">Müşterilerimiz</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">İşletme Sahipleri Ne Diyor?</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Her gün yüzlerce işletme CheckRezerve ile no-show oranını düşürüyor ve zaman kazanıyor.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                quote: 'CheckRezerve sayesinde aylık gelir kaybımız neredeyse sıfıra indi. Artık kimse rezervasyon yapıp gelmezlik yapmıyor — ön ödeme sistemi mucize gibi çalışıyor.',
                name: 'Mehmet Arslan',
                business: 'Zeytin Restoran',
                type: 'Restoran Sahibi',
                initials: 'MA',
              },
              {
                quote: 'Daha önce telefonda saatler harcıyordum. Şimdi müşterilerim online randevu alıyor, ben sadece paneli kontrol ediyorum. Kullanımı gerçekten çok kolay.',
                name: 'Ayşe Yıldız',
                business: 'Lotus Güzellik Salonu',
                type: 'Güzellik Salonu Sahibi',
                initials: 'AY',
              },
              {
                quote: 'Hafta sonları doluluk oranımız %40 artı. Müşterilerimize hatırlatma SMS\'i gidiyor, boş masa kalmıyor. CheckRezerve\'i daha önce keşfetmeliydim.',
                name: 'Kemal Özcan',
                business: 'Kahve Durağı',
                type: 'Kafe İşletmecisi',
                initials: 'KÖ',
              },
            ].map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-zinc-100 p-7 hover:border-red-100 hover:shadow-md transition-all duration-200 flex flex-col">
                <div className="flex-1">
                  <div className="text-red-500 text-2xl mb-4 leading-none">&ldquo;</div>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-6">{t.quote}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-400 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.business} · {t.type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fiyat Karşılaştır CTA ── */}
      <section className="py-10 bg-white border-t border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-zinc-900 font-bold text-lg">Hangi plan size uygun?</p>
            <p className="text-zinc-500 text-sm">Tüm planları yan yana karşılaştırın, doğru kararı verin.</p>
          </div>
          <a href="#fiyatlar"
            className="shrink-0 rounded-full bg-zinc-900 hover:bg-zinc-700 text-white px-7 py-2.5 text-sm font-bold transition-colors">
            Fiyat Karşılaştır →
          </a>
        </div>
      </section>

      {/* ── Fiyatlandırma ── */}
      <section id="fiyatlar" className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-center mb-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Büyüklüğünüze Göre Fiyat</h2>
              <p className="text-zinc-500 max-w-xl">
                Uzun vadeli sözleşme yok. İstediğiniz zaman plan değiştirebilirsiniz.
              </p>
            </div>
            <div className="flex-shrink-0 w-full lg:w-72">
              <Image
                src="/images/feature-handshake.jpg"
                alt="CheckRezerve fiyatlandırma"
                width={320}
                height={200}
                className="w-full rounded-2xl shadow-lg object-cover"
                style={{ height: '180px' }}
              />
            </div>
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

      {/* ── Ücretsiz Dene CTA ── */}
      <section className="py-20 bg-zinc-900 text-white text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın, 14 Gün Ücretsiz Deneyin</h2>
          <p className="text-white/60 mb-8">Kredi kartı gerekmez. Kurulum birkaç dakika sürer.</p>
          <BasvuruModal className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 font-semibold text-white transition-colors shadow-lg shadow-red-900/40">
            14 Gün Ücretsiz Dene →
          </BasvuruModal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
