# API Sözleşmeleri (web → app)

> Bu gece (`gece-2026-09-23` branch'i) açılan/değişen endpoint'ler. **Henüz main'de ve prod'da değil** — app oturumu sabah merge + deploy sonrasına kadar bunlara bağlanmamalı.

## POST /api/rezervasyon/iptal  (yeni — CM-04)
- **Auth:** yok (misafir); SMS'teki `cancellation_token` yetki yerine geçer. Rate-limit: 10/dk/IP.
- **Request:** `{ "token": "<cancellation_token>" }`
- **200:** `{ "success": true }` → rezervasyon `cancelled`, token sıfırlanır, işletmeye + müşteriye iptal bildirimi (orchestrator).
- **400** geçersiz token biçimi · **404** token bulunamadı/kullanılmış · **409** zaten iptal / tamamlanmış / başlama saati geçmiş · **500** DB hatası. Gövde: `{ "error": "<Türkçe, kullanıcıya gösterilebilir>" }`

## DELETE /api/users/me  (davranış düzeltildi — MB-01/LG-07)
- **Auth:** `Authorization: Bearer <supabase access_token>`
- Değişmeyen sözleşme: 200 `{ success, message }`, 401, 429, 500 `{ error }`.
- Değişen: önceden her istek 500 dönüyordu (olmayan kolonlar). Artık rezervasyonlar e-posta + profil telefonuyla eşleşip anonimleştirilir (`guest_name='Silinmiş kullanıcı'`), push_tokens/push_subscriptions/musteri_kanal_tercihleri silinir, auth kullanıcısı silinir.

## POST /api/rezervasyon  (davranış değişiklikleri)
- Yeni body alanı: `sms_consent: boolean` (isteğe bağlı; yalnızca `true` ise pazarlama izni kaydedilir) — LG-02.
- Yeni 400: geçersiz telefon (`"Telefon numarası geçersiz. Örnek: 0 5XX XXX XX XX"`) — PX-12.
- Yeni 409: işletmenin kapalı günü (`"İşletme bu tarihte kapalı…"`) — OP-11.
- 500 gövdesi artık teknik DB mesajı değil, kullanıcıya gösterilebilir Türkçe metin — PX-03.

## GET /api/health  (alan eklendi — OB-03)
- `{ status: "ok" | "degraded", db, redis: "ok"|"error"|"disabled", sms: { provider, configured }, latency_ms, ts }`. DB hatasında 503 (değişmedi).

## GET/POST /api/panel/reservations  (yeni — OP-03)
- **Auth:** panel oturumu (`cr_panel` cookie). İşletme = oturumdaki `restaurantId` (body'den alınmaz).
- **GET `?phone=05321234567`** → `{ guest: { name, email, visits, lastVisit } | null }` (aynı işletmede bu numaranın son kaydı; biçim farkları `phoneKey` ile eşleşir).
- **POST** body: `{ guest_name, guest_phone, reserved_date: "YYYY-MM-DD", reserved_time: "HH:MM", party_size?, calisan_id?, hizmet_id?, notes? }`
  - Kayıt `status: "confirmed"`, `source: "phone"`, `hizmet_id` (kanonik kolon) ile yazılır.
  - **200** `{ success: true, id }` · **400** eksik/geçersiz alan, başka işletmenin çalışanı/hizmeti · **409** aynı çalışan aynı saatte dolu · **401** oturum yok · **500** `{ error }` (Türkçe).
  - `walk_in: true` (OP-04): `source='walk_in'` (SQL 06 uygulanmadıysa `'phone'` + not başına `[Walk-in]`). Tarih/saati istemci 'şimdi' olarak gönderir.
  - Not: müşteriye onay SMS'i **gönderilmez** (bilinçli; telefonda zaten konuşuldu). İstenirse sabah karar.

---

# Mobil için panel API'leri (2026-09-23 akşam)

**Ortak kimlik doğrulama (`getPanelApiSession`, `lib/panel-auth.ts`):**
- Web: `cr_panel` cookie. Mobil: `Authorization: Bearer <Supabase access_token>`.
- Bearer'da kullanıcı `profiles` üzerinden çözülür; **yalnızca** `role ∈ {super_admin, business_owner, business_manager}` ve `isletme_id` dolu ise kabul edilir.
- **İşletme (tenant) her zaman oturumdan** (`profiles.isletme_id`) gelir. Body/query'deki `restaurant_id` oturumla uyuşmazsa 403; id ile yapılan güncelleme/silmeler oturumun işletmesiyle filtrelenir (başka işletmenin kaydı → 404/boş).
- Yetki: `lib/roles.ts` (`canManageServices`, `canManageStaff`, `canDeleteReservation` …) cookie ile aynı.
- Hata gövdesi: `{ "error": "<mesaj>" }`. 401 = oturum yok/geçersiz, 403 = yetki/tenant.

## Hizmet / çalışan / çalışma saati / çalışan-hizmet — `/api/panel-tables`
- `GET ?table=<t>[&calisan_id=]` · `POST { table, payload }` · `PATCH { table, id, payload }` · `DELETE { table, id }`
- `table ∈ hizmetler, calisanlar, tables, special_areas, calisan_saatler, calisan_hizmetler`
- `hizmetler` alanları: `ad, sure_dakika, fiyat, kategori, renk, aktif` · `calisanlar`: `ad, soyad, uzmanlik, telefon, email, pozisyon, foto_url, aktif`
- `restaurant_id` payload'dan alınmaz, oturumdan eklenir. `calisan_saatler`/`calisan_hizmetler` için `calisan_id` bu işletmeye ait olmalı (403).
- `calisan_hizmetler` DELETE `id` = `"<calisan_id>_<hizmet_id>"`.

## Paketler — `/api/panel/paketler`
- `GET ?restaurant_id=` (oturumla aynı olmalı) · `POST { restaurant_id, ad, toplam_seans, gecerlilik_gun, fiyat?, hizmet_id? }` · `PATCH { id, ad?, toplam_seans?, gecerlilik_gun?, fiyat?, hizmet_id?, aktif? }` · `DELETE { id }` (pasifleştirir)

## Üye paketleri — `/api/panel/musteri-paketleri`, `/api/panel/paket-odeme/[id]`, `/api/panel/seans-dus`
- `GET ?restaurant_id=` · `POST { restaurant_id, paket_id, musteri_id, calisan_id? }` · `PATCH { id, action: "yenile" }`
- `PUT /api/panel/paket-odeme/<musteri_paket_id>` `{ odenen_miktar }` → `{ success, odenen_tutar, odeme_durumu }`
- `POST /api/panel/seans-dus` `{ reservation_id }` → `{ success, kalan_seans, kullanilan_seans, aktif }`

## Manuel rezervasyon — `/api/panel/reservations`
- Yukarıdaki (OP-03/OP-04) sözleşme; artık Bearer da kabul ediliyor.

## Rezervasyon durumu — `PUT /api/panel/reservations/<id>/status`
- Auth: cookie veya Bearer (yukarıdaki ortak kural). Body: `{ "status": "confirmed" | "cancelled" | "completed" | "pending" | "no_show" }`
- `cancelled` için `canDeleteReservation(role)` gerekir (owner/super_admin) → aksi 403.
- **200** `{ success: true, status }` · **404** kayıt bu işletmede yok · **409** `no_show` henüz DB'de etkin değil (SQL 09 öncesi) · **500** `{ error }` (Türkçe).
- Durum gerçekten değiştiyse `confirmed`/`cancelled` müşteriye bildirim (işletmeye SMS yok).

## Müşteri rezervasyonu (mobil) — `POST /api/rezervasyon`
- Auth isteğe bağlı. `Authorization: Bearer <Supabase access_token>` (giriş yapmış müşteri) **veya** body'de `"source": "app"` → kayıt `source='app'` (SQL 09 öncesi DB kabul etmezse otomatik `'form'`).
- Bearer geçerliyse ve `email` gönderilmediyse hesabın e-postası `guest_email`'e yazılır (Rezervasyonlarım listesi e-posta/telefonla eşleşir).
- Body (mevcut): `restaurant_id, customer_name, phone, email?, party_size, date, time, service_id? (= hizmetler.id → hizmet_id'ye yazılır), staff_id?, table_id?, zone_id?, zone_name?, special_requests?, sms_consent?`
- Mobil şu an doğrudan Supabase insert yapıyor; bu API'ye geçmek telefon doğrulaması, kapalı gün (409), çakışma kontrolleri, bildirimler ve hata mesajlarını ortak yapar.
- Yanıtlar: **200** `{ success, id }` · **400** eksik alan/geçersiz telefon · **409** çakışma/kapalı gün/bölge dolu · **429** rate-limit · **500** `{ error }`.

## Müşteri: kendi rezervasyonları — `GET /api/musteri/rezervasyonlar?limit=50`, `POST /api/musteri/rezervasyonlar/iptal { id }`
- Auth: `Bearer <Supabase access_token>` zorunlu. Eşleşme: hesabın e-postası (`guest_email`, büyük/küçük harf duyarsız) + profil telefonu varyantları.
- GET → `{ reservations: [{ id, guest_name, reserved_date, reserved_time, party_size, status, created_at, restaurants: { name, slug } }] }`
- İptal → **200** `{ success }` · **404** bulunamadı/başkasının · **409** zaten iptal / tamamlanmış / geçmiş · **401**.
