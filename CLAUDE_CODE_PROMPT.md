# CheckReserve Website — Claude Code Prompt

## Görev
`checkrezerve.com` web sitesini aşağıdaki tüm gereksinimler doğrultusunda komple yenile. Mevcut siteye bakarak eksik olan tüm sayfaları ve bölümleri oluştur. Tek bir `index.html` + gerekli asset dosyalarıyla çalış. Tüm sayfalar/bölümler SPA (Single Page Application) mantığında JS ile section göster/gizle yöntemiyle çalışsın.

---

## Marka Renkleri & Logo
- **Ana renk**: `#0D6E6E` (koyu teal)
- **Vurgu rengi**: `#1EC8A0` (parlak teal/mint)
- **Arka plan**: `#FFFFFF`
- **Metin**: `#1A1A2E`
- **Logo**: Mevcut `CR` monogramı + "CheckReserve" yazısı, teal tonlarında
- **Tipografi**: Başlıklar için `Playfair Display`, gövde için `DM Sans` (Google Fonts)

---

## Görseller (assets/ klasörüne kopyala)
Aşağıdaki dosyaları proje klasöründe `assets/` dizinine yerleştir:

| Dosya adı (kaynak) | Kullanım yeri |
|---|---|
| `gemini-2_5-flash-image_...logo...jpg` | Logo / favicon |
| `ideogram-v3_0_A_wide-angle_atmospheric...restaurant_din-0.jpg` | Hero arka planı |
| `ideogram-v3_0_A_high-resolution_photorealistic_shot_of_an_upscale_luxurious_Spa_treatment_room-0.jpg` | Spa/otel kullanım alanı kartı |
| `ideogram-v3_0_A_high-resolution_photorealistic_close-up_photograph_set_in_a_luxurious_modern_R-0.jpg` | Restoran kullanım alanı kartı |
| `ideogram-v3_0_A_photorealistic_close-up_shot_of_a_modern_smartphone_screen_in_a_high-end_resta-0.jpg` | Özellikler / uygulama mockup |
| `ideogram-v3_0_A_photorealistic_product_shot_on_a_polished_marble_counter__A_sleek_white_tablet-0.jpg` | Tablet mockup / Kullanım alanları |
| `ideogram-v3_0_A_professional_ultra-modern_executive_office_desk_setting__On_a_sleek_dark_wood_-0.jpg` | Kurumsal / hakkımızda görseli |
| `Gemini_Generated_Image_1eix61eix61eix61.png` | AI sesli onay özelliği görseli |
| `Gemini_Generated_Image_b9mlomb9mlomb9ml.png` | Gerçek kişi aracılığı özelliği |
| `Gemini_Generated_Image_dmutvjdmutvjdmut.png` | Anlık takip özelliği |
| `Gemini_Generated_Image_rezvb7rezvb7rezv.png` | Rezervasyon analizi görseli |
| `Gemini_Generated_Image_u4x6rqu4x6rqu4x6.png` | Mobil uygulama görseli |
| `Gemini_Generated_Image_v677d0v677d0v677.png` | Spa hizmet seçimi görseli |

---

## Navigasyon (Navbar)
- Logo (sol)
- Menü: **Özellikler | Kullanım Alanları | Fiyatlar | Blog | Hakkımızda | İletişim**
- Sağ: `Giriş Yap` (outline) + `Ücretsiz Başlayın →` (filled teal buton)
- Scroll'da navbar sticky + hafif blur/shadow efekti
- Mobilde hamburger menü

---

## SAYFA 1 — ANA SAYFA (Hero)

### Hero Section
- **Başlık**: "Rezervasyonlarınızı Akıllıca Yönetin"
- **Alt başlık**: "CheckReserve ile restoranınızın, spanızın veya otelinizin tüm rezervasyon süreçlerini tek panelden kontrol edin. Yapay zeka destekli onay, anlık takip ve güçlü analizler."
- **CTA butonları**: `Ücretsiz Deneyin →` (büyük teal) + `Demo İzle ▶` (ghost)
- **Arka plan**: Restoran fotoğrafı (parallax efekti) + koyu overlay gradyanı
- **Animasyon**: Başlık ve butonlar soldan sağa fade-in

