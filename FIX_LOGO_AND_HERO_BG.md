# CheckRezerve — Logo & Hero Arka Plan Düzeltme Görevi

## Sorunlar
1. **Logo**: Navbar'daki logo küçük ve kalitesiz görünüyor. Düzeltilmesi gerekiyor.
2. **Hero Arka Plan**: HTML demosunda hero'da güzel restoran fotoğrafı var ama gerçek sitede (checkrezerve.com) yok. Her sayfanın başlık bölümüne (hero/page-header) güzel arka plan görseli eklenmesi gerekiyor.

---

## GÖREV 1 — Logo Düzeltme

### Problem
Mevcut navbar'da logo küçük, icon belirsiz, genel görünüm zayıf.

### Çözüm: SVG tabanlı inline logo
`index.html` içindeki navbar logo bölümünü bul ve şununla değiştir:

```html
<!-- ESKİ LOGO KODUNU BUL VE SİL -->
<!-- Yerine bunu koy: -->
<a href="index.html" class="logo" style="display:flex; align-items:center; gap:12px; text-decoration:none;">
  
  <!-- SVG Logo İkonu — tarayıcıda mükemmel render -->
  <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Arka plan yuvarlak kare -->
    <rect width="42" height="42" rx="10" fill="url(#logoGrad)"/>
    <!-- Takvim çerçevesi -->
    <rect x="8" y="12" width="26" height="22" rx="3" fill="white" opacity="0.15"/>
    <rect x="8" y="12" width="26" height="22" rx="3" stroke="white" stroke-width="1.5"/>
    <!-- Takvim üst çıkıntılar -->
    <rect x="14" y="9" width="3" height="6" rx="1.5" fill="white"/>
    <rect x="25" y="9" width="3" height="6" rx="1.5" fill="white"/>
    <!-- Takvim çizgi -->
    <line x1="8" y1="19" x2="34" y2="19" stroke="white" stroke-width="1.5"/>
    <!-- Check mark -->
    <path d="M14 26 L19 31 L28 21" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0D6E6E"/>
        <stop offset="100%" stop-color="#1EC8A0"/>
      </linearGradient>
    </defs>
  </svg>

  <!-- Logo Yazısı -->
  <span style="font-family:'Playfair Display',serif; font-weight:700; font-size:1.3rem; color:#0D1B2A; letter-spacing:-0.02em; line-height:1;">
    Check<span style="color:#0D6E6E;">Rezerve</span>
  </span>
</a>
```

### Eğer görsel dosya kullanılacaksa (assets/logo.jpg varsa):
```html
<a href="index.html" class="logo" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
  <img 
    src="assets/logo.jpg" 
    alt="CheckRezerve" 
    style="height:40px; width:40px; object-fit:contain; border-radius:8px;"
  >
  <span style="font-family:'Playfair Display',serif; font-weight:700; font-size:1.3rem; color:#0D1B2A; letter-spacing:-0.02em;">
    Check<span style="color:#0D6E6E;">Rezerve</span>
  </span>
</a>
```

---

## GÖREV 2 — Sayfa Başlıklarına Arka Plan Görseli Ekle

Her sayfanın hero/header bölümüne aşağıdaki görselleri arka plan olarak ata.

### Mevcut Görseller (assets/ klasöründe olmalı):
```
assets/hero-restaurant.jpg   ← ideogram restoran wide-angle görseli
assets/hero-spa.jpg          ← ideogram spa treatment room görseli  
assets/hero-office.jpg       ← ideogram executive office görseli
assets/hero-phone.jpg        ← ideogram smartphone görseli
```

Eğer dosyalar farklı isimle kaydedilmişse, mevcut dosya adlarını kullan.

---

### 2a. Ana Sayfa Hero
```css
/* Ana sayfa hero section için CSS */
.hero-section, #home .hero, section.hero {
  position: relative;
  background-image: url('assets/hero-restaurant.jpg');  /* restoran wide-angle */
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;  /* parallax efekti */
  min-height: 100vh;
}

/* Koyu overlay — metni okunabilir yapar */
.hero-section::before, #home .hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(13, 27, 46, 0.82) 0%,
    rgba(13, 110, 110, 0.65) 50%,
    rgba(13, 27, 46, 0.75) 100%
  );
  z-index: 1;
}

/* Hero içeriği overlay'in üstünde */
.hero-section > *, #home .hero > * {
  position: relative;
  z-index: 2;
}

/* Hero başlık rengi beyaz yap */
.hero-section h1, .hero h1 {
  color: #ffffff !important;
}
.hero-section p, .hero p {
  color: rgba(255,255,255,0.88) !important;
}
```

