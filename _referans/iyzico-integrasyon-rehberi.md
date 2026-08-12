# İyzico Abonelik Entegrasyonu — Hazırlık / Aktivasyon Rehberi

CheckRezerve abonelik (SaaS) ödemeleri için İyzico native subscription entegrasyonu.
Kod tarafı büyük ölçüde hazır; bu rehber **canlıya geçiş** için gerekenleri ve
bilinen noktaları toplar. Tarih: 2026-08-06.

---

## 1. Mevcut durum (kod tarafı ne hazır?)

| Katman | Dosya(lar) | Durum |
|--------|------------|-------|
| SDK / API istemcisi | `lib/iyzico.ts` | Hazır |
| Checkout başlat | `app/api/subscriptions/checkout/route.ts` | Hazır |
| Checkout sonucu | `app/api/subscriptions/callback/route.ts` | Hazır |
| Webhook | `app/api/iyzico/webhook/route.ts` | Hazır |
| Abonelik iptal | `app/api/subscriptions/cancel/route.ts` | Hazır |
| Ödeme geçmişi | `app/api/subscriptions/payments/route.ts` | Hazır |
| Checkout form yükleme | `app/api/subscriptions/checkout-form/route.ts` | Hazır |
| DB şema + RLS | `supabase/migrations/20260517000001_subscriptions.sql` | Hazır |
| Uçtan uca akış | `subscriptions`, `subscription_payments`, `iyzico_webhook_logs` | Hazır |

### Akış
1. Kullanıcı panelde plan seçer → `POST /api/subscriptions/checkout`
   → `initCheckoutForm` ile İyzico'da checkout formu başlatılır.
2. İyzico formu kullanıcıya gösterilir (mobil uygulama `checkoutUrl`'i açar).
3. Ödeme sonrası İyzico kullanıcıyı `/api/subscriptions/callback?token=...` adresine
   yönlendirir → `retrieveCheckoutResult` ile sonuç alınır, `subscriptions` satırı
   referans kodlarıyla güncellenir.
4. İyzico arka planda `/api/iyzico/webhook` adresine abonelik olaylarını gönderir
   (oluşturma, yenileme, ödeme başarı/hata, iptal, süre dolumu).

---

## 2. Canlıya geçiş için yapılacaklar (checklist)

### 2.1 İyzico hesabında
- [ ] **Pricing planları oluştur** (İyzico panel > Abonelik > Fiyatlandırma planları):
  `starter-monthly`, `starter-yearly`, `pro-monthly`, `pro-yearly` (enterprise dahilse ekleyin).
- [ ] Her planın **plan reference code**'unu kopyala.
- [ ] **Webhook URL'ini tanımla**: `https://checkrezerve.com/api/iyzico/webhook`
  (İyzico panel > Webhooks / Bildirimler).
- [ ] (Öneri) Sandbox'ta tam akışı test et; üretim moduna geçmeden önce test kartlarıyla
  uçtan uca doğrula.

### 2.2 `.env.local` / ortam değişkenleri (şu an placeholder)
Aşağıdaki değişkenler henüz doldurulmadı (`.env.local`'da `sandbox-placeholder` / boş):
- `IYZICO_API_KEY` — İyzico panelinden gerçek (veya sandbox) API key
- `IYZICO_SECRET_KEY` — İyzico panelinden gerçek (veya sandbox) secret key
- `IYZICO_BASE_URL` — şu an `https://sandbox.iyzipay.com`; canlıda `https://api.iyzipay.com`
- `IYZICO_PLAN_STARTER_MONTHLY_REF`
- `IYZICO_PLAN_STARTER_YEARLY_REF`
- `IYZICO_PLAN_PRO_MONTHLY_REF`
- `IYZICO_PLAN_PRO_YEARLY_REF`
- `NEXT_PUBLIC_APP_URL` — callback/checkout URL'leri için zorunlu (`https://checkrezerve.com`)

### 2.3 Supabase
- [ ] Webhook ve callback `getSupabaseAdmin()` (service-role) kullanır. **Service-role
      key'in güncel olduğundan emin ol.** (3 Ağustos'ta eski JWT service-role key
      devre dışı bırakıldı; `.env` güncel key ile düzeltildi — 06 Ağu 2026.)
- [ ] `iyzico_webhook_logs`, `subscriptions`, `subscription_payments` tablolarının
      prod şemasında mevcut olduğunu ve RLS policy'lerinin uygulandığını doğrula.

---

## 3. Bilinen riskler / dikkat noktaları

1. **Webhook imza algoritması** (`lib/iyzico.ts` → `verifyWebhookSignature`)
   `HMAC-SHA256(secret, eventType + conversationId + referenceCode)` olarak kodlanmış.
   Canlıya geçmeden **güncel İyzico dokümanıyla birebir doğrula**; imza uyuşmazsa
   webhook'lar 401 ile reddedilir (loglama yine de çalışır).

2. **`SUBSCRIPTION_CREATED` sıralama yarışı**:
   - `checkout` route'u `status='trialing'` ve **`iyzico_subscription_ref` boş** satır yazar.
   - Webhook `SUBSCRIPTION_CREATED` ise `.eq('iyzico_subscription_ref', ref)` ile
     günceller. Callback referansı yazmadan webhook gelirse eşleşme olmaz.
   - Öneri: checkout'ta satıra `conversation_id` alanı ekle veya webhook'u
     `conversationId` üzerinden eşle, ya da callback'i referansı kaydeden tek otorite yap.

3. **`callback` içinde `conversationId` parse'ı**: `restaurantId = conversationId.split('-').slice(0,5).join('-')`
   formatı `{restaurantId(UUID)}-{Date.now()}` varsayar. UUID'de 4 tire + 1 ayraç = 6 parça;
   `slice(0,5)` doğru UUID'yi çıkarır. UUID formatı değişirse kırılır — not edildi.

4. **İki ödeme sistemi var**: İyzico `subscriptions` (yeni, native) ve
   `musteri_paketleri` + `odeme_durumu` (W-67 paket sistemi). İkisinin birbiriyle
   ilişkisini (aynı işletme için hangisi tek kaynak?) karara bağlamak gerekiyor.

5. **`subscriptionInitialStatus: 'ACTIVE'`** ama DB satırı `trialing` yazılıyor;
   plan `price_per_period=0` giriliyor (webhook'ta güncellenmesi bekleniyor). Tutarlılığı
   kontrol et.

---

## 4. Sandbox test akışı

1. `.env.local`'a **sandbox** API/SECRET key ve 4 plan ref kodunu gir.
2. `IYZICO_BASE_URL=https://sandbox.iyzipay.com` (zaten varsayılan).
3. İyzico sandbox'ında test kartıyla checkout başlat.
4. Callback + webhook kayıtlarını `iyzico_webhook_logs` tablosundan izle.
5. `subscriptions` ve `subscription_payments` satırlarını doğrula.

Canlıya geçişte: `IYZICO_BASE_URL` → `https://api.iyzipay.com`, gerçek key'ler ve
canlı plan ref kodları kullanılır; webhook URL'ı canlı panele tanımlanır.