### İstatistik Bandı
Beyaz arka plan, 4 sütun:
- 🏢 **2,400+** İşletme
- 📅 **1.2M+** Aylık Rezervasyon
- ⭐ **%98** Müşteri Memnuniyeti
- 📈 **%35** Ortalama Ciro Artışı

### Özellikler Özeti (6 Kart)
Grid 3x2, hover animasyonu, teal accent:
1. 🤖 **Yapay Zeka Sesli Onay** — AI müşteriyi arar, rezervasyonu sesli onaylar
2. 👤 **Gerçek Kişi Aracılığı** — İsteğe bağlı insan operatör desteği
3. 📊 **Anlık Restoran Takibi** — Masa doluluk oranı, kişi sayısı, yoğun saatler
4. 📈 **Gelişmiş Analitik** — Rezervasyon trendleri, ciro analizi, raporlar
5. 📱 **Çoklu Platform** — Web, iOS, Android, tablet POS
6. 🔔 **Akıllı Bildirimler** — SMS, e-posta, WhatsApp entegrasyonu

---

## SAYFA 2 — ÖZELLİKLER (tam sayfa)

Tüm özellikleri detaylı anlat. Her özellik: sol görsel + sağ metin VEYA sağ görsel + sol metin (zebra pattern):

### 1. Yapay Zeka Sesli Onay
**Görsel**: `Gemini...1eix6...png`
- Rezervasyon alındığında AI otomatik olarak müşteriyi arar
- Doğal dil ile onay/iptal işlemi yapar
- Türkçe ve İngilizce destek
- Onay sesi kaydedilir, raporlara eklenir
- No-show oranını %60'a kadar düşürür

### 2. İsteğe Bağlı Gerçek Kişi Aracılığı
**Görsel**: `Gemini...b9mlo...png`
- Müşteri isterse AI yerine gerçek operatöre bağlanır
- Resepsiyonist ekranında anlık bildirim
- Çağrı kaydı ve notlama
- Mesai saati dışı yönlendirme

### 3. Anlık Restoran / İşletme Takibi
**Görsel**: `Gemini...dmutvj...png`
- Gerçek zamanlı masa doluluk haritası
- Anlık kişi sayacı
- Tahmini doluluk oranı (saatlik projeksiyon)
- Ortalama misafir/masa verisi

### 4. Rezervasyon & Ciro Analizi
**Görsel**: `Gemini...rezvb7...png`
- Günlük/haftalık/aylık rezervasyon grafikleri
- Ciro artış takibi
- No-show ve iptal analizi
- En yoğun gün/saat raporu
- Dışa aktarma (Excel, PDF)

### 5. Çoklu Hizmet & Uzman Seçimi
**Görsel**: `Gemini...v677d0...png`
- Müşteri hizmet türünü seçer (masaj, saç, kaplıca, masaj vb.)
- Uzman/personel tercih ekranı
- Personel fotoğrafı, biyografi, uzmanlık alanı
- Müsaitlik takvimi

### 6. Masa/Seans/Oda Seçimi
**Görsel**: `Gemini...u4x6rq...png`
- İnteraktif masa haritası (restoranlar için)
- Oda/kabin seçimi (spalar için)
- Tarih & saat slot seçimi
- Kapasiteye göre akıllı öneriler

### 7. CRM & Müşteri Geçmişi
- Müşteri profili ve geçmiş ziyaretler
- Tercih notları (alerji, oturma tercihi vb.)
- Sadakat puanı entegrasyonu
- Doğum günü / özel gün hatırlatıcıları

### 8. Ön Ödeme & No-Show Yönetimi
- Rezervasyon anında kredi kartı bilgisi alımı
- No-show durumunda otomatik ücret kesimi
- İptal politikası yapılandırması
- İade ve fatura otomasyonu

### 9. Çoklu Kanal Entegrasyonu
- Google My Business rezervasyon butonu
- Instagram / Facebook rezervasyon linki
- Web sitesine embed widget
- WhatsApp Business API

### 10. Personel & Vardiya Yönetimi
- Personel çalışma takvimi
- Otomatik rezervasyon atama
- Mola ve izin bloklama
- Performans raporu (en çok rezervasyon alan personel)

---

## SAYFA 3 — KULLANIM ALANLARI (tam sayfa)

Her sektör için ayrı bir sekme/kart. Tıklanınca detaylar açılsın (accordion veya tab):