---

### 2b. Özellikler Sayfası Header
```css
#features .page-header,
.features-header,
section[id="ozellikler"] .header {
  background-image: url('assets/hero-phone.jpg');
  background-size: cover;
  background-position: center top;
  position: relative;
}
#features .page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(13,27,46,0.80) 0%, rgba(13,110,110,0.60) 100%);
  z-index: 1;
}
#features .page-header > * { position: relative; z-index: 2; color: white; }
```

---

### 2c. Kullanım Alanları Sayfası Header
```css
#usage .page-header,
.usage-header {
  background-image: url('assets/hero-restaurant.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}
#usage .page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(13, 27, 46, 0.75);
  z-index: 1;
}
#usage .page-header > * { position: relative; z-index: 2; color: white; }
```

---

### 2d. Hakkımızda Sayfası Header
```css
#about .page-header,
.about-header {
  background-image: url('assets/hero-office.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}
#about .page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(13,27,46,0.85) 0%, rgba(13,110,110,0.55) 100%);
  z-index: 1;
}
#about .page-header > * { position: relative; z-index: 2; color: white; }
```

---

### 2e. İletişim Sayfası Header
```css
#contact .page-header,
.contact-header {
  background-image: url('assets/hero-spa.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}
#contact .page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(13, 27, 46, 0.72);
  z-index: 1;
}
#contact .page-header > * { position: relative; z-index: 2; color: white; }
```

---

## GÖREV 3 — HTML'de Direkt Inline Style ile Ekleme

Eğer CSS class'larını bulmak zorsa, ilgili section'ı şu şekilde düzenle:

```html
<!-- Her sayfa header section'ını şu yapıya getir: -->
<section id="SAYFA_ID" style="
  position: relative;
  background-image: url('assets/GORSEL_ADI.jpg');
  background-size: cover;
  background-position: center;
  padding: 100px 0 80px;
">
  <!-- OVERLAY DIV — bu her zaman ilk child olmalı -->
  <div style="
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(13,27,46,0.82) 0%, rgba(13,110,110,0.60) 100%);
    z-index: 0;
  "></div>
  
  <!-- MEVCUT İÇERİK — z-index ekle -->
  <div style="position: relative; z-index: 1;">
    <!-- ... mevcut başlık, badge, açıklama içeriği buraya ... -->
  </div>
</section>
```

---

## GÖREV 4 — Görsel Dosyalarını Kontrol Et ve Yeniden Adlandır

```bash
# Mevcut assets klasörünü listele
ls -la assets/

# Eğer dosyalar farklı isimde kaydedilmişse, kopyala:
cp assets/ideogram*restaurant*.jpg assets/hero-restaurant.jpg 2>/dev/null || true
cp assets/ideogram*spa*.jpg assets/hero-spa.jpg 2>/dev/null || true  
cp assets/ideogram*office*.jpg assets/hero-office.jpg 2>/dev/null || true
cp assets/ideogram*smartphone*.jpg assets/hero-phone.jpg 2>/dev/null || true

# Eğer uploads klasöründe kaynak görsel varsa:
cp "/mnt/user-data/uploads/ideogram-v3_0_A_wide-angle_atmospheric_interior_photograph_of_an_elegant_modern_restaurant_din-0.jpg" assets/hero-restaurant.jpg
cp "/mnt/user-data/uploads/ideogram-v3_0_A_high-resolution_photorealistic_shot_of_an_upscale_luxurious_Spa_treatment_room-0.jpg" assets/hero-spa.jpg
cp "/mnt/user-data/uploads/ideogram-v3_0_A_professional_ultra-modern_executive_office_desk_setting__On_a_sleek_dark_wood_-0.jpg" assets/hero-office.jpg
cp "/mnt/user-data/uploads/ideogram-v3_0_A_photorealistic_close-up_shot_of_a_modern_smartphone_screen_in_a_high-end_resta-0.jpg" assets/hero-phone.jpg

echo "Görseller hazır:"
ls -lh assets/hero-*.jpg
```

---

## ÖZET: Öncelik Sırası

1. `assets/` klasöründeki mevcut görsel dosyalarını kontrol et
2. Yoksa uploads'tan kopyala (Görev 4)
3. Logo SVG kodunu navbar'a uygula (Görev 1)
4. Her sayfa header'ına background-image ekle (Görev 3 — inline yöntemi en güvenli)
5. Tarayıcıda test et: logo net görünmeli, her sayfa başlığında fotoğraf arka plan olmalı
