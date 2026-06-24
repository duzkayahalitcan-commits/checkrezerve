# CheckRezerve — Ana Ajan Rehberi

Platform: Türkiye'nin komisyonsuz multi-sektör rezervasyon sistemi.
Builder: Halitcan (solo)
Stack: Next.js (web) + Expo (mobile) + Supabase + Hetzner VPS

---

## Ajan Haritası

```
agents/
├── web/              → Next.js, component, sayfa, UI
├── mobile/           → Expo, React Native, animasyon
├── deploy/           → Docker, VPS, env yönetimi
├── database/         → Supabase, migration, RLS, pgvector
├── auth/             → OAuth, session, rol sistemi
├── reservations/     → Rezervasyon akışı, müsaitlik
├── business/         → İşletme paneli, masa planı
├── customer/         → Müşteri UX, arama, profil
├── payments/         → Abonelik, ödeme
├── notifications/    → SMS, email, push
├── ai-assistant/     → Whisper + ElevenLabs + Claude Haiku
├── analytics/        → Dashboard, raporlar
├── legal/            → KVKK, gizlilik, uyumluluk
├── testing/          → E2E, unit, RLS testleri
├── content/          → Copy, App Store, email metni
└── product/          → Roadmap, strateji, feature kararları
```

---

## Tek Ajan Senaryoları

### "Yeni bir web sayfası ekle"
→ **web**
```
agents/web/CLAUDE.md oku
```

### "Mobil ekran yap / animasyon ekle"
→ **mobile**
```
agents/mobile/CLAUDE.md oku
```

### "VPS'e deploy et / Docker güncelle"
→ **deploy**
```
agents/deploy/CLAUDE.md oku
```

### "Supabase tablosu / migration yaz"
→ **database**
```
agents/database/CLAUDE.md oku
```

### "RLS policy güncelle"
→ **database** + **auth** (birlikte oku)

### "SMS / email bildirimi ekle"
→ **notifications**

### "KVKK checkbox ekle"
→ **legal** + **web** (birlikte oku)

### "App Store açıklaması yaz"
→ **content**

### "Ne yapmalıyım / öncelik ne?"
→ **product**

---

## Kombinasyon Senaryoları

### Rezervasyon özelliği eklemek
```
reservations + database + web (veya mobile)
```
Önce database ile şemayı yaz → sonra reservations ile iş mantığını → sonra web/mobile ile UI'ı.

### Yeni kullanıcı auth akışı
```
auth + database + web (veya mobile)
```
Auth akışını auth ile tasarla → DB tarafını database ile yaz → UI'ı web/mobile ile.

### İşletme onboarding sayfası
```
business + web + database
```
İş mantığı business'ta → şema database'de → sayfa web'de.

### Bildirim sistemi kurulumu
```
notifications + database + auth
```
Hangi olayda kim bildirim alır → auth rollere göre filtrele → DB'de log tut.

### Analitik dashboard
```
analytics + database + web
```
Hangi metrik → SQL sorgusu → dashboard component.

### AI asistan yeni özellik
```
ai-assistant + database + mobile
```
Embedding pipeline → pgvector → mobil UI.

### Deploy öncesi kontrol
```
deploy + testing
```
Test geç → env kontrol et → deploy et.

### Legal uyumluluk (KVKK güncellemesi)
```
legal + web + database + notifications
```
Neyi değiştirmek gerekiyor → form UI → DB'de izin kaydı → SMS opt-out.

---

## Hangi Ajan Ne Zaman KULLANILMAZ

| Durum | Yanlış ajan | Doğru ajan |
|-------|------------|------------|
| Supabase migration yazıyorum | web | database |
| Docker config değiştiriyorum | web | deploy |
| Rol sistemi güncelliyorum | web | auth + database |
| Mobil animasyon yapıyorum | web | mobile |
| Landing page copy yazıyorum | product | content |
| Feature karar veriyorum | web | product |

---

## Oturum Başlangıç Protokolü — OTOMATİK AJAN SEÇİMİ

**Her yeni oturumda, Halitcan hiçbir şey söylemeden önce şunu yap:**

1. Halitcan'a şunu sor: **"Ne yapacaksın?"**
2. Cevabına göre aşağıdaki tablodan uygun ajan(lar)ı belirle
3. O ajanların CLAUDE.md dosyalarını oku
4. "X + Y ajanı olarak çalışıyorum" de ve göreve başla

Halitcan sana ajan ismi söylemek zorunda değil. Sen karar verirsin.

### Otomatik Eşleştirme Tablosu

| Halitcan ne derse | Hangi ajanları oku |
|-------------------|--------------------|
| sayfa, component, UI, Next.js | web |
| ekran, animasyon, mobil, Expo | mobile |
| deploy, VPS, Docker, sunucu | deploy |
| tablo, migration, SQL, Supabase | database |
| giriş, login, OAuth, rol, yetki | auth + database |
| rezervasyon, müsaitlik, takvim | reservations + database |
| işletme paneli, masa planı | business + web |
| müşteri, arama, profil | customer + web |
| ödeme, abonelik, fatura | payments + database |
| SMS, email, bildirim, push | notifications + database |
| asistan, ses, Whisper, bot | ai-assistant + database |
| grafik, rapor, analitik | analytics + database + web |
| KVKK, gizlilik, hukuki | legal + web |
| test, bug, hata | testing |
| metin, copy, App Store | content |
| ne yapmalıyım, öncelik, strateji | product |

