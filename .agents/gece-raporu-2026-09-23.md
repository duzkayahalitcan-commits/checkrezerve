# Gece Raporu — 2026-09-23 (branch: `gece-2026-09-23`)

> Durum: **gece-gorevi.md TAMAMLANDI** (G1–G9). Push YOK, deploy YOK, DB'ye yazma YOK (sadece SELECT).
> Sırada: `urun-plani/2-denetim-gorevi.md` → `urun-plani/3-uygulama-kuyrugu.md` (aynı branch, aynı kurallar; bu raporun sonuna eklenecek).

## 1. Sabah 5 dakikalık özet

- **En önemli iki şey:**
  1. **🔴 Web'den hizmetli rezervasyon büyük olasılıkla KIRIK** (G2): form `hizmetler.id`'yi `reservations.service_id`'ye yazıyor ama o kolon `services` tablosuna FK veriyor (ortak id 0) → FK ihlali, 500. Aktif hizmeti olan 5 işletme etkileniyor olmalı; son rezervasyon 12 Ağustos. Kod değiştirilmedi (görev "sadece analiz"), düzeltme planı hazır. **Önce canlıda test et.**
  2. **🔴 Cross-tenant açığı kapatıldı** (G4, `4f31ae5`): 10 panel API'si oturumu doğruluyor ama işletme sahipliğini kontrol etmiyordu — bir işletme başka işletmenin rezervasyonunu iptal edebiliyor, ciro PDF'ini, müşteri paketlerini/e-postalarını görebiliyordu.
