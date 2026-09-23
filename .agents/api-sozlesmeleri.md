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
