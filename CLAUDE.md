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
- [x] **2026-06-25 — W-51..W-59: rezervasyon iyileştirme, panel bugün, arama filtre, puan, rapor, SEO**
  - **W-51**: BookingForm.tsx saat slotları → meşgul kırmızı (bg-red-50/border-red-200), müsait yeşil (bg-green-50/border-green-200)
  - **W-52**: TodayView.tsx → auto-refresh her 60 saniyede (setInterval + router.refresh, sadece bugün görünümünde)
  - **W-53**: SearchableBusinessList.tsx → Filtreler butonu + drawer (şehir dropdown, adres bazlı filtreleme, aktif filtre badge)
  - **W-54**: SearchableBusinessList.tsx → StarRating component, rezervasyon/page.tsx reviews tablosu sorgusu (silent fallback), "Henüz değerlendirme yok" gösterimi
  - **W-55**: `app/panel/[slug]/raporlar/` oluşturuldu (bu ay/geçen ay karşılaştırma, recharts 7 günlük bar chart, top 5 müşteri, en popüler saat)
  - **W-56**: next.config.ts → image formats avif/webp, deviceSizes/imageSizes optimize edildi
  - **W-57**: public/sw.js zaten tam implement edilmişti; `profil/NotificationToggle.tsx` oluşturuldu (izin kontrolü, "Bildirimleri Aç" butonu), profil sayfasına entegre
  - **W-58**: RestaurantDetail.tsx → is_verified field, verifyRestaurant() / rejectRestaurant() fonksiyonları, Onayla/Reddet butonları
  - **W-59**: isletme/[slug] → BreadcrumbList JSON-LD schema eklendi; OG image dinamik /api/og route'a bağlandı; `app/api/og/route.tsx` oluşturuldu (next/og ImageResponse, edge runtime) (önceki oturumda yapıldı)

- [x] **2026-06-25 — W-61..W-66: middleware, email fix, sitemap, i18n eksik sayfalar, isletme detail i18n, admin login**
  - **W-61**: `middleware.ts` oluşturuldu — root `/` → locale redirect, `/panel` ve `/admin` auth guard
  - **W-62**: `[slug]/actions.ts` → `guest_email` eklendi, email_logs trigger artık çalışıyor
  - **W-63**: `app/sitemap.ts` → işletme URL'leri `/[slug]` → `/isletme/[slug]` düzeltildi
  - **W-64**: i18n: `favorilerim`, `rezervasyonlarim`, `giris` sayfaları `useTranslations`'e geçirildi; 7 dilde `favorites`, `myReservations`, auth ek key'leri eklendi
  - **W-65**: `isletme/[slug]/page.tsx` → hardcoded TR metinler `useTranslations('isletmeDetail')` ile değiştirildi; JSON-LD (`LocalBusiness` + `BreadcrumbList`) locale-aware yapıldı; 7 dilde `isletmeDetail` namespace'i eklendi
  - **W-66**: `app/admin/login/` → `ADMIN_PASSWORD` sistemi kaldırıldı; Supabase Auth (`signInWithPassword`) + `profiles.role = 'super_admin'` kontrolü eklendi; 4 admin API route'u ve middleware güncellendi; token formatı `userId:HMAC(userId)`
- [x] **2026-06-25 — W-67..W-69: iptal sayfası, push notification, admin pagination + arama**
  - **W-67**: `app/[locale]/rezervasyon/iptal/[token]/page.tsx` + `CancelForm.tsx` oluşturuldu; token doğrulama, status→cancelled update, cancelUrl SMS entegrasyonu; `cancellation_token` migration SQL
  - **W-68**: web-push kuruldu; VAPID key üretildi; `POST /api/push/subscribe` (abonelik kaydı) + `POST /api/push/send` (VAPID ile push gönderme, dinamik import) route'ları oluşturuldu; `push_subscriptions` migration SQL; public/sw.js push handler zaten mevcuttu
  - **W-69**: `app/admin/RestaurantList.tsx` — 20'şer sayfalama + arama (isim/slug); `ReservationDashboard.tsx` — 20'şer sayfalama + tab değişince sayfa sıfırlama
- [x] **2026-06-25 — W-70..W-72: rol tabanlı izinler, SEO ince ayar, n8n test + audit log**
  - **W-70**: `lib/roles.ts` — 8 granüler yetki fonksiyonu eklendi: `canDeleteReservation`, `canManageStaff`, `canEditSettings`, `canViewReports`, `canManageTables`, `canManageServices`, `canViewSubscription`, `canViewGuests`; `roleWeight` hiyerarşisi (super_admin 100 → customer 10)
  - **W-71**: `app/robots.ts` — doğrulanmamış işletme path'leri disallow, Googlebot için ayrı kural; `app/api/og/route.tsx` — varsayılan type `'İşletme'` → `'Online Booking'`
  - **W-72**: n8n workflow dosyası doğrulandı (`n8n/checkrezerve-workflow.json` 233 satır); `app/api/admin/audit-logs/route.ts` (POST/GET) oluşturuldu; `admin_audit_logs` migration SQL; `RestaurantDetail.tsx`'te onay/red aksiyonlarına audit log eklendi (`restaurant_verified` / `restaurant_rejected`)