- **Prod eski:** VPS image'ı 20 Eylül 22:37 UTC. Dünkü `b434591` (export_logs), `599035a` (flag'ler), `52bce43` (SMS) ve bu geceki tüm commit'ler canlıda **yok**.
- **10 commit** (hepsi `gece-2026-09-23` branch'inde, push yok):

| Hash | Mesaj |
|---|---|
| `b8e1cf8` | fix(odeme): iyzico webhook ve abonelik akışında okunmayan DB hataları |
| `68e05ab` | fix(bildirim): kanal ayarı ve müşteri kanal tercihi kaydı hataları okunuyor |
| `6009ba3` | fix(paket): paket yenileme ve hatırlatma cron'unda okunmayan DB hataları |
| `b2f1a45` | fix(kroki): kaldırılan masaları pasifleştirme hatası okunuyor |
| `1a1736f` | fix(panel-ui): misafir etiketi ve admin durum güncellemesinde yanlış 'başarılı' |
| `4f31ae5` | fix(guvenlik): panel API'lerinde işletme sahipliği (tenant) kontrolü |
| `2306a21` | fix(guvenlik): iyzico webhook imzası boş secret ile doğrulanmıyor |
| `ed57807` | chore(lint): prefer-const hataları (3) |
| `a799963` | fix(admin): QR kod fallback'inde eski Railway URL'si checkrezerve.com yapıldı |
| `d57b853` | docs(learned): 3 yeni ders (grep -i, yorum yerine DB, çift kolon) + #1 sayaç |

- G1 (export_logs) ve G5 (flag'ler) **dün zaten yapılmış** → yeni kod yok, sadece doğrulama + öneri. G8'deki test rezervasyonu **zaten silinmiş**.
- `npm run build` ✅, `npx tsc --noEmit` ✅ (son commit'ten sonra). Lint 164 error (çoğu `<a>`→`<Link>`), build'i etkilemiyor.

## 2. Halitcan'ın karar vermesi gerekenler

1. **service_id → hizmet_id düzeltmesi yapılsın mı?** Öneri: evet, bugün — `api/rezervasyon/route.ts:108`'de `hizmet_id` yaz + `musait` route'undaki hizmet filtresini kaldır (~5 satır). Önce canlı test ile kırıklığı doğrula. (G2)
2. **`musait` hizmet filtresi kaldırılsın mı, yoksa hizmet_id'ye mi çevrilsin?** Öneri: kaldır — doluluk çalışana/işletmeye bağlı; çevirirsen aynı çalışan aynı saate iki farklı hizmetle satılır. (G2)
3. **Prod deploy:** son image 20 Eylül; bu branch + dünkü commit'ler ne zaman çıkacak? Öneri: önce #1 test, sonra `gece-2026-09-23` → main merge → deploy (iki slot da). (G1)
4. **`reservations_anon_insert` sıkılaştırılsın mı (`status='pending'`)?** Öneri: evet, ama önce mobilin rezervasyonu hangi status ile doğrudan insert ettiğini kontrol et. (G7, SQL 03)
5. **`send-sms` herhangi numaraya serbest metin gönderebiliyor — sınırlansın mı?** Öneri: alıcıyı işletmenin rezervasyon/misafir telefonlarıyla sınırla veya endpoint'i kapat (kim kullanıyor bak). (G4)
6. **Admin oturumu statik token (`HMAC(secret, password)`) — panel gibi userId+expiry'li token'a geçilsin mi?** Öneri: evet, ayrı iş. (G4)
7. **Panelde tarayıcıdan anon client ile yazma (MisafirList etiketleri, admin durum güncelleme) API route'a taşınsın mı?** Öneri: evet — CLAUDE.md kuralı "panel yazmaları API route + getSupabaseAdmin". (G3)
8. **"Depozito Zorunlu" flag etiketi** hiçbir şey tahsil etmiyor, sadece tutar gösteriyor — etiket "Ön ödeme tutarını göster" olsun mu? Öneri: evet. (G5)
9. **`review_request` hiçbir işletmede satır yok = mobilde puanlama isteği hiç çıkmaz — niyet bu mu?** Öneri: mobilde varsayılanı netleştir. (G5)
10. **`export_logs.auth_user_id` kolonu mu, yoksa `restaurant_users.user_id`'yi elle eşleme mi?** Öneri: kolon (SQL 02) — daha basit, eşleme bilgisi gerektirmez. (G1)
11. **`subscriptions/checkout-form` mobil ödeme sayfası boş form gösteriyor** (form içeriği bilinçli olarak saklanmıyor) — mobil abonelik akışı nasıl olmalı? Öneri: canlı test, sonra ya içeriği kısa ömürlü sakla ya da mobilde WebView'e `checkoutFormContent`'i doğrudan ver. (G4)
12. **Kullanılmayan 9 dosya silinsin mi?** (liste G6'da). Öneri: `ZoneViewer` hariç sil; `ZoneViewer`'ın müşteri formunda neden kullanılmadığına bak. (G6)
13. **`RPC hatasında paket hatırlatması tüm kanallara gidiyor`** (`get_aktif_kanallar` hata verirse varsayılan email+sms+whatsapp) — opt-out'a saygı için hata durumunda hiç gönderme mi? Öneri: evet, gönderme + logla. (G3)

## 3. Halitcan'ın çalıştırması gereken SQL'ler

| Dosya | Ne yapar | Risk | Ne zaman |
|---|---|---|---|
| `.agents/sql-taslak/01-service-hizmet-birlestirme.sql` | Ön kontrol + service_id→hizmet_id backfill (0 satır beklenir) + (yorumda) service_id drop | B düşük / C orta | B: kod deploy sonrası. C: 1 hafta sonra, mobil kontrolünden sonra |
| `.agents/sql-taslak/02-export-logs-auth-user.sql` | `export_logs.auth_user_id uuid` (nullable, FK auth.users) | Düşük | Karar #10 evet ise; kod değişikliğinden ÖNCE |
| `.agents/sql-taslak/03-rls-anon-insert-sikilastirma.sql` | `reservations_anon_insert` → `status='pending'` + işletme var. (Yorumda) calisanlar telefon/email kolonlarını anon'a kapatma | Orta (mobil insert'e bağlı) | Mobil kontrolünden sonra |
| `.agents/sql-taslak/04-test-rezervasyon-silme.sql` | Test rezervasyonu silme | — | **Çalıştırma — kayıt zaten yok** |

## 4. Test listesi

1. **Hizmetli web rezervasyonu (G2, mevcut prod):** checkrezerve.com → aktif hizmeti olan bir işletme (ör. Mario Berber) → hizmet seç → çalışan/tarih/saat → bilgiler → gönder. Beklenen (bug varsa): hata mesajı. VPS: `docker logs --tail 50 checkrezerve-blue | grep rezervasyon` → `reservations_service_id_fkey`.
2. **Tenant izolasyonu (`4f31ae5`):** Ceviz (isletme_admin) ile panele gir → DevTools'ta `fetch('/api/panel/paketler?restaurant_id=<başka işletme id>')` → **403** beklenir. Kendi id'siyle → 200. Aynısı `PUT /api/panel/reservations/<başka işletmenin rezervasyon id>/status` → **404**.
3. **Rezervasyon durum değiştirme (regresyon):** Panel → Rezervasyonlar → bir rezervasyonu onayla/iptal → durum değişmeli (kendi işletmesinde 200).
4. **Paketler (regresyon):** Panel → Paketler → paket ekle/düzenle/pasifle; Üye paketleri → yenile, ödeme gir, seans düş → hepsi çalışmalı.
5. **Kroki (regresyon + `b2f1a45`):** Panel → Kroki → masa ekle/sil → kaydet → sayfayı yenile, silinen masa gelmemeli. Mod değiştir (tables/zones), bölge fotoğrafı yükle.
6. **Rapor PDF:** Panel → Raporlar → PDF indir → kendi işletmende çalışmalı; URL'deki slug'ı başka işletmeyle değiştir → **403**.
7. **Bildirim kanalları (`68e05ab`):** Panel → Bildirim kanalları → aç/kapa → kaydet → "kaydedildi". Müşteri profil → Bildirim tercihleri → toggle; ağ hatası simüle et (DevTools offline) → toggle geri dönmeli.
8. **Misafir etiketi (`1a1736f`):** Panel → Misafirler → etiket ekle/kaldır. Supabase oturumu olmayan (legacy kullanıcı adı ile giriş) kullanıcıda artık **"Güncellenemedi"** görünmesi muhtemel — bu yeni davranış değil, önceden sessizce kaydedilmiyordu.
9. **iyzico (`b8e1cf8`, `2306a21`):** Sandbox'ta abonelik başlat → ödeme → callback `?subscription=success`; `iyzico_webhook_logs`'ta `processed=true`. Yanlış imzalı POST `/api/iyzico/webhook` → 401.
10. **Paket hatırlatma cron (`6009ba3`):** `curl -H "Authorization: Bearer $CRON_SECRET" https://checkrezerve.com/api/cron/paket-hatirlatma` → `processed` sayısı; aynı gün ikinci çalıştırma aynı paketleri tekrar saymamalı.
11. **QR kod (`a799963`):** Admin → İşletmeler → QR → URL `checkrezerve.com/...` olmalı.

## 5. KRİTİK bulgular

| # | Bulgu | Durum |
|---|---|---|
| K1 | **Cross-tenant IDOR:** 10 panel API'si işletme sahipliğini kontrol etmiyordu (rezervasyon iptali, ciro PDF, müşteri e-postaları, paket/ödeme kayıtları, kroki). | ✅ Düzeltildi `4f31ae5` — **prod'da değil** |
| K2 | **Web hizmetli rezervasyon FK ihlali** (`service_id` → `services`, gönderilen `hizmetler.id`). Gelir kaybı. | ⏳ Analiz + plan (G2). Canlı test gerek |
| K3 | **`reservations_anon_insert WITH CHECK (true)`:** anon key ile API atlanıp `confirmed` statülü sahte rezervasyon yazılabilir. | ⏳ SQL 03 taslağı |
| K4 | **Müsaitlik:** hizmet seçilince `musait` 0 satır döndürüyor → tüm saatler boş görünüyor → çift rezervasyon. | ⏳ G2 planında |
| K5 | **iyzico imzası boş secret ile doğrulanıyordu** (secret tanımsızsa sahte webhook kabul). | ✅ `2306a21` (prod secret durumu DOĞRULANMADI) |
| K6 | **Ödeme akışında yutulan hatalar:** para alınıp abonelik aktifleşmeyebiliyor, webhook DB'ye yazamasa da "processed". | ✅ `b8e1cf8` |
| K7 | **Müşteri SMS/WhatsApp opt-out'u kaydedilemediğinde "kaydedildi" görünüyordu** (KVKK/İYS). | ✅ `68e05ab` |
| K8 | `send-sms`: herhangi panel kullanıcısı herhangi numaraya serbest SMS. | ⏳ Karar #5 |
| K9 | `calisanlar` telefon/email kolonları herkese açık (şu an boş). | ⏳ SQL 03 ADIM 2 |

---

## Görev ilerlemesi
| Görev | Durum |
|---|---|
| G0 Başlangıç | ✅ caffeinate (10 saat), branch `gece-2026-09-23` main'den açıldı (main = origin/main, 5383f86) |
| G1 export_logs | ✅ Kod düzeltmesi zaten var (b434591), commit yok. SQL taslağı 02. ⚠ Prod'a deploy edilmemiş |
| G2 service_id/hizmet_id | ✅ Analiz + SQL 01. 🔴 Web'de hizmetli rezervasyon FK ihlaliyle kırık (çıkarım, canlı test gerek) |
| G3 Sessiz hata taraması | ✅ 5 commit (ödeme, bildirim, paket, kroki, panel-ui) |
| G4 API güvenlik | ✅ 2 commit: 10 route tenant (IDOR) + iyzico imza. 8 bulgu raporlandı |
| G5 Feature flag'ler | ✅ Zaten bağlı (599035a, prod'da değil). Kod değişikliği yok, öneriler yazıldı |
| G6 Build/sağlık | ✅ build+tsc temiz; lint 164 error (çoğu `<a>`→`<Link>`); 2 commit (prefer-const, Railway URL) |
| G7 RLS | ✅ calisan_saatler: public SELECT var, yazma sadece super_admin. 🔴 reservations anon insert `true`. SQL 03 |
| G8 Temizlik taslağı | ✅ Kayıt zaten yok; idempotent taslak 04 (çalıştırmaya gerek yok) |
| G9 learned.md | ✅ `d57b853` 3 ders + kural #1 sayacı (applied 1→2, G8'de uygulandı) |

Not: Görev dosyası `src/app/api/**` diyor; bu repoda API route'ları `app/api/**` altında (kökte `app/` ve `src/` ayrı). Buna göre çalışıldı.

---

## Görev ayrıntıları

### G1 — export_logs sessiz hata

**Sonuç: yeni kod commit'i yok — istenen düzeltme dün (22 Eylül) `b434591` ile zaten yapılmış.**
- `app/api/panel-export/route.ts:116-130`: insert error'u okunuyor ve `console.error` ile loglanıyor; export (CSV) audit hatasından etkilenmiyor. ✅
- `resolveExportUserId()` (satır 23-54): önce `restaurant_users.id`, sonra `restaurant_users.user_id` ile eşleştiriyor, bulamazsa `NULL` (kolon nullable, FK `ON DELETE SET NULL`). ✅

**Şema (SELECT ile doğrulandı):**
- `export_logs`: `restaurant_user_id uuid NULL → restaurant_users(id)`, `restaurant_id NOT NULL → restaurants(id)`, `export_type CHECK = 'weekly_csv'`.
- `restaurant_users.user_id` kolonu **DB'de var** (20260922 migration'ı uygulanmış) ama **6 satırın 6'sında NULL**. Migration'ın username↔auth email eşleşmesi 0 satır buldu (username'ler e-posta değil).
- `restaurant_users`'ta e-posta/profile_id kolonu yok → kod tarafında auth kullanıcısını restaurant_users satırına güvenle eşlemek **mümkün değil**. `profiles.isletme_id` ile eşleştirmek yanlış kişiye yazabilir (bir işletmede birden çok kullanıcı var) → uygulanmadı.
- Auth ile girişte `session.userId = profiles.id` (`app/panel/auth/callback/actions.ts:17-37`), legacy girişte `restaurant_users.id` (`app/panel/login/actions.ts`).
- `export_logs` **toplam 0 satır** — tablo oluşturulduğundan beri hiç başarılı audit kaydı yok.

**⚠ Prod durumu:** VPS'teki `checkrezerve-blue/green` image'ı **2026-09-20 22:37 UTC** tarihinde build edilmiş; `b434591` (22 Eylül) **prod'da yok**. Yani canlıda eski (hatayı yutan) kod çalışıyor. Son 72 saatte container loglarında `panel-export` satırı yok (export kullanılmamış).

**Kalıcı çözüm önerisi:** `.agents/sql-taslak/02-export-logs-auth-user.sql` — `export_logs.auth_user_id` kolonu. Çalıştırılınca route'a tek alan eklenir (SQL'den sonra!). Alternatif: restaurant_users.user_id'yi elle eşle (6 satır, Halitcan hangi auth kullanıcısının hangi satır olduğunu biliyor).

Küçük not (dokunulmadı): `route.ts:88-91` içi boş `if (weekEnd > today) {}` bloğu — ölü kod, yorum "bugünle sınırla" diyor ama sınırlamıyor.

### G2 — service_id / hizmet_id (SADECE ANALİZ — kod değiştirilmedi)

**🔴 KRİTİK ön bulgu:** `reservations.service_id` FK'i **`services`** tablosuna gidiyor (hizmetler'e değil). Web booking formu hizmetleri **`hizmetler`** tablosundan okuyup (`app/[locale]/rezervasyon/[id]/page.tsx:47`) seçilen `hizmetler.id`'yi `service_id` olarak gönderiyor (`BookingForm.tsx:400` → `app/api/rezervasyon/route.ts:108`). `services` (4 satır) ile `hizmetler` (31 satır) arasında **ortak id 0**. Sonuç: **hizmet seçilen her web rezervasyonu FK ihlaliyle (23503) 500 döner.** Hizmet adımı, işletmenin aktif hizmeti varsa zorunlu (`BookingForm.tsx:367`) → aktif hizmeti olan **5 işletmede (13 içinden) web'den rezervasyon yapılamıyor** olmalı.
- Destekleyen veri: `service_id` dolu kayıt **0**; son rezervasyon **2026-08-12** (6 haftadır yeni kayıt yok).
- DOĞRULANMADI (canlıda gözlenmedi): prod container logları 2026-09-20'den beri, bu aralıkta `[rezervasyon]` hata satırı yok (deneme de olmamış olabilir). **Sabah test et:** aktif hizmeti olan bir işletmede web'den hizmet seçip rezervasyon dene.

