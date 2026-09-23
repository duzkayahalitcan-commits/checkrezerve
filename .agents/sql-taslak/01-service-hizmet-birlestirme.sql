-- =============================================================================
-- 01 — reservations.service_id → reservations.hizmet_id birleştirme
-- Hazırlayan: gece görevi G2 (2026-09-23) — UYGULANMADI, Halitcan çalıştıracak
--
-- DURUM (SELECT ile doğrulandı, 2026-09-23):
--   reservations toplam 26 | sadece hizmet_id 5 | sadece service_id 0 | ikisi 0 | hiçbiri 21
--   hizmet_id  uuid NULL → hizmetler(id) ON DELETE SET NULL   (mobil yazıyor, email trigger okuyor)
--   service_id uuid NULL → services(id)  (ON DELETE yok)        (web yazıyor ama hizmetler.id gönderiyor)
--   services 4 satır / hizmetler 31 satır / ortak id 0 → web'in gönderdiği her service_id FK'i ihlal eder.
--   service_id'ye bağlı policy/view yok; reservations'ta tek trigger: on_reservation_created (hizmet_id okur).
--
-- KANONİK: hizmet_id (gerekçe raporda, G2).
--
-- SIRA (ÖNEMLİ):
--   ADIM A — kod deploy (web API hizmet_id yazar, musait düzeltilir). SQL GEREKMEZ.
--   ADIM B — backfill: service_id'de veri yok (0 satır) → aşağıdaki UPDATE 0 satır etkilemeli.
--            Yine de çalıştırılabilir tutuldu (arada web'den service_id yazılmışsa diye).
--   ADIM C — service_id'yi kaldır: SADECE blue+green ikisi de yeni kodla çalışıyorken ve
--            1 hafta boyunca loglarda service_id hatası yokken.
--
-- RİSK:
--   B: Düşük (IS NULL koşullu, mevcut hizmet_id'yi ezmez; services id'leri hizmetler'de olmadığı
--      için JOIN'le filtreli — FK ihlali olmaz).
--   C: Orta — geri alınamaz veri kaybı YOK (kolon boş) ama eski kod service_id yazarsa insert patlar.
--
-- GERİ DÖNÜŞ:
--   B: Gerek yok (etkilenen satır 0 bekleniyor).
--   C: ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id);
-- =============================================================================

-- ── ÖN KONTROL (çalıştırmadan önce; sadece_service = 0 bekleniyor) ──────────────
SELECT
  count(*) FILTER (WHERE service_id IS NOT NULL AND hizmet_id IS NULL)     AS sadece_service,
  count(*) FILTER (WHERE service_id IS NOT NULL AND hizmet_id IS NOT NULL) AS ikisi,
  count(*) FILTER (WHERE service_id IS NOT NULL
                     AND NOT EXISTS (SELECT 1 FROM public.hizmetler h WHERE h.id = r.service_id)) AS hizmetlerde_karsiligi_yok
FROM public.reservations r;

-- ── ADIM B — backfill (idempotent) ───────────────────────────────────────────
BEGIN;
UPDATE public.reservations r
   SET hizmet_id = r.service_id
 WHERE r.hizmet_id IS NULL
   AND r.service_id IS NOT NULL
   AND EXISTS (SELECT 1 FROM public.hizmetler h WHERE h.id = r.service_id);
-- Beklenen: UPDATE 0. Farklıysa sonucu kontrol et, sonra COMMIT; beklenmedikse ROLLBACK;
COMMIT;

-- ── ADIM C — service_id kaldırma (AYRI GÜN, kod deploy + 1 hafta sonra) ────────
-- ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_service_id_fkey;
-- ALTER TABLE public.reservations DROP COLUMN IF EXISTS service_id;
-- NOT: `services` tablosu (4 satır) lib/assistant-brain.ts:116 tarafından okunuyor → DROP ETME.

-- ── DOĞRULAMA ────────────────────────────────────────────────────────────────
-- B sonrası: sadece_service = 0
-- C sonrası: aşağıdaki sorgu 0 satır dönmeli
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'reservations' AND column_name = 'service_id';