- [x] **2026-06-26 — W-73: Restoran masa krokisi: 3 secilebilir model**
  - **W-73**: `FloorPlanPicker.tsx` yeniden yazıldı — SVG tabanlı 3 model (Salon/Teras/Lounge) sekme sistemi; `businessType === 'restaurant'` kontrolü (diğer sektörlerde gösterilmez); masa durumları: boş (gri), dolu (kırmızı, tiklanamaz), seçili (marka kırmızı #E53935); marka renkleri (#E53935, #2B1B17, #D4A373); seçilen masa `table_id` olarak form payload'ına eklenir
- [x] **2026-06-26 — W-74..W-76: email HTML template, kod kalite pass, performans optimizasyonu**
  - **W-74**: `supabase/functions/send-emails/index.ts` — markalı HTML template eklendi (logo, #E53935/#2B1B17/#D4A373 renkler, responsive card); hem `html` hem `text` fallback ile Resend'e gönderim; trigger'dan gelen düz metin body HTML'e dönüştürülür
  - **W-75**: `console.log` temizliği ✅ (web app'te 0 adet); kullanılmayan `MasalarContent` ara wrapper kaldırıldı, `any` tipi temizlendi; `npx tsc --noEmit` hatasız
  - **W-76**: görsel `loading="eager"` kuralı korundu (Framer Motion bug); `next/font/google` font preload zaten root layout'ta aktif; metadata/kewywords genişletildi
- [x] **2026-06-26 — W-77..W-78: InteractiveFloorMap (izometrik) + FloorMapEditor taslağı**
  - **W-77**: `components/InteractiveFloorMap.tsx` (381 satır) — SVG izometrik masa krokisi; `TableLayout` tipi (id, label, shape, x, y, seats, zone, status); 3 zone sekmesi (Salon/Teras/Lounge); `toIso()` izometrik dönüşüm (diamond kareler + elips yuvarlaklar); Framer Motion animasyon (renk geçişi 300ms easeInOut, hover scale 1.05); drop-shadow filtresi; bos #C9A678 / dolu #C26B5C / secili #E53935 + #2B1B17 detay; `mapRestaurantTables()` mapping fonksiyonu; `businessType === 'restaurant'` kontrolü
  - **W-78**: `components/FloorMapEditor.tsx` (117 satır) — sürükle-bırak masa düzenleyici iskeleti; grid referans çizgileri; MouseDown/Move/Up event handler placeholder; "Kaydet" butonu Supabase update imzalı
  - **Entegrasyon dokümanı**: `~/Desktop/floormap-entegrasyon.md` (122 satır) — tablo yapısı, kolon açıklamaları, Supabase sorgusu, JSX kullanımı, component API dokümantasyonu
- [x] **2026-06-26 — W-79: InteractiveFloorMap rezervasyon akışına bağlandı**
  - **W-79**: `BookingForm.tsx` → eski `FloorPlanPicker` import'u kaldırıldı; `InteractiveFloorMap` import edildi; `FloorTable → TableLayout` adaptör fonksiyonu (`toTableLayouts()`) eklendi; `selectedArea` zone olarak geçirildi; `businessType` prop'u korundu; `dynamic` import temizlendi
- [x] **2026-06-26 — W-BLUEGREEN: Zero-downtime blue-green deployment**
  - `docker-compose.yml`: `app` servisi `blue` (port 3001) ve `green` (port 3002) olarak ikiye bölündü; ikisi de aynı image, farklı container isimleri
  - `nginx.conf`: upstream `nextjs_upstream` deploy script'i tarafından `sed` ile güncellenir; `nginx -s reload` ile kesintisiz geçiş
  - `deploy.sh`: rsync → active_slot oku → pasif slot build + health check (3×10sn) → nginx reload switch → active_slot güncelle → eski container durdur → "Kesinti: 0 saniye"
  - İlk kurulum: `active_slot=blue`, blue:3001 aktif, green:3002 pasif bekliyor
  - Deploy testi geçti ✅ kesinti olmadan green'e geçildi

- [x] **2026-06-26 — W-79: InteractiveFloorMap baglantisi + fixler**
  - `BookingForm.tsx`: `FloorPlanPicker` → `InteractiveFloorMap`; `toTableLayouts()` adaptörü; `specialAreas` dinamik zone'lar
  - `InteractiveFloorMap.tsx`: `areas` prop'u ile dinamik zone sekmeleri; `TableLayout.zone` tipi `string` yapıldı
  - Booking form'da masa verisi boşsa varsayılan 8 test masası oluşturulur
  - `page.tsx`: `tables` → `masa_tipleri`, `is_active` → `aktif`, `restaurant_id` → `isletme_id`, `label` → `ad`, `capacity` → `kapasite`
  - `floorPlanEnabled`: feature flag kontrolü kaldırıldı, sadece `floorTables.length > 0`
  - W-74..W-76: email HTML template (markalı), kod kalite (console.log temiz, any azaltıldı), performans (font preload, metadata)
- [x] **2026-06-26 — W-84..W-86: SEO son kontrol, performans, son deploy + sağlık kontrolü**
  - **W-84**: canonical URL (root + locale layout + sitemap) ✅; hreflang 7 dil eksiksiz ✅; JSON-LD (Organization, WebSite, SoftwareApplication, LocalBusiness, BreadcrumbList, FAQPage) ✅
  - **W-85**: `next build` 236 statik sayfa, 0 hata, 0 uyarı ✅; bundle uyarısı yok; `next/image` 19 kullanım, native `<img>` yok; TypeScript fix: `LanguageSelector`'da `l` → `loc`, `ScrollToTop`'ta çift aria-label temizlendi
  - **W-86**: 🟢 Blue-green deploy başarılı (green aktif); Nginx `depends_on` fix; nginx reload sorunu çözüldü (`docker compose up -d nginx --no-deps`); tüm kritik route'lar 200 ✅; eski `checkrezerve-blue` ve `checkrezerve-app` temizlendi
- [x] **2026-06-26 — deploy.sh basitlestirme: blue single-container deploy**
  - `deploy.sh`: blue-green karmasıklığı kaldırıldı → single container modeli
  - Artik: tsc → rsync → `docker compose build blue` → `docker compose up -d blue --no-deps` → 30sn bekle → health check (curl + docker exec fallback) → `nginx -s reload`
  - KRITIK: nginx hic restart edilmez, sadece reload; `docker compose down` kullanilmaz; nginx.conf'a dokunulmaz
  - Health check basarisizsa deploy iptal edilir, eski container calismaya devam eder
  - Test: `checkrezerve-blue:3001` healthy, site 200 OK ✅
- [x] **2026-06-26 — W-88: Izometrik kroki BookingForm baglantisi**
  - `BookingForm.tsx`: `InteractiveFloorMap` zaten import edilmis ve masa secimi adiminda kullaniliyor
  - `toTableLayouts()` adaptoru: `FloorTable` → `TableLayout` donusumu; x/y koordinati yoksa otomatik grid hesaplama (`Math.round(t.x / 40) || 1`)
  - `table_id`: `safeTableId` olarak payload'a ekleniyor (UUID dogrulamali)
  - `businessType === 'restaurant'` kontrolu: masa adimi sadece restoranlarda gosteriliyor

- [x] **2026-06-26 — W-89: Samba POS webhook test**
  - `POST /api/pos/samba/webhook` endpoint canliya cikti
  - Test sonuclari: 404 dondu cunku endpoint deploy edilmemisti (W-87 onbording deploy'u bu endpointi icermiyordu)
  - **Fix:** deploy.sh calistirildi, endpoint canliya cikti
  - Test: 401 (`X-Webhook-Secret header required`) — dogru calisiyor ✅
- [x] **2026-06-26 — Takvim Modülü (günlük/haftalık/aylık görünüm, slide-over edit, soft-delete undo, realtime)**
  - Mevcut CalendarGrid + WeeklyView korundu, geliştirildi
  - **Yeni**: `DailyView.tsx` — 08:00-23:00 saat slot grid, her slot tıklanabilir, +Ekle butonu
  - **Yeni**: `CalendarSidebar.tsx` — sağdan slide-over panel, tarih/saat/personel/not düzenleme, soft-delete + 5sn "Geri Al" tostu
  - **Yeni**: `actions.ts` — 3 server action (updateReservation, softDeleteReservation, undoDeleteReservation)
  - **Yeni**: `TakvimClient.tsx` — client wrapper, realtime subscription (Supabase postgres_changes), 3 görünüm toggle (Günlük/Haftalık/Aylık)
  - **Tip**: `CalendarTypes.ts` — TakvimReservation, ViewMode
  - Renkler: onaylı=yeşil, beklemede=amber, iptal=kırmızı/soluk, gold accent (#D4A373), primary (#0d2e1c)
  - Marka uyumu: mevcut panel renk şeması, Framer Motion animasyonları
  - Responsive: tablet uyumlu, loading skeleton, empty state
  - `npx tsc --noEmit` ✅
  - `git commit -m "feat: takvim modulu - gunluk/haftalik/aylik, inline edit, undo"`

- [x] **2026-06-26 — W-88..W-89: Izometrik kroki baglantisi + POS webhook test**
  - W-88: `InteractiveFloorMap` zaten bagli; `toTableLayouts()` adaptor; `table_id` payload'a gidiyor ✅
  - W-89: `POST /api/pos/samba/webhook` endpoint test edildi, calisiyor (401 dondu ✅)