**🟠 İkinci bulgu — müsaitlik:** `app/api/rezervasyon/musait/route.ts:31-33` hizmet seçilince `eq('service_id', …)` filtreliyor. service_id hep boş olduğundan sorgu **0 satır** döner → **tüm saatler boş görünür** (çalışan filtresi de aynı sorguda AND'lendiği için çalışanın dolu saatleri de gizlenir) → çift rezervasyon riski. Ayrıca "sadece aynı hizmetin dolu saatleri" mantığı kendisi yanlış: doluluk hizmete değil çalışana/işletmeye bağlı.

**Kod kullanım listesi (web):**
| Kolon | Dosya:satır | Ne yapıyor |
|---|---|---|
| service_id | `app/api/rezervasyon/route.ts:20,108` | **YAZAR** (web rezervasyon insert) |
| service_id | `app/[locale]/rezervasyon/[id]/BookingForm.tsx:297,400` | musait sorgu parametresi + POST body |
| service_id | `app/api/rezervasyon/musait/route.ts:12,32` | **OKUR** (dolu slot filtresi) |
| service_id | `app/[locale]/[slug]/ReservationForm.tsx:161` | hidden input — server action'da **okunmuyor** (ölü alan) |
| hizmet_id | `app/panel/[slug]/page.tsx:87` | panel dashboard select |
| hizmet_id | `app/panel/[slug]/bugun/page.tsx:39` | bugün görünümü select |
| hizmet_id | `app/panel/[slug]/rezervasyonlar/page.tsx:46`, `RezervasyonList.tsx:22` | liste |
| hizmet_id | `app/panel/[slug]/takvim/CalendarView.tsx:97`, `CalendarTypes.ts:16` | takvim |
| hizmet_id | `app/api/panel/[slug]/calendar-events/route.ts:29` | takvim API |
| hizmet_id | `app/panel/[slug]/raporlar/page.tsx:71,79,111-112,142` | **ciro hesabı** (hizmet fiyatı) |
| hizmet_id | `app/api/panel/[slug]/rapor-pdf/route.ts:42,75-76` | **PDF ciro** |
| hizmet_id | DB fn `log_reservation_email` (trigger `on_reservation_created`) | e-postada hizmet adı |
| (diğer tablolar) | `calisan_hizmetler.hizmet_id`, `paketler.hizmet_id` | reservations değil, ilgisiz |

SMS/hatırlatma (`lib/notification-orchestrator.ts`) ve CSV export iki kolonu da kullanmıyor. `lib/assistant-brain.ts:116` **`services` tablosunu** okuyor (AI asistan hizmet menüsü; yoksa hizmetler'e düşüyor).

**Veri (SELECT):** toplam 26 | sadece hizmet_id 5 | sadece service_id 0 | ikisi 0 | hiçbiri 21. Tüm kayıtlar `source='form'`.
**Tip/FK:** ikisi de `uuid NULL`. `hizmet_id → hizmetler(id) ON DELETE SET NULL`; `service_id → services(id)` (ON DELETE kuralı yok). Index: ikisinde de yok. Policy/view referansı: yok.

**Öneri: `hizmet_id` kanonik.** Gerekçe: (1) panel, raporlar, ciro, PDF, takvim, e-posta trigger'ı zaten hizmet_id okuyor; (2) FK hedefi `hizmetler` = web formunun ve panelin kullandığı gerçek hizmet tablosu; (3) service_id'de korunacak veri yok; (4) proje dili Türkçe tablolar (`hizmetler`, `calisanlar`).

**Geçiş planı:**
1. Kod (tek commit, ~3 satır): `app/api/rezervasyon/route.ts:108` → `hizmet_id: service_id || null` (body alan adı geriye uyumlu kalsın, eski tarayıcı cache'i bozulmasın); UUID doğrulaması ekle (diğer id'ler gibi).
2. `musait/route.ts:31-33`: service filtresini **kaldır** (doluluk çalışan/işletme bazlı). hizmet_id'ye çevirmek yanlış semantiği aktif hale getirir.
3. `ReservationForm.tsx:161` ölü hidden input — dokunma veya ayrı temizlik.
4. SQL: `.agents/sql-taslak/01-service-hizmet-birlestirme.sql` — B (backfill, 0 satır beklenir) kod deploy'undan sonra; C (service_id drop) **1 hafta sonra**, iki slot da yeni kodla çalışırken.
5. **Geri dönüş:** Adım 1-2 tek commit → `git revert`. C'den sonra kolonu geri eklemek SQL dosyasında. `services` tablosunu DROP ETME (AI asistan okuyor).

**Premortem** ("6 ay sonra bu geçiş başarısız oldu, neden?") — skill'in yöntemiyle (çerçeve + ham neden listesi + sentez) inline yapıldı; skill'in paralel alt-ajan + HTML rapor adımları gece bütçesi için atlandı.
1. **musait sadece kolon adı değiştirilerek düzeltildi** → hizmet filtresi gerçekten çalışmaya başladı, aynı çalışan farklı hizmete aynı saatte iki kez satıldı. *(En olası.)*
2. **Mobil (`checkrezerve-app`) veya n8n `service_id`/`services` bekliyordu** → C adımında insert'ler patladı. Web reposundan görülemiyor; C'den önce mobil repoda `service_id` grep şart. *(En tehlikeli — sessiz veri kaybı değil ama mobil rezervasyon durur.)*
3. **`services` tablosunun 4 satırı** gerçek bir işletmenin tek hizmet kaynağıydı (AI asistan oradan okuyor) → biri "kullanılmıyor" diye services'i drop etti, asistan hizmet menüsü boşaldı.
4. **Blue/green'de tek slot güncellendi** → eski slot service_id yazmaya devam etti, C sonrası o slottan gelen rezervasyonlar 500 verdi. (Prod image 2026-09-20; deploy disiplini riskli.)
5. **Tarayıcı cache'indeki eski BookingForm** body'de `service_id` göndermeye devam etti → API alanı kaldırılırsa hizmet bilgisi sessizce düştü. (Plan bunu body alanını koruyarak önlüyor.)
6. **Ciro raporları aniden arttı**, web rezervasyonları artık hizmet fiyatıyla sayıldığı için işletme "rakamlar yanlış" diye şikâyet etti — beklenen davranış ama iletişimi yapılmadı.

**Gizli varsayım:** "service_id sadece web tarafında yaşıyor." Mobil ve n8n doğrulanmadı.
**Pre-launch kontrol listesi:** (a) mobil repoda `service_id|services` grep (app oturumunda); (b) n8n: repodaki `n8n/` JSON'da `service_id` yok (kontrol edildi); canlı n8n-legacy container'ındaki workflow'lar DOĞRULANMADI; (c) deploy sonrası iki slotun image hash'i aynı mı (`docker inspect`); (d) test: aynı çalışan + aynı saat + farklı hizmet → ikinci rezervasyon engellenmeli; (e) C'den önce 7 gün `docker logs | grep 23503` temiz.

### G3 — Sessiz hata taraması

Yöntem: `app/ lib/ src/ components/` altında `.insert( .update( .upsert( .delete( .rpc(` çağrıları, error'u destructure etmeyen ifadeler (Python tarayıcı, `scratchpad/scan.py`). 43 aday → 7'si `createHmac().update()` false-positive, 1'i (`panel-tables` delete) aslında kontrollü. Sınırlama: `const res = await …insert()` gibi destructure edilmeyen ama `res.error`'u da okumayan ifadeler ve `void` ile atılan zincirler bu taramada eksik kalmış olabilir.

**Düzeltilenler (commit'ler):**
| Commit | Dosya | Sorun → Düzeltme |
|---|---|---|
| `b8e1cf8` fix(odeme) | `app/api/iyzico/webhook/route.ts` | processEvent'teki 9 insert/update/select hatası okunmuyordu → catch hiç tetiklenmiyor, webhook DB'ye yazılamasa da `processed=true` işaretleniyordu. Artık `assertOk` throw eder → `process_error` yazılır, **500 döner (iyzico tekrar dener)**. |
| | `app/api/subscriptions/callback/route.ts` | Abonelik aktifleştirme hatasında kullanıcıya `subscription=success` gösteriliyordu → artık `error`. Güncellenecek trialing kayıt yoksa `console.error` (ref yazılmadığı için webhook'lar aboneliği bulamaz). |
| | `app/api/subscriptions/checkout/route.ts` | Trialing kayıt insert'i başarısızsa yine ödeme formu açılıyordu (para alınır, abonelik aktifleşmez) → artık 500, form açılmaz. |
| `68e05ab` fix(bildirim) | `app/api/panel/bildirim-kanallari/route.ts`, `app/api/musteri/kanal-tercihleri/route.ts`, `app/[locale]/profil/KanalTercihi.tsx` | Upsert hatasında her zaman `ok:true`. Müşteri tarafı yanıtı hiç okumuyordu → **opt-out kaydedilmediği halde kaydedildi görünüyordu** (KVKK/İYS açısından önemli). Artık 500 + UI iyimser toggle'ı geri alır. |
| `6009ba3` fix(paket) | `app/api/panel/musteri-paketleri/route.ts` | Yenilemede eski paket kapatılamazsa yine yeni paket açılıyordu (çift aktif paket) → 500. |
| | `app/api/cron/paket-hatirlatma/route.ts` | Eşik işaretleme hatası yutuluyordu (try/catch sadece throw yakalar) → **aynı hatırlatma her gün tekrar gidebilirdi**. Artık loglanıyor, `processed` sayılmıyor. Liste okuma hatası 500. |
| `b2f1a45` fix(kroki) | `app/api/panel/kroki/route.ts` | Kaldırılan masaları pasifleştirme hatası yutulup `success` dönüyordu. |
| `1a1736f` fix(panel-ui) | `app/panel/[slug]/misafirler/MisafirList.tsx` | Etiket ekle/kaldır hatası (ve RLS'in 0 satır sildiği durum) okunmuyordu, her zaman "Etiket eklendi" toast'ı. |
| | `app/admin/ReservationDashboard.tsx` | Durum güncelleme hatası/0 satır sessizdi → alert + log. |

`npx tsc --noEmit` ✅ (tüm commit'lerden sonra).

**Not (tasarım, dokunulmadı):** `MisafirList` ve admin `ReservationDashboard` panelde **tarayıcıdan anon key ile yeni bir Supabase client** açıp yazıyor. RLS (`guest_tag_assignments_owner_all`, `reservations_*`) `auth.uid()` ister; panel oturumu HMAC cookie (`cr_panel`) olan kullanıcıda Supabase oturumu yoksa bu yazmalar **her zaman** başarısız olur. Artık en azından hata görünür. Kalıcı çözüm: CLAUDE.md kuralı gereği panel yazmaları API route + `getSupabaseAdmin()` üzerinden yapılmalı → karar listesinde.

**Kritik olmayanlar (sadece liste):**
- `app/panel/[slug]/bildirimler/actions.ts:223,232,260,265,271` — `bildirim_log` insert'leri (log kaydı; kaybı bildirim geçmişini eksik gösterir).
- `app/panel/[slug]/bildirimler/actions.ts:230`, `app/api/push/send/route.ts:74` — geçersiz push aboneliği silme (temizlik).
- `app/api/iyzico/webhook/route.ts` log insert (artık loglanıyor ama akış devam ediyor — bilinçli).
- `app/api/subscriptions/checkout/route.ts:100` — `CHECKOUT_FORM_INIT` log insert'i; hata olursa `checkoutUrl=null` döner (form içeriği yine döner).
- `app/[locale]/rezervasyon/[id]/FavoriteToggle.tsx:32,34`, `app/[locale]/profil/page.tsx:88`, `app/[locale]/favorilerim/page.tsx:48` — favori ekle/sil (müşterinin kendi oturumu + RLS; hata olursa UI yanlış durum gösterir, düşük etki).
- `lib/guest-activities.ts:20` — aktivite log'u (fire-and-forget, bilinçli).
- `app/api/cron/paket-hatirlatma/route.ts` `get_aktif_kanallar` rpc — hata → varsayılan kanallar (**dikkat:** varsayılan `email, sms, whatsapp` = RPC hatasında opt-out'a rağmen tüm kanallara gider; karar listesinde).
- `lib/faq-search.ts:100` — `match_faq` rpc (arama; boş sonuç döner).

### G4 — API güvenlik taraması

70 route incelendi (`app/api/**/route.ts`; tarama `scratchpad/api.py` + her şüpheli route elle okundu).

**Düzeltilenler:**
- `4f31ae5` fix(guvenlik) — **🔴 KRİTİK, cross-tenant (IDOR):** 10 panel route'u oturumu doğruluyor ama `restaurant_id`'yi body/query/URL'den alıp oturumdakiyle karşılaştırmıyordu; hepsi `getSupabaseAdmin()` (RLS bypass) kullandığı için **A işletmesinin paneli B'nin verisini okuyup değiştirebiliyordu**: kroki (masaları ez), kroki-mode, zone-photo (başkasının storage yolu), check-conflict, paketler (CRUD), musteri-paketleri (**müşteri e-postaları okunabiliyordu**), paket-odeme (başkasının ödeme kaydı), rezervasyon durum (**başka işletmenin rezervasyonunu iptal/onay**), seans-dus, rapor-pdf (**başka işletmenin ciro PDF'i**). Mevcut desen (`kroki-zones`, `calisan-gelir`) aynen uygulandı: `restaurant_id !== session.restaurantId → 403` veya sorguya `.eq('restaurant_id', session.restaurantId)`.
- `2306a21` fix(guvenlik) — **🔴 KRİTİK (koşullu):** `lib/iyzico.ts` `verifyWebhookSignature`: `IYZICO_SECRET_KEY` boşsa HMAC boş anahtarla hesaplanıyordu → herkes geçerli imza üretip sahte `SUBSCRIPTION_*` olayı gönderebilirdi. Artık secret/imza yoksa `false`, karşılaştırma `timingSafeEqual`. Prod'da secret'ın dolu olup olmadığı DOĞRULANMADI (`.env`'e bakılmadı, kural).

**Raporlanan, düzeltilmeyen (davranış değişikliği riski / tasarım):**
1. **`send-sms` (🟠):** herhangi bir panel kullanıcısı (çalışan dahil) herhangi bir numaraya serbest metinli SMS gönderebiliyor (Twilio maliyeti + işletme adına oltalama). Rate-limit 10/dk. Öneri: alıcıyı o işletmenin rezervasyon/misafir telefonlarıyla sınırla veya endpoint'i sadece sunucu içi kullanıma çek. Kim çağırıyor kontrol edilmeli.
2. **Admin oturumu (🟠):** `cr_admin` cookie = `HMAC(ADMIN_SECRET, ADMIN_PASSWORD)` — **statik**, kullanıcıya bağlı değil, sunucu tarafında süresi yok. Bir kez sızarsa şifre değişene kadar geçerli. W-66'da "Supabase Auth'a geçildi" deniyor ama `app/api/admin/*` hâlâ bu şemayı kullanıyor. Öneri: userId + expiry içeren imzalı token (panel'deki gibi).
3. **`panel/kroki` POST upsert (🟡):** tenant kontrolü eklendi ama `masa_tipleri` upsert'i `onConflict: 'id'` — istemci başka işletmenin masa id'sini gönderirse o satırın `isletme_id`'si kendi işletmesine taşınır. Öneri: upsert öncesi gelen id'lerin `isletme_id = session.restaurantId` olduğunu doğrula.
4. **`panel/zone-photo` (🟡):** `zone_id` yola doğrudan giriyor (`zone-photos/{restaurantId}/{zoneId}.webp`); UUID doğrulaması yok.
5. **Public LLM/ses endpoint'leri (🟡):** `chat`, `voice`, `analyze-message`, `transcribe`, `ai-assistant/speak|transcribe` sadece IP rate-limit ile korunuyor → maliyet istismarı. `ai-reserve` feature flag'li.
6. **`subscriptions/checkout-form` (🟠 bug, güvenlik değil):** `payload.checkoutFormContent` okuyor ama `checkout` route'u log'a sadece `{status, conversationId}` yazıyor (token saklanmasın diye bilinçli) → **mobil ödeme sayfası her zaman boş form render eder.** Mobil abonelik akışı büyük olasılıkla çalışmıyor. DOĞRULANMADI (canlı test gerek).
7. **`pos/samba/webhook`:** secret karşılaştırması `!==` (timing-safe değil) — düşük risk.
8. **`chat/rate`:** kimliksiz herkes puan yazabilir (spam) — düşük.

**Route tablosu:**

| Route | Method | Guard | RLS bypass | Sahiplik | Not |
|---|---|---|---|---|---|
| `admin/audit-logs` | POST,GET | cr_admin (statik HMAC) + imza/secret | getSupabaseAdmin | — (admin: tüm işletmeler) |  |
| `admin/cache-conversation` | POST | cr_admin (statik HMAC) + imza/secret | getSupabaseAdmin | — (admin: tüm işletmeler) |  |
| `admin/chatbot-analiz` | GET | cr_admin (statik HMAC) + Supabase JWT + imza/secret | getSupabaseAdmin | — (admin: tüm işletmeler) |  |
| `admin/feature-flags` | GET,POST | cr_admin (statik HMAC) + imza/secret | getSupabaseAdmin | — (admin: tüm işletmeler) |  |
| `admin/login` | POST | - | — | — | giriş noktası |
| `admin/restaurant` | PATCH | cr_admin (statik HMAC) + imza/secret | getSupabaseAdmin | — (admin: tüm işletmeler) |  |
| `admin/restaurant-users` | POST | cr_admin (statik HMAC) + imza/secret | getSupabaseAdmin | — (admin: tüm işletmeler) |  |
| `admin/tables` | GET,POST | cr_admin (statik HMAC) + imza/secret | getSupabaseAdmin | — (admin: tüm işletmeler) |  |
| `ai-assistant/chat` | POST | herkese açık | getSupabaseAdmin | — | public bot (restaurant_id param) |
| `ai-assistant/initiate` | POST | herkese açık | getSupabaseAdmin | — | public bot |
| `ai-assistant/speak` | POST | herkese açık | — | — | TTS, maliyetli — sadece rate-limit |
| `ai-assistant/transcribe` | POST | herkese açık | — | — | STT, maliyetli — sadece rate-limit |
| `ai-chatbot` | POST | herkese açık | getSupabaseAdmin | — | public bot |
| `ai-reserve` | POST | herkese açık (feature flag ai_reservation) | getSupabaseAdmin | — | LLM ile public rezervasyon |
| `analyze-message` | POST | herkese açık | — | — | LLM, sadece rate-limit |
| `chat` | POST | herkese açık | getSupabaseAdmin | — | LLM (DeepSeek), sadece rate-limit |
| `chat/rate` | POST | herkese açık | getSupabaseAdmin | — | herkes puan yazabilir (spam), düşük |
| `cron/paket-hatirlatma` | GET | CRON_SECRET | getSupabaseAdmin | — |  |
| `feature-flag` | GET | herkese açık | — | — | sadece okuma |
| `health` | GET | herkese açık | getSupabaseAdmin | — | OK |
| `iyzico/webhook` | POST | HMAC imza | getSupabaseAdmin | — | ✅ imza düzeltildi (boş secret) |
| `menu/parse` | POST | panel + canManageServices | — | — | LLM çağrısı |
| `menu/save` | POST | cr_panel session | getSupabaseAdmin | ✅ |  |
| `musteri/kanal-tercihleri` | GET,PUT | panel veya Supabase JWT | getSupabaseAdmin | ✅ musteri_id oturumdan |  |
| `ogx` | GET | herkese açık | — | — | OG görsel |
| `panel-export` | GET | cr_panel session + imza/secret | getSupabaseAdmin | ✅ |  |
| `panel-reservations` | PATCH | cr_panel session | getSupabaseAdmin | ✅ |  |
| `panel-settings` | PATCH | cr_panel session + cr_admin (statik HMAC) | getSupabaseAdmin | ✅ |  |
| `panel-tables` | POST,PATCH,DELETE,GET | cr_panel session + cr_admin (statik HMAC) | getSupabaseAdmin | ✅ |  |
| `panel/[slug]/calendar-events` | GET | panel | getSupabaseAdmin | ✅ (super_admin muaf) |  |
| `panel/[slug]/ciro-ozet` | GET | panel | getSupabaseAdmin | ✅ (super_admin muaf) |  |
| `panel/[slug]/rapor-pdf` | GET | panel | getSupabaseAdmin | ✅ düzeltildi | ciro PDF |
| `panel/background` | POST,DELETE | cr_panel session + cr_admin (statik HMAC) | — | ✅ |  |
| `panel/bildirim-kanallari` | GET,PUT | cr_panel session | getSupabaseAdmin | ✅ |  |
| `panel/calisan-gelir` | GET | cr_panel session + cr_admin (statik HMAC) | getSupabaseAdmin | ✅ |  |
| `panel/check-conflict` | POST | panel | getSupabaseAdmin | ✅ düzeltildi |  |
| `panel/guest-activities` | POST | cr_panel session | getSupabaseAdmin | ✅ |  |
| `panel/kroki` | GET,POST | GET açık / POST panel | getSupabaseAdmin | ✅ (POST, düzeltildi) | GET public masa listesi |
| `panel/kroki-mode` | POST | panel | getSupabaseAdmin | ✅ düzeltildi |  |
| `panel/kroki-zones` | GET,POST | cr_panel session | getSupabaseAdmin | ✅ |  |
| `panel/musteri-paketleri` | GET,POST,PATCH | panel | getSupabaseAdmin | ✅ düzeltildi | GET müşteri e-postası sızdırıyordu |
| `panel/ozellikler` | GET,PUT | cr_panel session + cr_admin (statik HMAC) | getSupabaseAdmin | ✅ |  |
| `panel/ozellikler/reply` | POST | cr_panel session + cr_admin (statik HMAC) | getSupabaseAdmin | ✅ |  |
| `panel/ozellikler/unknown` | GET | cr_panel session + cr_admin (statik HMAC) | getSupabaseAdmin | ✅ |  |
| `panel/paket-odeme/[id]` | PUT | panel | getSupabaseAdmin | ✅ düzeltildi |  |
| `panel/paketler` | GET,POST,PATCH,DELETE | panel | getSupabaseAdmin | ✅ düzeltildi |  |
| `panel/reservations/[id]/status` | PUT | panel (+iptal: canDeleteReservation) | getSupabaseAdmin | ✅ düzeltildi |  |
| `panel/seans-dus` | POST | panel | getSupabaseAdmin | ✅ düzeltildi |  |
| `panel/voice-settings` | GET,PATCH | cr_panel session + cr_admin (statik HMAC) | getSupabaseAdmin | ✅ |  |
| `panel/zone-photo` | POST | panel | — | ✅ düzeltildi |  |
| `pos/samba/webhook` | POST | X-Webhook-Secret (işletme başı) | getSupabaseAdmin | ✅ | karşılaştırma timing-safe değil (düşük) |
| `push/send` | POST | CRON_SECRET/Bearer | getSupabaseAdmin | — |  |
| `push/subscribe` | POST | panel veya Supabase JWT | getSupabaseAdmin | ✅ userId oturumdan |  |
| `rezervasyon` | POST | herkese açık | getSupabaseAdmin | — | public form (rate-limit) |
| `rezervasyon/musait` | GET | herkese açık | getSupabaseAdmin | — | public |
| `send-reminders` | POST | CRON_SECRET/Bearer | getSupabaseAdmin | — |  |
| `send-sms` | POST | panel | — | ❌ yok | ⚠ herhangi numaraya serbest metin SMS |
| `splashx` | GET | herkese açık | — | — |  |
| `subscriptions` | GET | — | getSupabaseAdmin | ✅ |  |
| `subscriptions/callback` | GET | herkese açık | getSupabaseAdmin | — | iyzico token ile doğrular |
| `subscriptions/cancel` | POST | — | getSupabaseAdmin | ✅ |  |
| `subscriptions/checkout` | POST | rate-limit | getSupabaseAdmin | ✅ |  |
| `subscriptions/checkout-form` | GET | herkese açık (log id) | getSupabaseAdmin | — | ⚠ bkz. bulgu |
| `subscriptions/payments` | GET | — | getSupabaseAdmin | ✅ |  |
| `tables/[restaurantId]/availability` | GET | herkese açık | getSupabaseAdmin | — | public |
| `tables/[restaurantId]/floor-plan` | GET | herkese açık | getSupabaseAdmin | — | public |
| `tables/bulk-update` | POST | cr_panel session | getSupabaseAdmin | ✅ |  |
| `transcribe` | POST | herkese açık | — | — | maliyetli — sadece rate-limit |
| `users/me` | DELETE | Supabase JWT | getSupabaseAdmin | ✅ user.id tokendan | hesap silme |
| `voice` | POST | herkese açık | — | — | LLM, sadece rate-limit |
### G5 — Stub feature flag'ler

**Durum: kod değişikliği yok.** Görev tanımındaki "web kodunda denetlenmiyor" bilgisi eskimiş: dün `599035a` (22 Eylül 03:18) üç flag'i de bağlamış. **Bu commit de prod'da değil** (prod image 20 Eylül).

| Flag | Toggle (UI) | Kodda kullanım | Açık olduğu işletme (SELECT) | Öneri |
|---|---|---|---|---|
| `waitlist` | `app/admin/FeatureFlagManager.tsx:22` | `app/[locale]/rezervasyon/[id]/page.tsx:113` → `BookingForm.tsx:595,635` — tüm saatler doluysa "işletmeyi arayın" bilgi kutusu. **Gerçek bekleme listesi kaydı yok.** | Hiçbiri (Ceviz Restaurant, Liman Kafe, Mario Berber'de satır var, hepsi `false`) | **Olduğu gibi bırak.** Açıldığında zararsız, ama "Bekleme Listesi" adı gerçek bir liste vaat ediyor → gerçek özellik yazılana kadar açmayın. |
| `deposit_required` | `FeatureFlagManager.tsx:23` | `page.tsx:104-109` → `BookingForm.tsx:1024` — flag açık + `prepayment_amount > 0` ise özette tutar **gösterilir**. **Tahsilat yok** (iyzico entegrasyonu rezervasyona bağlı değil). | Hiçbiri (Ceviz Restaurant `false`) | **Etiketi değiştir veya gizle:** "Depozito Zorunlu" yazıyor ama hiçbir şey zorunlu kılınmıyor — işletme açarsa müşteriden para alındığını sanabilir. Öneri: etiketi "Ön ödeme tutarını göster" yap. (Karar listesinde; UI'da değiştirilmedi çünkü bilinçli ürün kararı olabilir.) |
| `review_request` | `FeatureFlagManager.tsx:27` | Web'de yok. Mobil `maybeRequestReview()` → `/api/feature-flag` (commit mesajına göre; mobil repo okunmadı). | **Hiç satır yok** → her yerde kapalı → mobilde mağaza puanlama isteği **hiç tetiklenmez**. | **Bağlı — ama varsayılan kapalı olması niyetle uyuşuyor mu kontrol et.** Mobilde bugün bağlandıysa ve istek görünmesi bekleniyorsa en az bir işletmede açılmalı ya da mobil tarafta varsayılan "açık" olmalı. |

**Ek bulgu (görev dışı, sadece bilgi):** Admin flag panelindeki `voice_assistant`, `auto_confirm`, `reminder_sms` web kodunda **hiç okunmuyor** (`app lib src components n8n` içinde isimleri geçmiyor). Mobilde kullanılıp kullanılmadığı DOĞRULANMADI → "yakında" işaretlemesi yapılmadı (emin olmadan davranış değiştirmeme kuralı). `/api/feature-flag` herkese açık ama sadece `enabled` boolean döndürüyor — sorun yok.

### G6 — Build ve kod sağlığı

| Kontrol | Sonuç |
|---|---|
| `npm run build` (Next 16.2.2, Turbopack) | ✅ exit 0. 3 uyarı: (1) `next.config` `/_next/static/(.*)` için özel Cache-Control (dev davranışını bozabilir); (2) `lib/audio-sentences.ts:1723` dinamik `path.join` → **13.512 mp3 dosyası** trace ediliyor (`app/api/voice/route.ts` üzerinden) — build süresi/bundle boyutu; (3) edge runtime kullanan sayfa static generation'ı kapatıyor (`api/og`). |
| `npx tsc --noEmit` | ✅ exit 0 (tüm commit'lerden sonra tekrar çalıştırıldı). |
| `eslint .` | ❌ 288 sorun (164 error, 124 warning). **Build'i bozmuyor** (Next build lint çalıştırmıyor). |

**Lint dağılımı ve karar:**
| Kural | Adet | Değerlendirme | Yapılan |
|---|---|---|---|
| `@next/next/no-html-link-for-pages` | 117 error | 14 dosyada `<a href="/...">` (PanelSidebar 18, not-found 10, MarketingHeader/LoginForm/ForgotPassword/register 12'şer…). Tam sayfa yenileme yapar, hata değil performans. | Dokunulmadı (toplu `<Link>` dönüşümü = geniş diff, gece için riskli) |
| `@typescript-eslint/no-unused-vars` | 107 warn | Temizlik | Dokunulmadı |
| `@typescript-eslint/no-explicit-any` | 17 error | Tip borcu | Dokunulmadı |
| React Compiler kuralları (`set-state-in-effect`, `purity`, `immutability`) | 16 error | Çoğu bilinçli desen (localStorage okuma effect'te setState, server component'te `Date.now()`). `app/panel/_components/PanelLangSelector.tsx:31` "This value cannot be modified" incelenmeye değer. | Dokunulmadı |
| `react/no-unescaped-entities` | 11 error | Kozmetik | Dokunulmadı |
| `prefer-const` | 3 error | Güvenli | ✅ `ed57807` |
| `_referans/kroki-editor-final.jsx` | — | Referans dosyası lint'e giriyor | Öneri: eslint ignore'a ekle |

**Hardcode taraması** (not: ilk denemede zsh `$D` değişkeni kelimelere bölünmediği için grep'ler boş döndü; açık yollarla tekrarlandı):
- **Railway:** `app/admin/restaurants/QRCodeButton.tsx:13` → `https://checkrezerve-app-production.up.railway.app` fallback'i (env yoksa ve SSR'da QR kod bu adrese gidiyordu) → ✅ `a799963` ile `https://checkrezerve.com`. Kalan: `next.config.ts:7` ve `Dockerfile:20` sadece yorum.
- **Supabase URL hardcode:** `app/[locale]/giris/page.tsx:58` Apple OAuth `redirect_uri` = `https://posarvagedpqtsrcrwfe.supabase.co/functions/v1/apple-auth` → env'den (`NEXT_PUBLIC_SUPABASE_URL`) türetilmeli. Proje değişmedikçe çalışır; dokunulmadı.
- **Anahtar (`sk_`, `eyJ…`, `AKIA`, `AIza`):** bulunamadı ✅.
- **localhost / VPS IP:** bulunamadı ✅.
- **Telefon:** `app/layout.tsx:141` JSON-LD `telephone: '+90-542-462-6295'` (işletme iletişim numarası, bilinçli olabilir). Diğerleri örnek/placeholder.
- **Harici URL'ler** (bilinçli): `api.deepseek.com`, `api.elevenlabs.io`, `api.openai.com`, `api.twilio.com`, `api.netgsm.com.tr`, `api.telegram.org`, `n8n.checkrezerve.com`, `sandbox.iyzipay.com` (`lib/iyzico.ts` varsayılanı — **prod'da `IYZICO_BASE_URL` set edilmezse sandbox'a gider**, DOĞRULANMADI), unsplash/pexels görselleri.

**TODO/FIXME/HACK:**
- `app/api/ai-assistant/initiate/route.ts:8` — "n8n ElevenLabs + Whisper entegrasyonu buraya eklenecek" → endpoint şu an stub olabilir; ai-assistant yol haritasına bağlı.
- `components/FloorMapEditor.tsx:29` — "mouse pozisyonunu izometrik grid'e çevir" → dosyanın kendisi kullanılmıyor (aşağıda).
(`XXX` eşleşmeleri telefon placeholder'ı, TODO değil.)

**Kullanılmayan dosya adayları (import edilmiyor — SİLİNMEDİ):**
`components/AnimatedBusinessCards.tsx`, `components/BusinessCardSkeleton.tsx`, `components/FloatingCTA.tsx`, `components/FloorMapEditor.tsx` (W-78 iskeleti), `lib/anthropic.ts`, `src/components/kroki/KrokiViewer.tsx`, `src/components/kroki/ZoneCard.tsx`, `src/components/kroki/ZoneEditor.tsx`, `src/components/kroki/ZoneViewer.tsx`.
⚠ `ZoneViewer`: W-100 notuna göre müşteri formunda `kroki_mode='zones'` iken kullanılması gerekiyordu, ama `BookingForm.tsx:648,765`'te sadece yorumda geçiyor, import yok → zones modunda müşteri eski/farklı bir görünüm görüyor olabilir. DOĞRULANMADI.
(`lib/env.ts` kullanılıyor: `instrumentation.ts`.)

### G7 — RLS doğrulaması (sadece SELECT)

**`calisan_saatler` (pg_policies):**
| Policy | Komut | Rol | Koşul |
|---|---|---|---|
| `calisan_saatler_public_read` | SELECT | public | `true` → **public SELECT VAR** ✅ (dünkü yorum düzeltmesi doğru) |
| `calisan_saatler_super_admin_only` | ALL | public | `profiles.role = 'super_admin'` (auth.uid()) |

→ **Yazma sadece super_admin'e açık.** Müşteri veya başka işletme istemciden çalışan saatlerini **değiştiremez** ✅. İşletme sahipleri de istemciden yazamaz; panel `app/api/panel-tables` (admin client + `calisanlar.restaurant_id` scope kontrolü) üzerinden yazıyor.

**RLS kapalı tablo:** yok ✅ (public şemadaki tüm tablolarda `relrowsecurity = true`).
**RLS açık ama policy'siz (= istemciye tamamen kapalı, sadece service_role):** `admin_audit_logs`, `erteleme_talepleri`, `faq`, `musteri_notlari`, `musteri_paketleri`, `paketler`, `push_subscriptions` — bilinçli görünüyor (hepsine API/admin client ile erişiliyor).

**`true` ile açık yazma policy'leri:**
| Tablo | Policy | Komut/Rol | Değerlendirme |
|---|---|---|---|
| `reservations` | `reservations_anon_insert` | INSERT / public, `WITH CHECK (true)` | **🔴 KRİTİK:** anon key (istemcide açık) ile API atlanarak **herhangi bir işletmeye, herhangi bir status'la (`confirmed` dahil), rate-limit ve müsaitlik guard'ı olmadan** rezervasyon yazılabilir. Mobil muhtemelen buna dayanıyor → SQL taslağı 03 (ADIM 1: `status='pending'` + işletme var). |
| `conversations` | `conversations_anon_insert` | INSERT / anon,authenticated | 🟡 Chatbot log'u; spam riski, veri sızıntısı yok. |
| `business_leads` | `insert_lead` | INSERT / public | 🟡 Başvuru formu, bilinçli (okuma `false`). |
| `kvkk_applications` | `insert_kvkk` | INSERT / public | 🟡 KVKK başvuru formu, bilinçli. |
| `calisanlar`, `hizmetler` | `svc_all_*` | ALL / **service_role** | ✅ Sadece service_role — zaten RLS bypass, zararsız. |

**Diğer dikkat çekenler:**
- **🟠 `calisanlar` herkese açık SELECT (tüm kolonlar):** `aktif = true` satırlarda `telefon` ve `email` de anon'a açık. Şu an 10 aktif çalışanın hiçbirinde dolu değil → **gizil KVKK riski**; panelden doldurulduğu an sızar. SQL 03 ADIM 2 (yorumda — mobilin hangi kolonları okuduğu kontrol edilmeli).
- **🟡 `bildirim_log`, `bildirim_sablonlari`:** ALL policy `restaurants.email = auth.email()` ile — işletme e-postasıyla aynı e-postada Supabase hesabı açan biri bu tablolara yazabilir. Supabase e-posta doğrulaması zorunluysa risk düşük; DOĞRULANMADI.
- `services`, `staff` (eski İngilizce şema): public SELECT (`is_active`), yazma policy'si yok ✅.
- `ozellik_tanimlari`: public SELECT `true` (tanım tablosu, sorun yok).

### G8 — Temizlik taslağı

- `4eaabe67-d2bb-4d4b-a074-9b011415633d` **reservations'ta YOK** (SELECT: 0 satır; `4eaabe67` önekiyle de 0). Bağlı tablolarda da referans yok (ai_reservations, email_logs, messages, erteleme_talepleri, guest_activities.metadata → hepsi 0). Muhtemelen daha önce silinmiş.
- Yine de idempotent taslak yazıldı: `.agents/sql-taslak/04-test-rezervasyon-silme.sql` (ön kontrol 0 dönerse "DURDUR" notu var). **Çalıştırmaya gerek yok.**
- FK haritası (reservations'a bağlananlar): `email_logs`, `erteleme_talepleri` → CASCADE; `ai_reservations`, `messages` → SET NULL; `guest_activities` FK'siz (metadata JSON).
- Ceviz Tuzla id: `9e8bc507-56ea-4bbc-9b01-5e662985df83`.

### G9 — learned.md
`d57b853`: #3 grep/rg `-i` (UI metni), #4 yorum yerine DB'den doğrula, #5 aynı kavram için var olan kolonu ara. Kural #1 (PII kolonları) G8'de uygulandı, sorun önlemedi → `applied` 1→2.

---

## Gece görevi sonu — `git log main..HEAD --oneline`
```
d57b853 docs(learned): 3 yeni ders (grep -i, yorum yerine DB, çift kolon) + #1 sayaç
a799963 fix(admin): QR kod fallback'inde eski Railway URL'si checkrezerve.com yapıldı
ed57807 chore(lint): prefer-const hataları (3)
2306a21 fix(guvenlik): iyzico webhook imzası boş secret ile doğrulanmıyor
4f31ae5 fix(guvenlik): panel API'lerinde işletme sahipliği (tenant) kontrolü
1a1736f fix(panel-ui): misafir etiketi ve admin durum güncellemesinde yanlış 'başarılı'
b2f1a45 fix(kroki): kaldırılan masaları pasifleştirme hatası okunuyor
6009ba3 fix(paket): paket yenileme ve hatırlatma cron'unda okunmayan DB hataları
68e05ab fix(bildirim): kanal ayarı ve müşteri kanal tercihi kaydı hataları okunuyor
b8e1cf8 fix(odeme): iyzico webhook ve abonelik akışında okunmayan DB hataları
```