### 🍽️ Restoranlar
**Görsel**: restoran fotoğrafı
**Özellikler**:
- Masa planı oluşturma (kroki üzerinden)
- Bölüm bazlı yönetim (teras, salon, özel oda)
- Rezervasyon + walk-in entegrasyonu
- Grup rezervasyon ve etkinlik yönetimi
- Pre-order menü entegrasyonu
- Gece yarısı otomatik masa sıfırlama
- Garson-masa atama sistemi

### ☕ Kafeler
**Özellikler**:
- Yoğun saat kapasite kontrolü
- Çalışma alanı / özel etkinlik rezervasyonu
- Müşteri CRM ve geçmiş takibi
- Online menü ile entegre rezervasyon
- Sadakat kartı / puan sistemi
- Kalabalık uyarı sistemi

### 💆 Spalar & Güzellik Merkezleri
**Görsel**: spa fotoğrafı
**Özellikler**:
- Uzman (terapist/stilist) seçimi ve biyografi ekranı
- Hizmet kategorileri: masaj, cilt bakımı, saç, manikür vb.
- Kabin/oda bazlı rezervasyon
- Seans süresi yönetimi (30dk, 60dk, 90dk)
- Çift/ikili seans rezervasyonu
- Ürün/paket satışı ile entegrasyon
- Hatırlatıcı ve geri bildirim sistemi

### ✂️ Kuaförler & Barberlar
**Özellikler**:
- Stilist/berber seçimi (fotoğraflı)
- İşlem seçimi: saç kesimi, boya, fön, sakal, vb.
- İşlem süresi otomatik hesaplama
- Sıra/kuyruk yönetimi (walk-in + online)
- Renk/model notu müşteri tercihine göre kayıt
- Instagram portföy entegrasyonu
- Son dakika müsait slot bildirimleri

### 🏨 Oteller
**Görsel**: ofis/otel görseli
**Özellikler**:
- Restaurant + spa rezervasyonu tek panel
- Misafir profili (oda numarası ile eşleşme)
- Concierge rezervasyon modülü
- Tesis içi bildirim sistemi
- Dil seçeneği (çoklu dil desteği)
- Check-in/check-out entegrasyonu

### 🎪 Etkinlik Mekanları
**Özellikler**:
- Kapasite sınırlı etkinlik yönetimi
- Ön ödemeli bilet/rezervasyon
- Waitlist (bekleme listesi) yönetimi
- Toplu/kurumsal rezervasyon modülü
- QR kod ile kapı girişi
- Sponsor / VIP masa yönetimi

### 🏋️ Fitness & Yoga Stüdyoları
**Özellikler**:
- Ders/seans takvimi yönetimi
- Eğitmen seçimi
- Üyelik bazlı rezervasyon hakkı
- Sınıf kapasitesi ve doluluk takibi
- Online check-in
- Tekrarlayan seans otomasyonu

---

## SAYFA 4 — FİYATLAR

3 plan, yıllık/aylık toggle:

| | **Başlangıç** | **Pro** | **Kurumsal** |
|---|---|---|---|
| Fiyat (aylık) | ₺990 | ₺2.490 | Teklif Al |
| Rezervasyon limiti | 500/ay | Sınırsız | Sınırsız |
| Lokasyon | 1 | 5'e kadar | Sınırsız |
| AI Sesli Onay | ✅ | ✅ | ✅ |
| Gerçek Kişi Aracılığı | ❌ | ✅ | ✅ |
| Anlık Takip | ✅ | ✅ | ✅ |
| Gelişmiş Analitik | ❌ | ✅ | ✅ |
| API Erişimi | ❌ | ❌ | ✅ |
| Özel Entegrasyon | ❌ | ❌ | ✅ |
| Destek | E-posta | Öncelikli | Dedicated |

---

## SAYFA 5 — HAKKIMIZDA (tıklanabilir, tam içerik)

**Hikaye bölümü**:
> CheckReserve, 2023 yılında İstanbul'da, "rezervasyon yönetimi neden bu kadar karmaşık?" sorusundan doğdu. İki restoran sahibi ve bir yazılım mühendisinin bir araya gelmesiyle kurulan şirketimiz, bugün 2.400'den fazla işletmeye hizmet veriyor.

**Misyon**: Türkiye'nin en iyi rezervasyon yönetim platformunu oluşturmak, her boyuttaki işletmeye dünya standartlarında araçlar sunmak.

