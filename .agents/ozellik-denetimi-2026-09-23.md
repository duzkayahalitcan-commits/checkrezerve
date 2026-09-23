# Özellik Denetimi — 2026-09-23 (web: `checkrezerve`, branch `gece-2026-09-23`)

Girdi: `urun-plani/1-urun-gereksinimleri.md` (153 madde). Bu oturum **web** oturumudur: `A` maddeleri KAPSAM DIŞI, `W+A` maddelerinin web tarafı denetlendi.
Yöntem: kod araması (`grep -rn -i`) + akış izleme (UI → API → DB) + DB'de SELECT (şema, CHECK, satır sayısı). SC maddelerinde gece raporu G4/G7 çıktıları kullanıldı. Emin olunmayanlar "DOĞRULANMADI".
**Not:** Denetim anındaki kod = `gece-2026-09-23` branch'i (gece commit'leri dahil). **Prod'daki kod 20 Eylül tarihli ve daha eski** (gece raporu G1).

## Bölüm A — Skor tablosu

| Bölüm | P0 VAR/toplam | P1 VAR/toplam | P2 VAR/toplam |
|---|---|---|---|
| 1.1 Takvim | 1/7 | 0/7 | 0/3 |
| 1.2 Kaynaklar | 3/5 | 0/3 | 0/2 |
| 1.3 CRM | 0/3 | 1/5 | 0/1 |
| 1.4 İletişim | 0/6 | 0/2 | 1/3 |
| 1.5 Kanallar | 0/1 | 0/4 | 0/1 |
| 1.6 Ödeme | — | 0/1 | 0/3 |
| 1.7 Raporlar | 0/1 | 0/6 | — |
| 1.8 Hesap/abonelik | 0/4 | 0/5 | 0/1 |
| 1.9 Entegrasyon | — | 0/1 | 0/3 |
| 2 Müşteri | 1/6 | 1/5 | 0/2 |
| 3.1 Yasal | 1/8 | 0/2 | — |
| 3.2 Güvenlik | 2/7 | 0/2 | — |
| 3.3 İzleme | 0/4 | 0/2 | 0/1 |
| 3.4 Performans/SEO | 1/4 | 0/2 | 0/1 |
| 3.5 Mobil | kapsam dışı (A) | kapsam dışı (A) | kapsam dışı (A) |
| 4 Premium | 0/3 | 0/6 | 0/6 |
| **Toplam (web)** | **9/59** | **2/53** | **1/27** |

Durum dağılımı (153 madde): KISMİ 73, YOK 47, KAPSAM 14, VAR 12, STUB 7

**Ürün satışa hazır mı?** Hayır — P0'ların sadece 9/59'u tam karşılanıyor. En kritik P0 eksikleri: **hizmetli web rezervasyonu FK hatasıyla kırık** (CH-01/CU-04, gece G2), **panelde manuel rezervasyon oluşturulamıyor** (OP-03), **kapalı günler müşteri formunda uygulanmıyor** (OP-11), **server action'larda işletme sahipliği açığı** (AC-01/SC-01), **mesaj gönderim logu ve cron alarmı yok** (OB-04/05), **hata izleme ve uptime alarmı yok** (OB-01/02), **fatura, mesafeli satış ve iade politikası yok** (AC-05, LG-05/06), onay SMS'indeki **iptal linki kırık** (CM-01).

> Okuma notu: "KISMİ" sayısı yüksek (73) çünkü kabul kriterleri sıkı; çoğu özelliğin çekirdeği var, eksik olan kenar koşullar (filtreler, log, zaman damgası). "STUB" 7 madde: UI veya flag var ama işlevsiz.

## Bölüm B — P0 eksikleri (VAR olmayan 50 P0)

"Bu gece otonom?" sütunu `urun-plani/3-uygulama-kuyrugu.md` kurallarına göre (YAPMA listesi, DB yazma yasağı, ödeme/auth davranışı).

