import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import MarketingHeader from '@/components/MarketingHeader'
import MarketingFooter from '@/components/MarketingFooter'

export const metadata: Metadata = {
  title: 'Özellikler — CheckRezerve',
  description: 'AI sesli onay, anlık takip, ön ödeme, CRM ve daha fazlası. CheckRezerve\'in tüm güçlü özellikleriyle tanışın.',
}

const FEATURES = [
  {
    num: '01',
    img: '/feat-ai-voice.jpg',
    title: 'Yapay Zeka Sesli Onay',
    desc: 'Rezervasyon tamamlandığı anda sistemimizin AI motoru müşteriyi otomatik olarak arar. Türkçe doğal dil konuşmasıyla rezervasyonu sesli onaylar ya da iptal eder — tüm görüşmeler kayıt altına alınır.',
    items: [
      'Rezervasyon sonrası otomatik AI araması',
      'Doğal Türkçe konuşma ve onay akışı',
      'Sesli onay kaydı panelde görüntülenebilir',
      'No-show oranını %60\'a kadar düşürür',
    ],
    reverse: false,
  },
  {
    num: '02',
    img: '/feat-human-agent.jpg',
    title: 'İsteğe Bağlı Gerçek Kişi Aracılığı',
    desc: 'Her müşteri AI ile konuşmak istemez. CheckRezerve, müşteriye AI veya gerçek operatör seçeneği sunar. Resepsiyonist ekranında anlık bildirimle hiçbir çağrı kaçmaz.',
    items: [
      'Müşteri tercihine göre AI / insan yönlendirmesi',
      'Resepsiyonist panelinde anlık çağrı bildirimi',
      'Çağrı kaydı ve detaylı notlama',
      'Mesai saati dışı otomatik yönlendirme',
    ],
    reverse: true,
  },
  {
    num: '03',
    img: '/feat-realtime.jpg',
    title: 'Anlık İşletme Takibi',
    desc: 'Hangi masalar dolu, toplam kaç kişi içeride, yoğunluk ne zaman zirveye ulaşacak? İşletmenizin gerçek zamanlı nabzını tek ekranda tutun.',
    items: [
      'Gerçek zamanlı masa doluluk haritası',
      'Anlık kişi sayacı ve kapasite göstergesi',
      'Saatlik doluluk projeksiyonu',
      'Ortalama masada kalma süresi analizi',
    ],
    reverse: false,
  },
  {
    num: '04',
    img: '/images/designer-5.png',
    title: 'Rezervasyon & Ciro Analizi',
    desc: 'Sezgisel kararlar yerine veriye dayalı yönetim. Günlük, haftalık ve aylık raporlarla işletmenizin tüm metriklerini takip edin.',
    items: [
      'Günlük/haftalık/aylık rezervasyon grafikleri',
      'Ciro artış ve no-show karşılaştırması',
      'En yoğun gün/saat raporu',
      'Excel ve PDF dışa aktarma',
    ],
    reverse: true,
  },
  {
    num: '05',
    img: '/images/feature-calisan.jpg',
    title: 'Çoklu Hizmet & Uzman Seçimi',
    desc: 'Müşterileriniz rezervasyon yaparken hizmet türünü ve uzmanı bizzat seçebilir. Personel fotoğrafı, biyografi ve müsaitlik takvimi ile profesyonel bir deneyim sunun.',
    items: [
      'Hizmet kategorisi seçimi (masaj, saç, kaplıca vb.)',
      'Uzman/personel tercih ekranı ve profili',
      'Müsaitlik takvimi ve slot yönetimi',
      'Seans süresi otomatik hesaplama',
    ],
    reverse: false,
  },
  {
    num: '06',
    img: '/feat-mobile.jpg',
    title: 'Masa / Seans / Oda Seçimi',
    desc: 'Müşterileriniz interaktif haritadan istedikleri masayı ya da kabini seçebilir. Akıllı öneriler sayesinde çakışmalar ve boşluklar otomatik engellenir.',
    items: [
      'İnteraktif masa haritası (restoranlar)',
      'Oda/kabin seçimi (spa ve oteller)',
      'Tarih & saat slot yönetimi',
      'Kapasiteye göre akıllı öneriler',
    ],
    reverse: true,
  },
  {
    num: '07',
    img: '/images/designer-4.png',
    title: 'CRM & Müşteri Geçmişi',
    desc: 'Her müşterinizi tanıyın. Alerji bilgisinden oturma tercihine, geçmiş ziyaretlerden doğum gününe kadar her detay kayıt altında.',
    items: [
      'Müşteri profili ve ziyaret geçmişi',
      'Tercih notları (alerji, oturma, özel istek)',
      'Kara liste ile sorunlu müşteri yönetimi',
      'Doğum günü / özel gün hatırlatıcıları',
    ],
    reverse: false,
  },
  {
    num: '08',
    img: '/tablet-mockup.jpg',
    title: 'Ön Ödeme & No-Show Yönetimi',
    desc: 'Haber vermeden gelmeyen müşteriler tarihe karışsın. Rezervasyon anında kart bilgisi alın; gelmeyen müşteriden otomatik kesinti uygulayın.',
    items: [
      'Rezervasyon anında güvenli kart bilgisi alımı',
      '3D Secure altyapısı ile tam güvenlik',
      'No-show durumunda otomatik ücret kesimi',
      'Esnek iptal politikası yapılandırması',
    ],
    reverse: true,
  },
]