**Vizyon**: 2027 yılına kadar Orta Doğu ve Balkanlar'da lider reservasyon SaaS çözümü olmak.

**Ekip bölümü** (3 kişi, placeholder avatar + isim + unvan):
- Ahmet Yılmaz — CEO & Kurucu
- Zeynep Kaya — CPO & Kurucu
- Can Demir — CTO

**Değerler** (4 kart):
- 🎯 Müşteri Odaklılık
- 🔒 Güvenilirlik
- ⚡ Hız & Verimlilik
- 🌱 Sürekli Gelişim

**Basında biz** bölümü (logo placeholder'lar)

**Ofis görseli**: `ideogram-v3_0_A_professional_ultra-modern_executive_office...jpg`

---

## SAYFA 6 — BLOG

3 örnek blog kartı (placeholder içerik):
1. "No-Show Nedir ve Nasıl Önlenir?" — 5 dk okuma
2. "Restoran Rezervasyon Yönetiminde Yapay Zekanın Geleceği" — 7 dk okuma
3. "Spa İşletmelerinde Dijital Dönüşüm" — 4 dk okuma

---

## SAYFA 7 — İLETİŞİM

- İletişim formu: Ad, E-posta, Telefon, İşletme türü (dropdown), Mesaj, Gönder butonu
- İletişim bilgileri: 📧 info@checkrezerve.com | 📞 0850 XXX XXXX | 📍 İstanbul, Türkiye
- Google Maps embed placeholder
- Sosyal medya ikonları (Instagram, LinkedIn, Twitter/X)

---

## Demo Modal

"Demo İzle" butonuna tıklanınca açılacak bir modal/overlay:
- YouTube embed placeholder (siyah arka plan, play butonu)
- "14 Günlük Ücretsiz Trial Başlat" butonu

---

## Teknik Gereksinimler

1. **Tek dosya**: `index.html` (CSS ve JS inline)
2. **Google Fonts**: `Playfair Display` + `DM Sans`
3. **İkonlar**: Font Awesome 6 CDN
4. **Animasyonlar**: CSS transitions + Intersection Observer ile scroll animasyonları
5. **Responsive**: Mobile-first, 320px-1440px arası tam uyumlu
6. **Performans**: Görsel lazy loading
7. **Smooth scroll**: Navbar link'leri ilgili section'a smooth scroll
8. **Active state**: Scroll pozisyonuna göre navbar item highlight
9. **Görsel dosya yolları**: `assets/` klasöründen relative path ile çağır

---

## Görsel/Estetik Yönelim

- **Stil**: Luxury SaaS — sade ama premium, restoran/spa sektörünün şıklığını yansıtan
- **Kartlar**: Beyaz arka plan, ince border (`1px solid #e8e8e8`), `16px` border-radius, subtle box-shadow
- **Butonlar**: `border-radius: 8px`, teal dolgu veya teal outline
- **Hover efektleri**: Kartlarda `translateY(-4px)` + shadow derinleşmesi
- **Section ayırt edici**: Çift section arka planı (beyaz + çok açık gri `#F8FAFB`)
- **Hero**: Koyu overlay + büyük bold Playfair Display başlık
- **Footer**: Koyu arka plan (`#0D1B2A`), beyaz metin, 4 sütun

---

## Footer

4 sütun:
- **CheckReserve** — kısa açıklama + sosyal medya ikonları
- **Ürün** — Özellikler, Fiyatlar, API, Entegrasyonlar, Değişiklik Günlüğü
- **Şirket** — Hakkımızda, Blog, Kariyer, Basın, İletişim
- **Yasal** — Gizlilik Politikası, Kullanım Şartları, KVKK, Çerez Politikası

Alt bar: `© 2024 CheckReserve. Tüm hakları saklıdır.` + Türkiye bayrağı emoji

---

## Önemli Notlar

- Görseller `assets/` klasöründe olacak; HTML içinde `<img src="assets/FILENAME">` şeklinde kullan
- Kaynak görselleri `/mnt/user-data/uploads/` konumundan proje `assets/` klasörüne kopyala
- Tüm CTA'lar ve formlar şu an için sadece görsel (backend yok), `#` veya `preventDefault` ile
- Türkçe içerik kullan (mevcut sitedeki dil tutarlılığını koru)
- Mobilde navigasyon hamburger menüye dönüşsün, JS ile toggle