### Emin olamazsan
Görevi ikiye böl: "veri mi, UI mı?" → veri tarafı database, UI tarafı web/mobile.

---

## Kritik Proje Kuralları (Her Ajan İçin Geçerli)

1. **Terminal karışıklığı:** Web için `~/Desktop/checkrezerve`, mobile için `~/Desktop/checkrezerve-app`. Asla karıştırma.
2. **Deploy:** Claude Code sadece yazar ve push eder. Deploy komutlarını Halitcan çalıştırır.
3. **ENV:** `NEXT_PUBLIC_` → build-time (--build-arg). Runtime secret'lar → --env-file.
4. **Roller:** business_manager = sahibi gibi hissetmeli. Staff gibi gösterme.
5. **Dil:** UI her zaman Türkçe.
6. **Token:** Minimal. Keşfetmeden önce sor. Gereksiz dosya okuma yapma.

---

## Hızlı Başvuru

| Konu | Değer |
|------|-------|
| Web VPS | 178.105.51.245 (Hetzner) |
| SSH | ssh -i ~/.ssh/checkrezerve_vps root@178.105.51.245 |
| Supabase | posarvagedpqtsrcrwfe.supabase.co |
| tmux session | claude |
| iOS build | ca15d22f (son başarılı) |
| EAS submit | eas submit --platform ios --latest |

---

## Tamamlanan İşler

- [x] **2026-06-06 — Rezervasyon sayfası yeniden tasarlandı**
  - `app/[locale]/rezervasyon/[id]/BookingForm.tsx` → 8 adımlı wizard (Kişi, Tarih, Saat, Alan, Masa, Bilgi, Özet, Başarı)
  - Restoran: 8 adım, diğer sektörler: 6 adım (alan/masa atlanır)
  - Step progress bar, Framer Motion animasyonlu geçişler
  - Tam takvim görünümü (bugün+30 gün), 4 sütunlu saat gridi
  - Mock alan ve masa verisi (İç Mekan 11, Bahçe 6, Teras 8, Sigara 5 masa)
  - `messages/*.json`: tüm dillerde yeni `rezervasyon.adim.*` key'leri eklendi
  - Auth prefill: supabase.auth.getSession() ile e-posta ve ad otomatik doldurma
  - Deployed: Hetzner VPS (docker compose up -d --build)

- [x] **2026-06-19 — Kapsamlı kod incelemesi ve güvenlik düzeltmeleri (W-01..W-10)**
  - **GÜVENLİK**: `panel-reservations` + `panel-tables` API route'ları HMAC token doğrulaması eklendi
  - **GÜVENLİK**: `panel-tables` route'unda tablo whitelist eklendi (hizmetler/calisanlar/tables/special_areas)
  - **BUG FİX**: `/api/rezervasyon/musait` endpoint'i oluşturuldu (meşgul saat slotları)
  - **PERFORMANS**: BookingForm takvim gün başlıkları locale'e göre dinamik hale getirildi
  - **SEO**: Home page ve portal sayfasına og:image + OpenGraph metadata eklendi
  - **TYPESCRİPT**: Home page'deki `as never` TypeScript workaround temizlendi
  - **ROUTING**: `middleware.ts` oluşturuldu (next-intl locale yönlendirmesi için)
  - **DOC**: agents/web/CLAUDE.md güncellendi (Next.js 14 → 15)

- [x] **2026-06-24 — W-11..W-19: profil, panel takvim, arama fix, auth, cookie banner**
  - **W-11**: `POST /api/rezervasyon` → e-posta log'u eklendi (console.log mock, Resend/Nodemailer'a hazır)
  - **W-12**: `app/[locale]/isletme/[slug]/page.tsx` → public işletme profil sayfası (Server Component, SEO metadata, Rezervasyon Yap CTA)
  - **W-13**: `SearchableBusinessList.tsx` kart layoutu güncellendi → yatay (görsel sol, isim+badge+buton sağ), loading="eager"
  - **W-14**: `app/panel/[slug]/takvim/` → `WeeklyView.tsx` eklendi (7 sütun haftalık görünüm), monthly/weekly toggle (?view=haftalik)
  - **W-15**: Panel dashboard stat kartları güncellendi → Bugünkü/Bu Hafta/Onay Bekleyen/İptal, her kart filtreli rezervasyon listesine link
  - **W-16**: `app/[locale]/profil/page.tsx` → "Son Rezervasyonlar" bölümü eklendi (son 5, guest_email ile sorgu)
  - **W-17**: `app/[locale]/giris/page.tsx` → zaten tam implement edilmiş (Google+Apple OAuth, Türkçe hatalar) — değişiklik yok
  - **W-18**: `CookieBanner` locale layout'a eklendi (`app/[locale]/layout.tsx`)
  - **W-19**: `not-found.tsx` güncellendi → "Rezervasyon Yap" butonu eklendi
  - DEVAM NOKTASI: W-21