const FAQS = [
  {
    q: 'AI sesli onay özelliği ek ücrete tabi mi?',
    a: 'Hayır. Tüm planlarda AI sesli onay dahildir. Gerçek kişi aracılığı özelliği Pro ve Kurumsal planlarda bulunur.',
  },
  {
    q: 'Ön ödeme sisteminde hangi kartlar kabul ediliyor?',
    a: 'Yerli ve yabancı tüm kredi kartları kabul edilir. Tüm işlemler 3D Secure altyapısıyla gerçekleştirilir.',
  },
  {
    q: 'Raporları ekibimle paylaşabilir miyiz?',
    a: 'Evet. Raporlar Excel ve PDF formatında dışa aktarılabilir. Ayrıca birden fazla kullanıcıya panel erişimi tanımlanabilir.',
  },
  {
    q: 'Uygulamayı mobil cihazdan kullanabilir miyim?',
    a: 'Evet. CheckRezerve web uygulaması mobil uyumludur. iOS ve Android için native uygulama geliştirme sürecindedir.',
  },
]

export default function OzelliklerPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-28 pb-16 text-white text-center relative" style={{backgroundImage:"linear-gradient(135deg,rgba(13,18,26,0.87) 0%,rgba(13,110,110,0.68) 100%),url('/sector-restoran.jpg')",backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="mx-auto max-w-3xl px-6 relative z-10">
          <span className="inline-block bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 text-sm text-red-300 font-medium mb-6">
            Platform Özellikleri
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            İşletmenizi Büyütecek<br />Her Araç Burada
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            AI destekli onaydan anlık takibe, ön ödemeden CRM&apos;e kadar rezervasyon yönetiminin tüm boyutları tek platformda.
          </p>
        </div>
      </section>

      {/* Feature Rows */}
      <section className="py-4">
        {FEATURES.map((f, i) => (
          <div
            key={f.num}
            className={`py-20 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}
          >
            <div className={`mx-auto max-w-6xl px-6 flex flex-col ${f.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 items-center`}>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-red-600 tracking-widest uppercase">{f.num} — Özellik</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2 mb-4">{f.title}</h2>
                <p className="text-zinc-600 leading-relaxed mb-6">{f.desc}</p>
                <ul className="space-y-3">
                  {f.items.map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-zinc-600">
                      <span className="mt-0.5 text-red-500 font-bold shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-shrink-0 w-full lg:w-[480px]">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-zinc-100">
                  <Image
                    src={f.img}
                    alt={f.title}
                    width={480}
                    height={340}
                    className="w-full h-72 object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-3">Sık Sorulan Sorular</h2>
            <p className="text-zinc-500">Özellikler hakkında merak edilenler</p>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => (
              <details key={faq.q} className="rounded-2xl border border-zinc-100 bg-zinc-50 group">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-sm font-semibold text-zinc-800 list-none gap-4">
                  {faq.q}
                  <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs font-bold group-open:bg-red-600 group-open:text-white transition-colors">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-zinc-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-900 text-white text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold mb-4">Tüm Özellikleri 14 Gün Ücretsiz Deneyin</h2>
          <p className="text-white/60 mb-8">Kredi kartı gerekmez. Kurulum dakikalar içinde tamamlanır.</p>
          <Link href="/kayit"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-8 py-4 font-semibold text-white transition-colors">
            Ücretsiz Başlayın →
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