| ID | Özellik | Durum | Ne eksik | Gereken iş | Şema? | Büyüklük | Bu gece otonom? |
|---|---|---|---|---|---|---|---|
| OP-03 | Manuel rezervasyon ekleme | STUB | "Yeni Rezervasyon" butonu (`app/panel/[slug]/page.tsx:164-166`, `masalar/MasalarContent.tsx:141-145`) sadece günlük takvime gidiyor; panelde rezervasyon **oluşturan** hiçbir form/API yok (`takvim/actions.ts` sadece update/delete) | Panelde "Yeni rezervasyon" modalı + `POST /api/panel/reservations` (session tenant, telefonla müşteri bulma, source=phone). Dosyalar: takvim/DailyView, yeni API route | hayır | M | Evet (M) |
| OP-06 | Rezervasyon durumları | KISMİ | DB CHECK sadece pending/confirmed/cancelled/completed; `arrived/seated`, `no_show` yok, geçiş zaman damgası yok | Status CHECK'e arrived/no_show + zaman damgası kolonları (confirmed_at, arrived_at…); panel butonları | evet | M | Hayır — şema + tüm durum filtreleri etkilenir, sabah karar |
| OP-07 | Onay modu (otomatik/manuel) | STUB | `auto_confirm` flag admin UI'da var (`app/admin/FeatureFlagManager.tsx:25`) ama hiçbir kod okumuyor; tüm web rezervasyonları `pending` (`app/api/rezervasyon/route.ts:113`). "Onay Bekleyen" sayacı var (`page.tsx:155`) | `auto_confirm` flag'i `api/rezervasyon` insert'inde okunur → açıksa status=confirmed | hayır | S | Evet (flag varsayılan kapalı, davranış değişmez) |
| OP-08 | Çakışma ve kapasite kontrolü | KISMİ | Masa: `check_reservation_availability` RPC (`api/rezervasyon/route.ts:54`); bölge kapasitesi say-sonra-yaz (race'e açık, `:74-97`); **çalışan çift rezervasyonu sunucuda kontrol edilmiyor**; müsaitlik hizmet filtresi bug'ı (gece raporu G2 K4) | `api/rezervasyon`'da calisan_id için aynı tarih/saat çakışma sorgusu (409); zone kontrolü RPC'ye taşınmalı (race) | hayır | M | Evet (çalışan kontrolü) |
| OP-11 | Kapalı günler / özel saatler | KISMİ | Panelde kaydediliyor (`app/panel/[slug]/ayarlar/SettingsForm.tsx:33,112` → `api/panel-settings/route.ts:35`) ama **müşteri formu ve API `closed_dates`'i hiç okumuyor**; özel saat ve resmi tatil önerisi yok | `api/rezervasyon` + BookingForm: `closed_dates` günlerinde rezervasyon reddi / kapalı gösterim | hayır | S | Evet (öncelik 5) |
| OP-13 | Arama ve filtre | KISMİ | `app/panel/[slug]/rezervasyonlar/RezervasyonList.tsx:75-88` isim/telefon, durum, tek tarih, alan; **tarih aralığı, çalışan, kaynak kanal filtresi yok** | RezervasyonList: tarih aralığı, çalışan, kaynak filtresi | hayır | S | Evet (öncelik 5) |
| RS-04 | Çalışan-hizmet eşlemesi | KISMİ | Panelde eşleme var (`StaffManager.tsx:32,110`, calisan_hizmetler) ama **müşteri formu çalışanları hizmete göre filtrelemiyor** (`rezervasyon/[id]/page.tsx:48` tüm aktif çalışanlar) | BookingForm çalışan listesini `calisan_hizmetler`'e göre filtrele (eşleme yoksa hepsi) | hayır | S | Evet |
| RS-05 | Hizmet yönetimi | KISMİ | `app/panel/[slug]/hizmetler/ServiceManager.tsx:29-36` ad/süre/fiyat/kategori/renk; **açıklama ve görsel yok**, müşteri formunda kategoriye göre sıralama yok (`order(created_at)`) | hizmetler'e `aciklama`, `gorsel_url` kolonları + form; müşteri formunda kategori sırası | evet | S | Kısmen — sıralama evet, kolonlar SQL-GEREKLİ |
| CR-01 | Müşteri kartı | KISMİ | `app/panel/[slug]/misafirler/page.tsx:30-52` rezervasyonlardan telefonla tekilleştiriyor (ad, telefon, ziyaret, son ziyaret); **e-posta ve toplam harcama yok** — `guests` tablosu 0 satır, hiçbir kod doldurmuyor | Misafirler sayfasında e-posta ve harcama agregasyonu (rezervasyon + hizmet fiyatı) veya guests tablosunu besleme | hayır | M | Evet (agregasyon, şemasız) |
| CR-02 | Müşteri notları | STUB | `musteri_notlari` tablosu web kodunda hiç kullanılmıyor; MisafirList not kaydı `guests.notes`'a anon client ile yazıyor (`MisafirList.tsx:269`) → guests boş olduğu için işlevsiz; KVKK sağlık verisi uyarısı yok | Not için API route (admin client) + UI; KVKK uyarısı | hayır | M | Evet (M) |
| CR-06 | Ziyaret geçmişi | KISMİ | `app/panel/[slug]/rezervasyonlar/RezervasyonList.tsx:354,403-420` rezervasyon detayında aynı telefonun geçmişi; müşteri kartında (misafirler) tam geçmiş listesi ve hizmet/çalışan bilgisi yok | Misafir kartında tam geçmiş (hizmet/çalışan adıyla) | hayır | S | Evet (öncelik 5) |
| CM-01 | Onay mesajı | KISMİ | `lib/notification-orchestrator.ts:65-104` + `notification-service.ts:221`; **iptal linki yanlış yol** (`orchestrator.ts:82` `/iptal/<token>` → gerçek sayfa `/tr/rezervasyon/iptal/<token>`, 404) | `lib/notification-orchestrator.ts:82` iptal URL'i → `/tr/rezervasyon/iptal/` | hayır | S | Evet (tek satır) |
| CM-02 | Hatırlatma | KISMİ | `api/send-reminders/route.ts` + `.github/workflows/daily-reminders.yml` günde 1 kez 09:00, sadece **aynı gün** (24s/2s ayarı yok); gönderim sonucu kalıcı loglanmıyor, `reminder_sent` güncellenmiyor | 24s/2s zamanlama + `reminder_sent` işaretleme + log | hayır | M | Kısmen — gönderim davranışı değil, sadece log/işaretleme |
| CM-03 | Kanal seçimi + fallback | KISMİ | `lib/notification-service.ts:181-183` tek sağlayıcı `SMS_PROVIDER` env ile; WhatsApp→Netgsm otomatik fallback yok | WhatsApp başarısızsa Netgsm fallback | hayır | M | Hayır — sağlayıcı değişikliği YAPMA listesinde |
| CM-04 | Müşteri iptal/erteleme linki | KISMİ | `app/[locale]/rezervasyon/iptal/[token]/` giriş gerektirmeyen iptal var; token imzasız ve süresiz, son iptal saati politikası yok, erteleme yok; onay SMS'indeki link kırık (CM-01) | Token geçerliliği (rezervasyon geçmişse iptal edilemez) + son iptal saati | hayır | M | Evet (geçmiş engeli); politika saati şema ister |
| CM-06 | İYS / ticari ileti onayı | KISMİ | Toplu SMS yalnızca `sms_consent=true` rezervasyonlara (`bildirimler/actions.ts:104-127`); İYS entegrasyonu yok; ana booking API (`api/rezervasyon`) `sms_consent` almıyor | İYS entegrasyonu + BookingForm'da ayrı ticari ileti onayı + API'de sms_consent | hayır | L | Kısmen — onay kutusu (LG-02) evet, İYS hayır |
| CM-09 | İşletmeye bildirim | KISMİ | Panel içi realtime zil (`app/panel/_components/NotificationBell.tsx`), işletme sahibine SMS (`orchestrator.ts:104`); e-posta seçeneği yok (DOĞRULANMADI: push) | Yeni rezervasyon için işletmeye e-posta seçeneği | hayır | S | Hayır — gerçek mesaj gönderimi |
| CH-01 | İşletme rezervasyon sayfası | KISMİ | `app/[locale]/isletme/[slug]` + `rezervasyon/[id]` (kapak, adres, saatler, harita linki); URL `checkrezerve.com/<slug>` değil `/tr/isletme/<slug>` — ayrıca `app/[locale]/[slug]` eski form ayrı çalışıyor; hizmetli akış FK bug'ı (gece G2) | Kısa URL `/<slug>` yönlendirmesi; hizmetli akış FK düzeltmesi | hayır | S | Kısmen — FK düzeltmesi YAPMA listesinde |
| RP-01 | Gösterge paneli | KISMİ | `app/panel/[slug]/page.tsx:149-158` bugün/bu hafta/onay bekleyen/iptal + `WeeklyChart`; gelen (arrived), no-show, doluluk % ve geçen hafta karşılaştırması yok | Dashboard'a geçen hafta karşılaştırması + doluluk; arrived/no-show OP-06'ya bağlı | evet | M | Kısmen |
| AC-01 | Roller ve yetkiler | KISMİ | `lib/roles.ts` + API route'larda tenant kontrolü (gece `4f31ae5`); **takvim server action'ları başka işletmenin rezervasyonunu güncelleyebiliyor** (`takvim/actions.ts:34-37`), şablon güncelleme tenant'sız (`bildirimler/actions.ts:31`), admin server action'larında yetki yok (`app/admin/restaurants/actions.ts:23,73`) | takvim/actions.ts + bildirimler/actions.ts tenant filtresi; admin actions checkAdmin | hayır | S | **Evet — öncelik 1** |
| AC-04 | Abonelik self-servis | KISMİ | `app/panel/[slug]/abonelik/` plan görme + "Planı Yükselt", `api/subscriptions/checkout/cancel`; kart değiştirme ve plan düşürme yok, ödeme hatası uyarısı/süre tanıma yok; mobil checkout-form boş (gece G4 #6). Hiç abonelik kaydı yok (0 satır) | Kart değiştirme, plan düşürme, ödeme hatası uyarısı | hayır | L | Hayır — YAPMA listesi (sadece analiz) |
| AC-05 | Fatura | YOK | e-Arşiv/e-Fatura ya da fatura bilgisi toplama yok | Fatura bilgisi toplama + entegratör | evet | XL | Hayır — XL, iş/hukuk kararı |
| AC-07 | Deneme + onboarding | KISMİ | `app/panel/[slug]/onboarding/1-5` bilgiler→hizmet→çalışan→masa→tamam, `panel/register`; sektör seçimi kayıtta; "ilk rezervasyon linki" adımı ve deneme süresi yönetimi DOĞRULANMADI | Onboarding sonunda "rezervasyon linkini paylaş" adımı | hayır | S | Evet (S) |
| CU-03 | Hızlı akış (≤4 adım) | KISMİ | `BookingForm.tsx:155` 6-8 adımlı sihirbaz (kişi, hizmet, çalışan, tarih, saat, masa, bilgi, özet) — 4 adım hedefinin üstünde | Sihirbaz adımlarını birleştir | hayır | M | Hayır — büyük UX değişikliği |
| CU-04 | Gerçek zamanlı müsaitlik | KISMİ | Dolu saatler `api/rezervasyon/musait` ile işaretleniyor, çakışmada 409; ama hizmet seçilince filtre hep boş döner → dolu saat boş görünür (gece G2 K4); kapalı günler uygulanmıyor (OP-11) | musait hizmet filtresi + kapalı gün | hayır | S | Kısmen — musait G2 kapsamında (sabah); kapalı gün evet |
| CU-05 | Onay ekranı | KISMİ | `rezervasyon/[id]/onay/page.tsx` + özet adımı (harita linki `BookingForm`); iptal politikası ve "takvime ekle" yok | Onay sayfasına .ics "takvime ekle" + iptal politikası metni | hayır | S | Evet (.ics) |
| CU-07 | Rezervasyonlarım | KISMİ | `app/[locale]/rezervasyonlarim/page.tsx` yaklaşan/geçmiş/iptal sekmeleri + iptal (W-36); erteleme ve "tekrar rezervasyon" yok | Rezervasyonlarım'a "tekrar rezervasyon" linki | hayır | S | Evet (S) |
| CU-11 | İşletme profili | KISMİ | `isletme/[slug]/page.tsx:16-29` bilgi, hizmetler, çalışanlar, JSON-LD; fotoğraf galerisi ve yorumlar yok (yorum tablosu yok) | Fotoğraf galerisi + yorumlar | evet | M | Hayır — şema + içerik |
| LG-02 | Açık rıza (ayrı kutular) | KISMİ | Eski form (`[slug]/actions.ts`) `sms_consent` ayrı; ana `BookingForm` sadece gizlilik kutusu, pazarlama izni kutusu yok ve API `sms_consent` kaydetmiyor | BookingForm'a ön işaretsiz pazarlama izni kutusu + API'de `sms_consent` | hayır | S | Evet (öncelik 3) |
| LG-03 | Çerez politikası + banner | KISMİ | `app/[locale]/cerez-politikasi` + `components/CookieBanner.tsx` (Kabul/Reddet eşit); zorunlu/analitik/pazarlama kategorileri yok | Çerez banner'ında kategori seçimi | hayır | S | Evet (öncelik 3) |
| LG-04 | Kullanım koşulları | KISMİ | `kullanim-kosullari` ve `kullanim-sartlari` iki ayrı sayfa (tekrar); B2B/B2C bölümleri DOĞRULANMADI | Tek kullanım koşulları, B2B/B2C bölümleri | hayır | S | Taslak (TASLAK bandı) |
| LG-05 | Mesafeli satış + ön bilgilendirme | YOK | Sayfa yok, checkout öncesi onay yok | Mesafeli satış + ön bilgilendirme taslak sayfası | hayır | S | Taslak; checkout bağlama hayır |
| LG-06 | İptal/iade politikası (abonelik) | YOK | Sayfa yok | Abonelik iptal/iade politikası taslak sayfası | hayır | S | Taslak |
| LG-07 | Hesap ve veri silme | KISMİ | `api/users/me` DELETE (Bearer, mobil için) + bilgi sayfası `yasal/hesap-silme`; web'de giriş yapmış müşterinin kullanabileceği silme butonu/talep formu yok | Web'de giriş yapmış müşteri için hesap silme talebi | hayır | S | Evet (öncelik 3) |
| LG-10 | İletişim ve künye | KISMİ | `app/[locale]/iletisim` ve `app/iletisim` var; şirket unvanı, vergi no, MERSİS bulunamadı (grep 0) | Künye sayfası — bilgiler Halitcan'dan | hayır | S | Taslak (yer tutucu) |
| SC-01 | Auth + rol + sahiplik | KISMİ | API route'lar düzeltildi (gece G4 `4f31ae5`); **server action'lar açık**: `takvim/actions.ts` (tenant yok), `bildirimler/actions.ts:31` (tenant yok), `admin/restaurants/actions.ts` (auth yok, proxy korumasına dayanıyor) | AC-01 ile aynı | hayır | S | **Evet — öncelik 1** |
| SC-02 | RLS policy'leri | KISMİ | Gece G7: `reservations_anon_insert WITH CHECK (true)`, `calisanlar` telefon/email public; SQL 03 taslağı | SQL 03 | evet | S | Hayır — DB yazma yasak, SQL hazır |
| SC-03 | Rate limiting | KISMİ | `lib/rate-limit.ts` Redis; rezervasyon (10/dk), send-sms, AI uçları; panel login, kayıt, iletişim formu (server action) rate-limit'siz DOĞRULANMADI | Panel login, kayıt, iletişim server action rate-limit | hayır | S | Evet (S) |
| SC-06 | Girdi doğrulama | KISMİ | zod sadece 4 route'ta (ai-reserve, send-sms, analyze-message, subscriptions/checkout); ana `api/rezervasyon` telefonu normalize etmiyor, tarih/saat formatı doğrulanmıyor | Ana rezervasyon API'sine zod + telefon normalizasyonu | hayır | M | Evet (öncelik 4) |
| SC-09 | Yedekleme | KISMİ (DOĞRULANMADI) | Repoda pg_dump cron'u yok; Supabase planının PITR/yedek durumu ve geri yükleme denemesi bilinmiyor | Supabase yedek/PITR kontrolü + geri yükleme denemesi | hayır | S | Hayır — altyapı |
| OB-01 | Hata izleme | YOK | Sentry vb. yok | Sentry | hayır | S | Hayır — DSN/hesap gerekir |
| OB-02 | Uptime izleme | YOK | Repoda yok (VPS'te nginx watchdog cron'u var ama dış alarm yok) | Dış uptime servisi | hayır | S | Hayır — dış hesap |
| OB-04 | Cron takibi | KISMİ | GitHub Actions `daily-reminders.yml` HTTP≠200 ise fail (GitHub e-postası); ama `send-reminders` tüm gönderimler başarısız olsa da **200 döner** → alarm çalmaz | send-reminders başarısızlıkta 500 → GH Actions alarmı | hayır | S | **Evet — öncelik 2** |
| OB-05 | Mesaj gönderim logu | KISMİ | `sms_logs` sadece mock sağlayıcı yazıyor (`notification-service.ts:154`), gerçek sağlayıcılar loglamıyor; `bildirim_log`'a yazılan `hata_mesaji` kolonu **DB'de yok** → hatalı gönderim kayıtları insert'te düşüyor | Gerçek sağlayıcı gönderimlerini sms_logs'a yaz; bildirim_log.hata_mesaji (SQL) | evet | M | **Evet — öncelik 2** (SQL-GEREKLİ) |
| PF-01 | Core Web Vitals | KISMİ (DOĞRULANMADI) | Ölçülmedi; tüm HTML sayfalarında `Cache-Control: no-store` (`next.config.ts:33`) ISR'ı etkisizleştiriyor | Ölçüm + `no-store` header'ını daraltma | hayır | M | Hayır — ölçüm yok, cache davranış değişikliği |
| PF-02 | Görsel optimizasyonu | KISMİ | `next.config` avif/webp, next/image yaygın, lazy+opacity tuzağı giderilmiş (W-39); 8 `<img>` lint uyarısı kaldı | Kalan `<img>` → next/image | hayır | S | Evet (öncelik 7) |
| PF-03 | SEO temel | KISMİ | `app/sitemap.ts`, `app/robots.ts`, canonical/hreflang/OG (W-84); her sayfada benzersiz description DOĞRULANMADI | Eksik generateMetadata | hayır | S | Evet (öncelik 7) |
| PX-03 | Anlamlı hata durumları | KISMİ | Birçok API `error.message` (teknik) döndürüyor (ör. `api/rezervasyon/route.ts:108-110`, `panel/kroki`); BookingForm hata toast'ı var | API hata mesajlarını kullanıcı dostu yap | hayır | M | Evet (öncelik 2; M) |
| PX-11 | Türkçe yerelleştirme | KISMİ | Tarihler `toLocaleDateString('tr')`; para "₺123" önek + ondalıksız (`CalisanGelir.tsx:96`, `CalendarView.tsx:293`) — "1.250,00 ₺" formatı yok; 34 dosyada locale'siz `toUpperCase/toLowerCase` (İ/ı riski), `toLocaleUpperCase('tr')` hiç yok | Ortak formatTL/formatTarih + locale'li harf dönüşümü | hayır | S | Evet (öncelik 4) |
| PX-12 | Telefon girişi | KISMİ | `lib/notification-service.ts:195` `normalizePhoneE164` sadece SMS ve eski formda (`[slug]/actions.ts`); ana API ham telefonu kaydediyor, ortak maske/yardımcı yok | Ortak lib/phone.ts | hayır | S | Evet (öncelik 4) |

## Bölüm C — Tam tablo (katalog sırasıyla, 153 madde)

| ID | Özellik | Ö | Durum | Kanıt (dosya:satır) veya eksik | Büyüklük | Şema? |
|---|---|---|---|---|---|---|
| OP-01 | Günlük/haftalık/aylık takvim | P0 | VAR | `app/panel/[slug]/takvim/TakvimClient.tsx:99-101` üç görünüm; bugün vurgusu `WeeklyView.tsx:82-90`, `CalendarGrid.tsx:107`; önceki/sonraki gün gezinme `DailyView.tsx:77-84` | - | - |
| OP-02 | Kaynak bazlı görünüm | P1 | YOK | Takvimde çalışan/masa sütunu yok (`DailyView.tsx` saat satırları, kaynak ayrımı yok) | L | hayır |
| OP-03 | Manuel rezervasyon ekleme | P0 | STUB | "Yeni Rezervasyon" butonu (`app/panel/[slug]/page.tsx:164-166`, `masalar/MasalarContent.tsx:141-145`) sadece günlük takvime gidiyor; panelde rezervasyon **oluşturan** hiçbir form/API yok (`takvim/actions.ts` sadece update/delete) | M | hayır |
| OP-04 | Walk-in hızlı kayıt | P1 | YOK | Kod yok; ayrıca DB `reservations_source_check` sadece form/ai/phone/whatsapp → `walk_in` yazılamaz | S | evet |
| OP-05 | Sürükle-bırak değişiklik | P1 | KISMİ | `app/panel/[slug]/takvim/DailyView.tsx:54-58` sadece saat taşıma (çalışan/masa yok), müşteriye bildirim tetiklenmiyor | M | hayır |
| OP-06 | Rezervasyon durumları | P0 | KISMİ | DB CHECK sadece pending/confirmed/cancelled/completed; `arrived/seated`, `no_show` yok, geçiş zaman damgası yok | M | evet |
| OP-07 | Onay modu (otomatik/manuel) | P0 | STUB | `auto_confirm` flag admin UI'da var (`app/admin/FeatureFlagManager.tsx:25`) ama hiçbir kod okumuyor; tüm web rezervasyonları `pending` (`app/api/rezervasyon/route.ts:113`). "Onay Bekleyen" sayacı var (`page.tsx:155`) | S | hayır |
| OP-08 | Çakışma ve kapasite kontrolü | P0 | KISMİ | Masa: `check_reservation_availability` RPC (`api/rezervasyon/route.ts:54`); bölge kapasitesi say-sonra-yaz (race'e açık, `:74-97`); **çalışan çift rezervasyonu sunucuda kontrol edilmiyor**; müsaitlik hizmet filtresi bug'ı (gece raporu G2 K4) | M | hayır |
| OP-09 | Tampon süre | P1 | KISMİ | `BookingForm.tsx:98-107` `buildSlots(bufferMinutes)` kapanışa göre; hizmet/işletme bazında ayarlanabilir tampon yok | S | evet |
| OP-10 | Masa devir süresi | P1 | KISMİ | `restaurants.booking_duration_minutes` admin formunda (`AddRestaurantForm.tsx:112`), slot/çakışma hesabında kullanılmıyor (RPC `p_duration: null`) | M | hayır |
| OP-11 | Kapalı günler / özel saatler | P0 | KISMİ | Panelde kaydediliyor (`app/panel/[slug]/ayarlar/SettingsForm.tsx:33,112` → `api/panel-settings/route.ts:35`) ama **müşteri formu ve API `closed_dates`'i hiç okumuyor**; özel saat ve resmi tatil önerisi yok | S | hayır |
| OP-12 | Saat bloklama | P1 | YOK | Kod yok | M | evet |
| OP-13 | Arama ve filtre | P0 | KISMİ | `app/panel/[slug]/rezervasyonlar/RezervasyonList.tsx:75-88` isim/telefon, durum, tek tarih, alan; **tarih aralığı, çalışan, kaynak kanal filtresi yok** | S | hayır |
| OP-14 | Rezervasyon audit geçmişi | P1 | YOK | Değişiklik geçmişi yok (`RezervasyonList.tsx:403` GuestHistoryTable müşterinin diğer rezervasyonları, audit değil) | M | evet |
| OP-15 | Toplu işlem | P2 | YOK | Rezervasyon listesinde çoklu seçim yok (toplu bildirim ayrı: `bildirimler/actions.ts:176`) | M | hayır |
| OP-16 | Tekrarlayan randevu | P2 | YOK | Kod yok | L | evet |
| OP-17 | Grup/etkinlik rezervasyonu | P2 | YOK | Kod yok | L | evet |
| RS-01 | Çalışan yönetimi | P0 | VAR | `app/panel/[slug]/calisanlar/StaffManager.tsx:215` aktif/pasif; müşteri formu sadece aktif çalışanları çeker (`rezervasyon/[id]/page.tsx:48`); geçmiş kayıtlar silinmiyor | - | - |
| RS-02 | Çalışan haftalık saatleri | P0 | VAR | `StaffManager.tsx:41,135` calisan_saatler (7 gün, açık/kapalı); booking slotları çalışan saatine göre (`rezervasyon/[id]/page.tsx:62-90`) | - | - |
| RS-03 | Çalışan izin günleri | P1 | YOK | Kod ve tablo yok | M | evet |
| RS-04 | Çalışan-hizmet eşlemesi | P0 | KISMİ | Panelde eşleme var (`StaffManager.tsx:32,110`, calisan_hizmetler) ama **müşteri formu çalışanları hizmete göre filtrelemiyor** (`rezervasyon/[id]/page.tsx:48` tüm aktif çalışanlar) | S | hayır |
| RS-05 | Hizmet yönetimi | P0 | KISMİ | `app/panel/[slug]/hizmetler/ServiceManager.tsx:29-36` ad/süre/fiyat/kategori/renk; **açıklama ve görsel yok**, müşteri formunda kategoriye göre sıralama yok (`order(created_at)`) | S | evet |
| RS-06 | Hizmet varyantları | P2 | YOK | Kod yok | L | evet |
| RS-07 | Masa tipleri ve kapasite | P0 | VAR | `app/panel/[slug]/masalar/TableManager.tsx`, onboarding `Step4Tables.tsx`; masa_tipleri ad/kapasite/aktif | - | - |
| RS-08 | Salon krokisi | P1 | KISMİ | Kroki editörü + bölge modu (`app/panel/[slug]/kroki/`), müşteri tarafı `InteractiveFloorMap`; gerçek zamanlı "dolu (şu an oturuyor)" durumu yok (sadece rezerve) | M | hayır |
| RS-09 | Masa birleştirme | P2 | YOK | Kod yok | L | evet |
| RS-10 | Çoklu şube | P1 | YOK | `branches` tablosu var (0 satır), UI/şube seçici yok; fiyat sayfasında "Çoklu Şube Yönetimi" vaat ediliyor (`pricing/page.tsx:336`) | XL | evet |
| CR-01 | Müşteri kartı | P0 | KISMİ | `app/panel/[slug]/misafirler/page.tsx:30-52` rezervasyonlardan telefonla tekilleştiriyor (ad, telefon, ziyaret, son ziyaret); **e-posta ve toplam harcama yok** — `guests` tablosu 0 satır, hiçbir kod doldurmuyor | M | hayır |
| CR-02 | Müşteri notları | P0 | STUB | `musteri_notlari` tablosu web kodunda hiç kullanılmıyor; MisafirList not kaydı `guests.notes`'a anon client ile yazıyor (`MisafirList.tsx:269`) → guests boş olduğu için işlevsiz; KVKK sağlık verisi uyarısı yok | M | hayır |
| CR-03 | Etiketler | P1 | STUB | Etiket UI var (`MisafirList.tsx:100-120`) ama `guest_id` gerektiriyor, `guests` tablosu boş → etiket atanamaz; rezervasyonda rozet yok | M | hayır |
| CR-04 | No-show takibi | P1 | YOK | `no_show` durumu DB'de yok | M | evet |
| CR-05 | Kara liste | P1 | YOK | Kod yok | M | evet |
| CR-06 | Ziyaret geçmişi | P0 | KISMİ | `app/panel/[slug]/rezervasyonlar/RezervasyonList.tsx:354,403-420` rezervasyon detayında aynı telefonun geçmişi; müşteri kartında (misafirler) tam geçmiş listesi ve hizmet/çalışan bilgisi yok | S | hayır |
| CR-07 | Doğum günü | P2 | YOK | Kod yok | M | evet |
| CR-08 | Müşteri içe/dışa aktarma | P1 | KISMİ | Sadece rezervasyon CSV export (`api/panel-export`, `raporlar/RaporlarClient.tsx:80`); müşteri import/export yok | M | hayır |
| CR-09 | Paketler / seanslar | P1 | VAR | `app/panel/[slug]/paketler`, `uye-paketleri`, `api/panel/seans-dus/route.ts` (kalan seans düşer), hatırlatma cron'u | - | - |
| CM-01 | Onay mesajı | P0 | KISMİ | `lib/notification-orchestrator.ts:65-104` + `notification-service.ts:221`; **iptal linki yanlış yol** (`orchestrator.ts:82` `/iptal/<token>` → gerçek sayfa `/tr/rezervasyon/iptal/<token>`, 404) | S | hayır |
| CM-02 | Hatırlatma | P0 | KISMİ | `api/send-reminders/route.ts` + `.github/workflows/daily-reminders.yml` günde 1 kez 09:00, sadece **aynı gün** (24s/2s ayarı yok); gönderim sonucu kalıcı loglanmıyor, `reminder_sent` güncellenmiyor | M | hayır |
| CM-03 | Kanal seçimi + fallback | P0 | KISMİ | `lib/notification-service.ts:181-183` tek sağlayıcı `SMS_PROVIDER` env ile; WhatsApp→Netgsm otomatik fallback yok | M | hayır |
| CM-04 | Müşteri iptal/erteleme linki | P0 | KISMİ | `app/[locale]/rezervasyon/iptal/[token]/` giriş gerektirmeyen iptal var; token imzasız ve süresiz, son iptal saati politikası yok, erteleme yok; onay SMS'indeki link kırık (CM-01) | M | hayır |
| CM-05 | Mesaj şablonları | P1 | KISMİ | `app/panel/[slug]/bildirimler/` şablon CRUD (`bildirim_sablonlari`) ve {ad} değişkenleri; onay/hatırlatma mesajları bu şablonları kullanmıyor (sabit metin `notification-service.ts:221-280`) | M | hayır |
| CM-06 | İYS / ticari ileti onayı | P0 | KISMİ | Toplu SMS yalnızca `sms_consent=true` rezervasyonlara (`bildirimler/actions.ts:104-127`); İYS entegrasyonu yok; ana booking API (`api/rezervasyon`) `sms_consent` almıyor | L | hayır |
| CM-07 | Değerlendirme isteği | P1 | YOK | Web tarafında tamamlanan ziyaret sonrası puan linki yok; review/yorum tablosu yok (mobil mağaza puanı ayrı: MB-08) | L | evet |
| CM-08 | Kampanya / toplu mesaj | P2 | KISMİ | `bildirimler/actions.ts:176` toplu SMS/push, 500 alıcı sınırı, consent filtresi; segment (etiket, son ziyaret) ve maliyet önizleme yok | M | hayır |
| CM-09 | İşletmeye bildirim | P0 | KISMİ | Panel içi realtime zil (`app/panel/_components/NotificationBell.tsx`), işletme sahibine SMS (`orchestrator.ts:104`); e-posta seçeneği yok (DOĞRULANMADI: push) | S | hayır |
| CM-10 | AI sesli rezervasyon | P2 | KISMİ | `api/voice`, `api/ai-assistant/*`, `api/ai-reserve` var; `ai-assistant/initiate/route.ts:8` TODO (n8n entegrasyonu), telefon hattı entegrasyonu yok | XL | hayır |
| CM-11 | Web AI chatbot | P2 | VAR | `components/AIChatbot.tsx`, `api/ai-chatbot`, `lib/faq-search.ts` (pgvector SSS), `api/ai-reserve` rezervasyon | - | - |
| CH-01 | İşletme rezervasyon sayfası | P0 | KISMİ | `app/[locale]/isletme/[slug]` + `rezervasyon/[id]` (kapak, adres, saatler, harita linki); URL `checkrezerve.com/<slug>` değil `/tr/isletme/<slug>` — ayrıca `app/[locale]/[slug]` eski form ayrı çalışıyor; hizmetli akış FK bug'ı (gece G2) | S | hayır |
| CH-02 | Gömülebilir widget | P1 | YOK | Kod yok; `X-Frame-Options: SAMEORIGIN` iframe'i engelliyor (`next.config.ts:34`) | M | hayır |
| CH-03 | QR kod | P1 | KISMİ | QR sadece süper admin panelinde (`app/admin/restaurants/QRCodeButton.tsx`), PNG; işletme panelinde ve PDF yok | S | hayır |
| CH-04 | Instagram/WhatsApp link + UTM | P1 | YOK | UTM okuma yok, rehber yok | S | hayır |
| CH-05 | Google İşletme butonu | P2 | YOK | Kod yok | S | hayır |
| CH-06 | Kaynak kanal takibi | P1 | KISMİ | `source` kolonu var ama CHECK sadece form/ai/phone/whatsapp; web her şeyi `form` yazıyor (`api/rezervasyon/route.ts:114`), web/app/widget/instagram/walk_in ayrımı yok | S | evet |
| PY-01 | İptal politikası | P1 | YOK | Kod yok | S | evet |
| PY-02 | Depozito / ön ödeme | P2 | STUB | `deposit_required` flag sadece tutarı gösteriyor (`BookingForm.tsx:1024`), tahsilat yok (gece G5) | XL | evet |
| PY-03 | Kart saklama / no-show ücreti | P2 | YOK | Kod yok | XL | evet |
| PY-04 | Hediye kartı / paket satışı | P2 | YOK | Paketler panelden elle atanıyor; online satın alma yok | XL | evet |
| RP-01 | Gösterge paneli | P0 | KISMİ | `app/panel/[slug]/page.tsx:149-158` bugün/bu hafta/onay bekleyen/iptal + `WeeklyChart`; gelen (arrived), no-show, doluluk % ve geçen hafta karşılaştırması yok | M | evet |
| RP-02 | Doluluk raporu | P1 | KISMİ | `raporlar/page.tsx:128-134` saatlik yoğunluk; gün×saat ısı haritası yok | S | hayır |
| RP-03 | Gelir raporu | P1 | KISMİ | `raporlar/page.tsx:107-115` hizmet fiyatı × rezervasyon (tamamlanan değil, iptal hariç hepsi); `prevRevenue = 0` sabit; `CalisanGelir` çalışan bazında | S | hayır |
| RP-04 | Çalışan performansı | P1 | KISMİ | `raporlar/CalisanGelir.tsx` + `api/panel/calisan-gelir` sayı/gelir; no-show oranı ve puan yok | M | evet |
| RP-05 | Kanal raporu | P1 | YOK | source kırılımı yok | S | hayır |
| RP-06 | No-show / iptal raporu | P1 | KISMİ | İptal oranı ve trend (`RaporlarClient.tsx:42` cancelPct); no-show yok | S | evet |
| RP-07 | Export | P1 | KISMİ | CSV (`api/panel-export`, `RaporlarClient.tsx:80`) + PDF (`api/panel/[slug]/rapor-pdf`); Excel yok; `export_logs` hiç satır yok (gece G1) | S | hayır |
| AC-01 | Roller ve yetkiler | P0 | KISMİ | `lib/roles.ts` + API route'larda tenant kontrolü (gece `4f31ae5`); **takvim server action'ları başka işletmenin rezervasyonunu güncelleyebiliyor** (`takvim/actions.ts:34-37`), şablon güncelleme tenant'sız (`bildirimler/actions.ts:31`), admin server action'larında yetki yok (`app/admin/restaurants/actions.ts:23,73`) | S | hayır |
| AC-02 | Ekip daveti | P1 | YOK | Kod yok (kullanıcılar süper admin tarafından `admin/restaurants/UserForm.tsx` ile ekleniyor) | M | evet |
| AC-03 | Activity log | P1 | KISMİ | `admin_audit_logs` sadece işletme onay/red (`api/admin/audit-logs`); işletme tarafı kritik işlemler loglanmıyor | M | hayır |
| AC-04 | Abonelik self-servis | P0 | KISMİ | `app/panel/[slug]/abonelik/` plan görme + "Planı Yükselt", `api/subscriptions/checkout\|cancel`; kart değiştirme ve plan düşürme yok, ödeme hatası uyarısı/süre tanıma yok; mobil checkout-form boş (gece G4 #6). Hiç abonelik kaydı yok (0 satır) | L | hayır |
| AC-05 | Fatura | P0 | YOK | e-Arşiv/e-Fatura ya da fatura bilgisi toplama yok | XL | evet |
| AC-06 | Plan limitleri | P1 | YOK | Kod yok | M | hayır |
| AC-07 | Deneme + onboarding | P0 | KISMİ | `app/panel/[slug]/onboarding/1-5` bilgiler→hizmet→çalışan→masa→tamam, `panel/register`; sektör seçimi kayıtta; "ilk rezervasyon linki" adımı ve deneme süresi yönetimi DOĞRULANMADI | S | hayır |
| AC-08 | Demo veri | P2 | YOK | Kod yok | M | hayır |
| AC-09 | İki adımlı doğrulama | P1 | YOK | Kod yok | M | hayır |
| AC-10 | Oturum yönetimi | P1 | YOK | Panel cookie HMAC, sunucu tarafı oturum listesi yok | M | evet |
| IN-01 | SambaPOS | P1 | KISMİ | `api/pos/samba/webhook/route.ts` (secret doğrulamalı); canlı çalışırlığı DOĞRULANMADI | S | hayır |
| IN-02 | iCal feed | P2 | YOK | Kod yok | M | hayır |
| IN-03 | Muhasebe export | P2 | YOK | Kod yok | M | hayır |
| IN-04 | Webhook / API | P2 | KISMİ | n8n webhook'ları (`lib/n8n.ts`) iç kullanım; işletmeye açık webhook yok | L | evet |
| CU-01 | Hesapsız rezervasyon | P0 | VAR | `api/rezervasyon/route.ts:24` ad+telefon yeterli, oturum şartı yok (hizmetli akıştaki FK bug'ı ayrı: gece G2) | - | - |
| CU-02 | Telefon OTP | P1 | YOK | Kod yok | M | hayır |
| CU-03 | Hızlı akış (≤4 adım) | P0 | KISMİ | `BookingForm.tsx:155` 6-8 adımlı sihirbaz (kişi, hizmet, çalışan, tarih, saat, masa, bilgi, özet) — 4 adım hedefinin üstünde | M | hayır |
| CU-04 | Gerçek zamanlı müsaitlik | P0 | KISMİ | Dolu saatler `api/rezervasyon/musait` ile işaretleniyor, çakışmada 409; ama hizmet seçilince filtre hep boş döner → dolu saat boş görünür (gece G2 K4); kapalı günler uygulanmıyor (OP-11) | S | hayır |
| CU-05 | Onay ekranı | P0 | KISMİ | `rezervasyon/[id]/onay/page.tsx` + özet adımı (harita linki `BookingForm`); iptal politikası ve "takvime ekle" yok | S | hayır |
| CU-06 | Takvime ekle (.ics) | P1 | YOK | Kod yok | S | hayır |
| CU-07 | Rezervasyonlarım | P0 | KISMİ | `app/[locale]/rezervasyonlarim/page.tsx` yaklaşan/geçmiş/iptal sekmeleri + iptal (W-36); erteleme ve "tekrar rezervasyon" yok | S | hayır |
| CU-08 | Tek dokunuşla tekrar | P1 | KAPSAM DIŞI | Mobil | - | - |
| CU-09 | Favoriler | P1 | KAPSAM DIŞI | Mobil (web'de de var: `favorilerim/page.tsx`) | - | - |
| CU-10 | Keşfet / arama | P1 | KISMİ | `rezervasyon/SearchableBusinessList.tsx` sektör, şehir filtresi, sıralama; "şu an müsait", puan filtresi, harita görünümü yok | M | hayır |
| CU-11 | İşletme profili | P0 | KISMİ | `isletme/[slug]/page.tsx:16-29` bilgi, hizmetler, çalışanlar, JSON-LD; fotoğraf galerisi ve yorumlar yok (yorum tablosu yok) | M | evet |
| CU-12 | Yorum ve puan | P1 | YOK | `reviews` tablosu DB'de yok (`SearchableBusinessList` sessizce boş düşüyor) | L | evet |
| CU-13 | Bekleme listesi | P2 | STUB | `waitlist` flag sadece "arayın" kutusu (`BookingForm.tsx:635`) | L | evet |
| CU-14 | Push bildirim (mobil) | P1 | KAPSAM DIŞI | Mobil | - | - |
| CU-15 | Çoklu dil | P1 | VAR | next-intl 7 dil (`messages/*.json`, W-64/W-65) | - | - |
| CU-16 | Sadakat | P2 | YOK | Kod yok | L | evet |
| CU-17 | Wallet kartı | P2 | KAPSAM DIŞI | Mobil | - | - |
| LG-01 | KVKK aydınlatma metni | P0 | VAR | `app/[locale]/kvkk`, footer linki `components/MarketingFooter.tsx:48`, form linkleri `kayit/page.tsx:277`, `[slug]/ReservationForm.tsx:392`, `BookingForm.tsx:1035-1251` (hukuki onay durumu DOĞRULANMADI) | - | - |
| LG-02 | Açık rıza (ayrı kutular) | P0 | KISMİ | Eski form (`[slug]/actions.ts`) `sms_consent` ayrı; ana `BookingForm` sadece gizlilik kutusu, pazarlama izni kutusu yok ve API `sms_consent` kaydetmiyor | S | hayır |
| LG-03 | Çerez politikası + banner | P0 | KISMİ | `app/[locale]/cerez-politikasi` + `components/CookieBanner.tsx` (Kabul/Reddet eşit); zorunlu/analitik/pazarlama kategorileri yok | S | hayır |
| LG-04 | Kullanım koşulları | P0 | KISMİ | `kullanim-kosullari` ve `kullanim-sartlari` iki ayrı sayfa (tekrar); B2B/B2C bölümleri DOĞRULANMADI | S | hayır |
| LG-05 | Mesafeli satış + ön bilgilendirme | P0 | YOK | Sayfa yok, checkout öncesi onay yok | S | hayır |
| LG-06 | İptal/iade politikası (abonelik) | P0 | YOK | Sayfa yok | S | hayır |
| LG-07 | Hesap ve veri silme | P0 | KISMİ | `api/users/me` DELETE (Bearer, mobil için) + bilgi sayfası `yasal/hesap-silme`; web'de giriş yapmış müşterinin kullanabileceği silme butonu/talep formu yok | S | hayır |
| LG-08 | Veri dışa aktarma talebi | P1 | YOK | Kod yok | M | hayır |
| LG-09 | Veri işleyen/sorumlu ayrımı | P1 | KISMİ (DOĞRULANMADI) | KVKK sayfası içeriğinde incelenmedi | S | hayır |
| LG-10 | İletişim ve künye | P0 | KISMİ | `app/[locale]/iletisim` ve `app/iletisim` var; şirket unvanı, vergi no, MERSİS bulunamadı (grep 0) | S | hayır |
| SC-01 | Auth + rol + sahiplik | P0 | KISMİ | API route'lar düzeltildi (gece G4 `4f31ae5`); **server action'lar açık**: `takvim/actions.ts` (tenant yok), `bildirimler/actions.ts:31` (tenant yok), `admin/restaurants/actions.ts` (auth yok, proxy korumasına dayanıyor) | S | hayır |
| SC-02 | RLS policy'leri | P0 | KISMİ | Gece G7: `reservations_anon_insert WITH CHECK (true)`, `calisanlar` telefon/email public; SQL 03 taslağı | S | evet |
| SC-03 | Rate limiting | P0 | KISMİ | `lib/rate-limit.ts` Redis; rezervasyon (10/dk), send-sms, AI uçları; panel login, kayıt, iletişim formu (server action) rate-limit'siz DOĞRULANMADI | S | hayır |
| SC-04 | Bot koruması | P1 | YOK | Turnstile/hCaptcha/honeypot yok | S | hayır |
| SC-05 | Webhook imza doğrulaması | P0 | VAR | iyzico `lib/iyzico.ts` (gece `2306a21` boş secret düzeltmesi), SambaPOS `pos/samba/webhook` secret | - | - |
| SC-06 | Girdi doğrulama | P0 | KISMİ | zod sadece 4 route'ta (ai-reserve, send-sms, analyze-message, subscriptions/checkout); ana `api/rezervasyon` telefonu normalize etmiyor, tarih/saat formatı doğrulanmıyor | M | hayır |
| SC-07 | Güvenlik başlıkları | P1 | KISMİ | `next.config.ts:33-38` HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy; **CSP yok** | S | hayır |
| SC-08 | Gizli anahtar hijyeni | P0 | VAR | Repoda sk_/JWT/AWS/Google anahtarı yok (gece G6 taraması); service_role sadece sunucu tarafında (`lib/supabase.ts`) — mobil paket kapsam dışı | - | - |
| SC-09 | Yedekleme | P0 | KISMİ (DOĞRULANMADI) | Repoda pg_dump cron'u yok; Supabase planının PITR/yedek durumu ve geri yükleme denemesi bilinmiyor | S | hayır |
| OB-01 | Hata izleme | P0 | YOK | Sentry vb. yok | S | hayır |
| OB-02 | Uptime izleme | P0 | YOK | Repoda yok (VPS'te nginx watchdog cron'u var ama dış alarm yok) | S | hayır |
| OB-03 | Health endpoint | P1 | KISMİ | `app/api/health/route.ts` DB kontrolü; kritik servisler (SMS sağlayıcı, Redis, n8n) yok | S | hayır |
| OB-04 | Cron takibi | P0 | KISMİ | GitHub Actions `daily-reminders.yml` HTTP≠200 ise fail (GitHub e-postası); ama `send-reminders` tüm gönderimler başarısız olsa da **200 döner** → alarm çalmaz | S | hayır |
| OB-05 | Mesaj gönderim logu | P0 | KISMİ | `sms_logs` sadece mock sağlayıcı yazıyor (`notification-service.ts:154`), gerçek sağlayıcılar loglamıyor; `bildirim_log`'a yazılan `hata_mesaji` kolonu **DB'de yok** → hatalı gönderim kayıtları insert'te düşüyor | M | evet |
| OB-06 | Yapılandırılmış log | P1 | YOK | console.* serbest metin | M | hayır |
| OB-07 | Durum sayfası | P2 | YOK | Yok | S | hayır |
| PF-01 | Core Web Vitals | P0 | KISMİ (DOĞRULANMADI) | Ölçülmedi; tüm HTML sayfalarında `Cache-Control: no-store` (`next.config.ts:33`) ISR'ı etkisizleştiriyor | M | hayır |
| PF-02 | Görsel optimizasyonu | P0 | KISMİ | `next.config` avif/webp, next/image yaygın, lazy+opacity tuzağı giderilmiş (W-39); 8 `<img>` lint uyarısı kaldı | S | hayır |
| PF-03 | SEO temel | P0 | KISMİ | `app/sitemap.ts`, `app/robots.ts`, canonical/hreflang/OG (W-84); her sayfada benzersiz description DOĞRULANMADI | S | hayır |
| PF-04 | Yapılandırılmış veri | P1 | KISMİ | LocalBusiness + BreadcrumbList (`isletme/[slug]`, W-21/W-59); sektöre özel tip (Restaurant/BeautySalon) ve açılış saatleri DOĞRULANMADI, puan yok | S | hayır |
| PF-05 | Sektör × şehir landing | P1 | YOK | Programatik sayfa yok (`kullanim-alanlari` sektör sayfası şehir bazlı değil) | L | hayır |
| PF-06 | PWA | P2 | KISMİ | `app/manifest.ts`, `public/sw.js`, `app/[locale]/offline`; panel için ayrı değerlendirilmedi | S | hayır |
| PF-07 | 404 / 500 sayfaları | P0 | VAR | `app/not-found.tsx`, `app/[locale]/not-found.tsx`, `app/error.tsx`, `app/[locale]/error.tsx` (W-19) | - | - |
| MB-01 | Uygulama içi hesap silme | P0 | KAPSAM DIŞI | Mobil repo | - | - |
| MB-02 | Sign in with Apple | P0* | KAPSAM DIŞI | Mobil repo | - | - |
| MB-03 | Gizlilik etiketleri ve izin metinleri | P0 | KAPSAM DIŞI | Mobil repo | - | - |
| MB-04 | Deep link | P1 | KAPSAM DIŞI | Mobil repo | - | - |
| MB-05 | OTA güncelleme | P1 | KAPSAM DIŞI | Mobil repo | - | - |
| MB-06 | Zorunlu güncelleme | P1 | KAPSAM DIŞI | Mobil repo | - | - |
| MB-07 | Çevrimdışı davranış | P1 | KAPSAM DIŞI | Mobil repo | - | - |
| MB-08 | Mağaza puanlama isteği | P1 | KAPSAM DIŞI | Mobil repo | - | - |
| MB-09 | Erişilebilirlik | P1 | KAPSAM DIŞI | Mobil repo | - | - |
| PX-01 | Skeleton yükleme | P1 | KISMİ | `app/[locale]/loading.tsx` spinner; bazı listelerde skeleton (favorilerim W-27); `BusinessCardSkeleton` kullanılmıyor | M | hayır |
| PX-02 | Anlamlı boş durumlar | P1 | KISMİ | `bugun/TodayView.tsx:363` metin var; aksiyon butonu ("linki paylaş") yok | S | hayır |
| PX-03 | Anlamlı hata durumları | P0 | KISMİ | Birçok API `error.message` (teknik) döndürüyor (ör. `api/rezervasyon/route.ts:108-110`, `panel/kroki`); BookingForm hata toast'ı var | M | hayır |
| PX-04 | Optimistic UI | P2 | KISMİ | `profil/KanalTercihi.tsx` (geri alma dahil, gece `68e05ab`); rezervasyon onay/iptal değil | S | hayır |
| PX-05 | Geri al (undo) | P2 | STUB | `takvim/actions.ts:45-72` soft-delete/undo **`is_deleted` kolonuna yazıyor, DB'de yok** → her zaman hata | S | evet |
| PX-06 | Tutarlı tasarım sistemi | P1 | KISMİ | `components/ui/` var; panelde farklı altın/kırmızı tonları (`#c9a84c`, `#D4A373`, `#E53935`) karışık | L | hayır |
| PX-07 | Karanlık mod | P2 | KISMİ | Panel koyu tema sabit; site sistem temasını takip etmiyor | M | hayır |
| PX-08 | Mikro etkileşimler (haptik) | P2 | KAPSAM DIŞI | Mobil | - | - |
| PX-09 | ⌘K komut paleti | P2 | YOK | Kod yok | M | hayır |
| PX-10 | Akıllı varsayılanlar | P1 | YOK | Kod yok | M | hayır |
| PX-11 | Türkçe yerelleştirme | P0 | KISMİ | Tarihler `toLocaleDateString('tr')`; para "₺123" önek + ondalıksız (`CalisanGelir.tsx:96`, `CalendarView.tsx:293`) — "1.250,00 ₺" formatı yok; 34 dosyada locale'siz `toUpperCase/toLowerCase` (İ/ı riski), `toLocaleUpperCase('tr')` hiç yok | S | hayır |
| PX-12 | Telefon girişi | P0 | KISMİ | `lib/notification-service.ts:195` `normalizePhoneE164` sadece SMS ve eski formda (`[slug]/actions.ts`); ana API ham telefonu kaydediyor, ortak maske/yardımcı yok | S | hayır |
| PX-13 | Changelog | P2 | YOK | Kod yok | S | hayır |
| PX-14 | Yardım ve destek | P1 | KISMİ | `app/[locale]/sss`, `components/WhatsAppFloatButton.tsx`; panel içi yardım/video yok | S | hayır |
| PX-15 | Güven sinyalleri | P1 | KISMİ (DOĞRULANMADI) | Landing'de sayaç (`CountUp`) var; gerçek işletme sayısı mı sabit mi incelenmedi | S | hayır |
| PX-16 | AI önerileri | P2 | YOK | Kod yok | M | hayır |

## Bölüm D — Katalogda olmayan ama bulunanlar

**Güçlü özellikler (satışta öne çıkarılabilir):**
- **AI sesli asistan ve ses kataloğu:** `lib/voice-catalog.ts`, `lib/audio-sentences.ts` (13.500+ önceden üretilmiş cümle sesi), `api/voice`, `api/ai-assistant/*`, işletmeye özel asistan adı/sesi (`restaurants.ai_assistant_name/voice`).
- **SSS vektör araması (pgvector):** `faq` 150 kayıt + `match_faq` RPC (`lib/faq-search.ts`).
- **Menü fotoğrafından hizmet çıkarma (LLM):** `api/menu/parse` + `hizmetler/MenuUpload.tsx`.
- **Paket/seans sistemi + kademeli hatırlatma** (`cron/paket-hatirlatma`, eşik bazlı, müşteri kanal tercihi): rakiplerde nadir.
- **Erteleme talebi akışı:** `erteleme_talepleri` tablosu + `onayla_erteleme` DB fonksiyonu + `restaurants.erteleme_penceresi_saat` (web UI'ı DOĞRULANMADI — mobil tarafta olabilir).
- **Bölge kartları + izometrik kroki** (iki mod), SambaPOS webhook, 7 dilli müşteri arayüzü, marka temalı PDF rapor.
- **Sektöre göre terminoloji** (`lib/sector-terminology.ts`: "seans/randevu/rezervasyon").

**Katalogda olmayan riskler:**
1. **Server action'lar denetimsiz uç noktalar** (gece G4 sadece `app/api`'yi kapsadı): `app/panel/[slug]/takvim/actions.ts` başka işletmenin rezervasyon tarih/saat/çalışanını değiştirebilir; `bildirimler/actions.ts:31` şablon güncellemesi tenant'sız; `app/admin/restaurants/actions.ts` işletme ve **panel kullanıcısı (şifreyle) oluşturma** içinde yetki kontrolü yok (yalnızca `/admin` proxy korumasına dayanıyor).
2. **Olmayan kolonlara yazan kod:** `takvim/actions.ts` → `reservations.is_deleted` (yok; sil/geri al her zaman hata), `bildirimler/actions.ts` → `bildirim_log.hata_mesaji` (yok; başarısız gönderim kayıtları düşüyor).
3. **`guests` tablosu hiç doldurulmuyor** (0 satır) → etiketler, notlar, harcama, misafir aktivite logu fiilen çalışmıyor.
4. **İki paralel rezervasyon formu:** `app/[locale]/[slug]` (server action, telefon normalize, sms_consent) ve `app/[locale]/rezervasyon/[id]` (API, normalize yok) farklı kurallarla çalışıyor.
5. **Onay SMS'indeki iptal linki 404** (`notification-orchestrator.ts:82` yanlış yol).
6. **Tüm HTML sayfalarında `Cache-Control: no-store`** → ISR/CDN önbelleği devre dışı, performans maliyeti.
7. **Eski İngilizce şema kalıntıları** (`services`, `staff`, `tables` tabloları) kodun bir kısmı tarafından hâlâ okunuyor → karışıklık kaynağı (bkz. service_id).
8. **Fiyat sayfası vaatleri:** "Çoklu Şube Yönetimi" gibi planlarda listelenen ama olmayan özellikler (RS-10) → tüketici hukuku riski.