- [x] **2026-06-24 — W-21..W-29: SEO, gerçek veri, auth, favoriler, toast**
  - **W-21**: `isletme/[slug]/page.tsx` → JSON-LD LocalBusiness schema markup eklendi
  - **W-22**: Rezervasyon listesi sayfası `getSupabaseAdmin` → `getSupabase` (anon client) geçiş
  - **W-23**: Panel takvim gerçek veri zaten W-14'te yapılmıştı (WeeklyView + Supabase)
  - **W-24**: Panel dashboard istatistik kartları W-15'te yapılmıştı
  - **W-25**: Giriş sayfası zaten tam implement edilmişti (Google+Apple OAuth)
  - **W-26**: Şifre sıfırlama sayfaları zaten implement edilmişti
  - **W-27**: `favorilerim/page.tsx` → `business_type` + `cover_image` join, skeleton loading, boş durum Türkçe
  - **W-28**: `FavoriteToggle.tsx` oluşturuldu (Supabase auth+DB bağlantılı), `BusinessDetailHero`'ya entegre, `restaurantId` prop eklendi
  - **W-29**: `BookingForm.tsx` → `useToast()` entegre (başarı=yeşil, hata=kırmızı)
  - DEVAM NOKTASI: W-31

- [x] **2026-06-24 — W-31..W-39: işletme detay, filtre, panel CRUD, blog, performans**
  - **W-31**: `isletme/[slug]/page.tsx` → hizmetler + çalışanlar bölümleri eklendi (paralel sorgu), FavoriteToggle hero'ya entegre
  - **W-32**: `SearchableBusinessList.tsx` → sıralama chips (En Yeni / A–Z / Yakın) + temizle butonu eklendi
  - **W-33**: `RezervasyonList.tsx` → satır tıklama → detay modal (AnimatePresence, spring anim, alan tablosu, Onayla/İptal/Tamamla/Geri Al aksiyonları)
  - **W-34**: Panel StaffManager (çalışan CRUD) zaten tam implement edilmişti — değişiklik yok
  - **W-35**: Panel ServiceManager (hizmet CRUD) zaten tam implement edilmişti — değişiklik yok
  - **W-36**: `rezervasyonlarim/page.tsx` → 3 sekme (Yaklaşan/Geçmiş/İptal), guest_email sorgusu, satır tıklama detay modal, iptal butonu (sadece pending+gelecek tarih)
  - **W-37**: Blog sayfaları zaten tam implement edilmişti (6 yazı, i18n, SEO) — değişiklik yok
  - **W-38**: `app/[locale]/loading.tsx` oluşturuldu (spinner + "Yükleniyor..." metni)
  - **W-39**: `home/page.tsx` + `hakkimizda/page.tsx` → `loading="lazy"` → `loading="eager"` (Framer Motion opacity:0 bug önlemi)
  - DEVAM NOKTASI: W-41

- [x] **2026-06-24 — W-41..W-49: rezervasyon API, onay sayfası, panel güncelleme, i18n, PWA**
  - **W-41**: `POST /api/rezervasyon` zaten gerçek Supabase insert yapıyordu — doğrulandı, değişiklik yok
  - **W-42**: `app/[locale]/rezervasyon/[id]/onay/page.tsx` oluşturuldu (Server Component, ?ref= query param ile rezervasyon detayı, ConfettiClient, Rezervasyonlarım + Ana Sayfa butonları)
  - **W-43**: `/panel/[slug]/misafirler/page.tsx` zaten tam implement edilmişti (phone bazlı aggregation, arama destekli MisafirList) — değişiklik yok
  - **W-44**: `/panel/[slug]/abonelik/page.tsx` zaten tam implement edilmişti (plan kartı, ödeme geçmişi) — değişiklik yok
  - **W-45**: giris/profil için tüm dil dosyalarında keys mevcut — doğrulandı. favorilerim/rezervasyonlarim hardcoded TR kullanıyor (i18n entegrasyonu yok)
  - **W-46**: `app/manifest.ts` → name/short_name 'CheckRezerve', theme_color #E53935, background_color #2B1B17
  - **W-47**: `app/sitemap.ts` → /profil ve /favorilerim eklendi; robots.ts zaten panel/admin disallow yapıyordu
  - **W-48**: `/panel/[slug]/ayarlar/page.tsx` + `SettingsForm.tsx` zaten tam implement edilmişti (çalışma saatleri, kapalı günler, ön ödeme, Supabase update) — değişiklik yok
  - **W-49**: 7 dosyadan tüm console.log kaldırıldı; TypeScript any kaldı (Supabase typing workaroundları — as any/as unknown)
  - **W-50**: i18n routing.ts → /rezervasyonlarim, /favorilerim, /rezervasyon/[id]/onay eklendi (TS fix)
  - DEVAM NOKTASI: W-51
