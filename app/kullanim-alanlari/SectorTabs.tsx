'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SECTORS = [
  {
    id: 'restoran',
    icon: '🍽️',
    label: 'Restoran',
    img: '/images/sector-restoran.jpg',
    title: 'Restoranlar İçin',
    desc: 'Masa planından grup rezervasyonuna, garson atamasından ön ödemeli rezervasyona kadar restoran operasyonunuzun her adımını dijitalleştirin.',
    features: [
      { title: 'Masa Planı Oluşturma', desc: 'Krokiden interaktif masa haritası oluşturun, bölüm bazlı yönetin' },
      { title: 'Bölüm Bazlı Yönetim', desc: 'Teras, salon, özel oda ayrı ayrı takip — aynı anda çakışma yok' },
      { title: 'Grup & Etkinlik Rezervasyonu', desc: 'Doğum günü, iş yemeği, özel kutlamalar için özel alan' },
      { title: 'Garson-Masa Atama', desc: 'Personel iş yükünü dengeli dağıtın, verimlilik artsın' },
      { title: 'No-Show Koruması', desc: 'Ön ödeme ile boş masa sorununu ortadan kaldırın' },
    ],
  },
  {
    id: 'kafe',
    icon: '☕',
    label: 'Kafe',
    img: '/images/sector-kafe.jpg',
    title: 'Kafeler İçin',
    desc: 'Yoğun saatlerde kapasite yönetiminden özel etkinlik rezervasyonuna, müşteri sadakat sisteminden kalabalık uyarılarına kadar her şey kontrolünüzde.',
    features: [
      { title: 'Kapasite Kontrolü', desc: 'Yoğun saatlerde akıllı doluluk yönetimi, bekleme listesi' },
      { title: 'Çalışma Alanı Rezervasyonu', desc: 'Özel etkinlik ve toplantı odası takibi' },
      { title: 'Müşteri CRM', desc: 'Geçmiş sipariş ve tercih takibi, sadık müşteri profili' },
      { title: 'Sadakat Puanı', desc: 'Tekrar gelen müşterileri ödüllendirin, bağlılık artırın' },
      { title: 'Kalabalık Uyarısı', desc: 'Anlık doluluk bildirimleri ile sürpriz kuyruk önleyin' },
    ],
  },
  {
    id: 'spa',
    icon: '💆',
    label: 'Spa & Güzellik',
    img: '/images/sector-spa.jpg',
    title: 'Spa & Güzellik Merkezleri İçin',
    desc: 'Terapist seçiminden çift seans rezervasyonuna, paket satışından hatırlatma sistemine kadar güzellik merkezi yönetiminin tamamı.',
    features: [
      { title: 'Uzman Seçimi', desc: 'Terapist fotoğraf, biyografi ve müşteri değerlendirmeleri' },
      { title: 'Hizmet Kategorileri', desc: 'Masaj, cilt bakımı, saç, manikür — her hizmet ayrı takvim' },
      { title: 'Kabin/Oda Rezervasyonu', desc: 'Her kabin için bağımsız müsaitlik ve çakışma kontrolü' },
      { title: 'Çift Seans', desc: 'İki kişilik eş zamanlı seans desteği, özel paket oluşturma' },
      { title: 'Hatırlatma Zinciri', desc: 'Seans öncesi SMS/e-posta, sonrası geri bildirim isteği' },
    ],
  },
  {
    id: 'kuafor',
    icon: '✂️',
    label: 'Kuaför & Berber',
    img: '/images/sector-kuafor.jpg',
    title: 'Kuaför & Berberler İçin',
    desc: 'Stilist seçiminden işlem süresi hesaplamaya, sıra yönetiminden son dakika müsait slot bildirimlerine kadar salonunuzu modernleştirin.',
    features: [
      { title: 'Stilist/Berber Seçimi', desc: 'Fotoğraflı profil, uzmanlık alanı ve müşteri puanı' },
      { title: 'İşlem Süresi Hesaplama', desc: 'Saç boyası, kesim, fön — süre otomatik hesaplanır' },
      { title: 'Walk-in + Online Kuyruk', desc: 'Telefonsuz sıra yönetimi, ekran göstergesi' },
      { title: 'Renk/Model Notu', desc: 'Müşteri tercih ve geçmiş model arşivi, notlama' },
      { title: 'Son Dakika Slot Bildirimi', desc: 'İptal olan saatler için SMS ile anlık duyuru' },
    ],
  },
  {
    id: 'otel',
    icon: '🏨',
    label: 'Otel',
    img: '/about-office.jpg',
    title: 'Oteller İçin',
    desc: 'Otel içi restoran ve spa rezervasyonunu misafir odalarıyla eşleştirin. Concierge modülü, çoklu dil ve tesis içi bildirim sistemi tek platformda.',
    features: [
      { title: 'Tek Panel Yönetimi', desc: 'Restoran + spa + aktivite rezervasyonu bir arada' },
      { title: 'Misafir Profili', desc: 'Oda numarası ile rezervasyon eşleşmesi, tercih takibi' },
      { title: 'Concierge Modülü', desc: 'Ekstra hizmet ve aktivite talepleri, şoför rezervasyonu' },
      { title: 'Çoklu Dil Desteği', desc: 'TR / EN arayüz, yabancı misafir dostu deneyim' },
      { title: 'Check-in Entegrasyonu', desc: 'Tesis PMS sistemi ile API bağlantısı imkânı' },
    ],
  },
  {
    id: 'etkinlik',
    icon: '🎪',
    label: 'Etkinlik',
    img: '/tablet-mockup.jpg',
    title: 'Etkinlik Mekanları İçin',
    desc: 'Kapasite sınırlı etkinliklerden VIP masa yönetimine, bekleme listesinden QR kapı girişine kadar etkinlik mekanınızı profesyonelce yönetin.',
    features: [
      { title: 'Kapasite Yönetimi', desc: 'Kontenjan dolduğunda otomatik kapanma ve bildirim' },
      { title: 'Ön Ödemeli Bilet', desc: 'Online ödeme ile güvenli bilet satışı, 3D Secure' },
      { title: 'Waitlist Yönetimi', desc: 'Bekleme listesi ve iptal anında otomatik bildirim' },
      { title: 'VIP & Sponsor Masası', desc: 'Özel masa kategorisi, erişim kısıtlaması' },
      { title: 'Toplu Rezervasyon', desc: 'Kurumsal grup ve şirket etkinliği modülü' },
    ],
  },
  {
    id: 'fitness',
    icon: '🏋️',
    label: 'Fitness',
    img: '/feat-mobile.jpg',
    title: 'Fitness & Yoga Stüdyoları İçin',
    desc: 'Ders takviminizi, eğitmen müsaitliğini ve üye rezervasyon haklarını tek platformda yönetin. Tekrarlayan seans otomasyonuyla idari yükü minimuma indirin.',
    features: [
      { title: 'Ders & Seans Takvimi', desc: 'Haftalık program, ders kapasitesi ve doluluk takibi' },
      { title: 'Eğitmen Seçimi', desc: 'Uzmanlık alanı, fotoğraf ve müsaitlik filtresi' },
      { title: 'Üyelik Bazlı Rezervasyon', desc: 'Plan tipine göre aylık/haftalık rezervasyon hakkı' },
      { title: 'Online Check-in', desc: 'QR kod ile kapı girişi, devamsızlık takibi' },
      { title: 'Tekrarlayan Seans', desc: 'Haftalık otomatik rezervasyon oluşturma' },
    ],
  },
]

export default function SectorTabs() {
  const [active, setActive] = useState('restoran')
  const sector = SECTORS.find(s => s.id === active)!

  return (
    <>
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 ${
              active === s.id
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-red-300 hover:text-red-600'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-shrink-0 w-full lg:w-[480px]">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-zinc-100">
            <Image
              src={sector.img}
              alt={sector.title}
              width={480}
              height={340}
              className="w-full h-72 object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-red-600 tracking-widest uppercase">Kullanım Alanı</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2 mb-3">{sector.title}</h2>
          <p className="text-zinc-600 leading-relaxed mb-6">{sector.desc}</p>
          <div className="space-y-3">
            {sector.features.map(f => (
              <div key={f.title} className="flex items-start gap-3 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                <span className="mt-0.5 text-red-500 font-bold shrink-0">✓</span>
                <div>
                  <strong className="text-sm text-zinc-900">{f.title}</strong>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/kayit"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 px-6 py-3 text-sm font-semibold text-white transition-colors">
              Bu Sektör İçin Ücretsiz Dene →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
