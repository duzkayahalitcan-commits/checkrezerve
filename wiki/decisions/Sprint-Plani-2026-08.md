# Sprint Plani — 2026-08

Builder: Halitcan (solo) · Repo: `~/Desktop/checkrezerve`

## Sprint 3 Kapsamı

Sprint 3, kod kalitesi, önbellek ve veritabanı performansı odaklı bir bakım
sprintidir. Yeni özellik eklemek yerine mevcut temeli sağlamlaştırır.

### T1 — SELECT `*` temizliği
- `select('*')` ifadeleri açık kolon listeleriyle değiştirilir.
- Gerekçe: RLS + PostgREST'te gereksiz veri transferi, kolon değişikliklerinde
  kırılganlık, DB + network yükü. Açık kolon listesi tüketen kodu da belgeler.
- Kapsam: `app/`, `lib/`, `src/` içindeki tüm `select('*')` çağrıları.
- Risk: Kolon adı hatası runtime'da sessizce bozar. Her tablo için migration
  şemasından kolon listesi doğrulanır.

### T2 — `console.log` temizliği
- Gerçek debug amaçlı `console.log`'lar kaldırılır.
- Bilinçli performans enstrümantasyonu (AI asistan timing logları) korunur,
  kaldırılmaz; bunlar prod'da teşhis için değerlidir.
- Hata logları (`console.error`) korunur.
- Gerekçe: üretim log kirliliğini azaltmak, PII/URL sızıntısını önlemek.

### T3 — ISR cache
- Statik halka açık sayfalarda on-demand/aralıklı yenileme (ISR) etkinleştirilir.
- `next.config.ts` içindeki global `no-cache, no-store` HTML başlığı, gerçekten
  dinamik sayfaları (rezervasyon akışı, auth, panel) kapsayacak şekilde
  daraltılır; statik sayfalar cache'lenebilir.
- Gerekçe: halka açık landing/restoran sayfalarında TTFB ve DB yükü düşürmek.

### T4 — Merkezi middleware
- `proxy.ts` içindeki cookie tabanlı auth doğrulama mantığı
  `lib/middleware-auth.ts` içine çıkarılır.
- `lib/panel-auth.ts` ile duplike edilen HMAC/panel token mantığı tek
  kaynaktan (edge-safe, saf fonksiyon) yönetilir.
- Gerekçe: middleware + API route auth kuralları tek yerde tanımlanır,
  sapma/duplikasyon riski azalır.

### T5 — Composite index'ler
- Sıcak sorgu desenleri için composite index migration'ı eklenir:
  - `reservations(restaurant_id, date)` ve varsa `(restaurant_id, created_at)`
  - `calisanlar(restaurant_id, aktif)`
  - `bildirim_log(isletme_id, created_at)`
  - Sorgularda görülen diğer eşleşmeler.
- Gerekçe: panel listeleme + rapor sorgularında seq scan'i bitmap/index scan'e
  çevirmek. Migration geri alınamaz yapılır (DROP yok, IF NOT EXISTS).

## Kararlar
- Sprint 3'ün her görevi ayrı commit ile işlenir (`S3-T1` … `S3-T5`).
- Migration'lar `IF NOT EXISTS` içerir ve DROP içermez.
- T3 (ISR) ve T5 (index) doğruluğu korumak için dar kapsamla uygulanır; aşırı
  statikleştirme yapılmaz.

## Kabul Kriterleri
- `npm run build` (veya typecheck) temiz geçer.
- T1'de hiçbir sorgu kolon listesi nedeniyle bozulmaz.
- T5 migration'ı mevcut şemaya güvenle uygulanabilir.
