-- =============================================================================
-- 04 — Test rezervasyonu silme: 4eaabe67-d2bb-4d4b-a074-9b011415633d (Ceviz Tuzla)
-- Hazırlayan: gece görevi G8 (2026-09-23) — UYGULANMADI
--
-- ⚠ DURUM (SELECT, 2026-09-23): KAYIT ZATEN YOK.
--   reservations'ta bu id (ve '4eaabe67' önekiyle başlayan hiçbir id) bulunamadı.
--   Bağlı tablolarda da referans yok: ai_reservations 0, email_logs 0, messages 0,
--   erteleme_talepleri 0, guest_activities.metadata 0.
--   → Büyük olasılıkla daha önce silinmiş. ÇALIŞTIRMAYA GEREK YOK.
--   Aşağıdaki SQL yine de idempotent (kayıt yoksa 0 satır siler) ve tekrar oluşursa diye duruyor.
--
-- Bağlı FK'ler (reservations.id'ye referans verenler):
--   email_logs.reservation_id          ON DELETE CASCADE  → otomatik silinir
--   erteleme_talepleri.reservation_id  ON DELETE CASCADE  → otomatik silinir
--   ai_reservations.reservation_id     ON DELETE SET NULL → satır kalır, bağ kopar
--   messages.reservation_id            ON DELETE SET NULL → satır kalır, bağ kopar
--   guest_activities                   FK YOK (metadata JSON'da reservation_id) → elle silinir
--
-- RİSK: Düşük. Tek id, işletme id'siyle birlikte filtreli (yanlış işletmede aynı id olamaz ama
--   ikinci emniyet). Kolon adları learned.md #1'e göre kontrol edildi (PII kolonuna dokunulmuyor,
--   sadece id ile siliniyor).
-- GERİ DÖNÜŞ: Yok (silme). Gerekirse önce ÖN KONTROL çıktısını sakla.
-- =============================================================================

-- ── ÖN KONTROL (1 satır dönmeli; 0 dönerse DURDUR — silinecek bir şey yok) ────
SELECT r.id, r.status, r.reserved_date, r.reserved_time, rest.name AS isletme
FROM public.reservations r JOIN public.restaurants rest ON rest.id = r.restaurant_id
WHERE r.id = '4eaabe67-d2bb-4d4b-a074-9b011415633d'
  AND r.restaurant_id = '9e8bc507-56ea-4bbc-9b01-5e662985df83';  -- Ceviz Tuzla

BEGIN;
DELETE FROM public.guest_activities
 WHERE metadata->>'reservation_id' = '4eaabe67-d2bb-4d4b-a074-9b011415633d';

DELETE FROM public.reservations
 WHERE id = '4eaabe67-d2bb-4d4b-a074-9b011415633d'
   AND restaurant_id = '9e8bc507-56ea-4bbc-9b01-5e662985df83';
-- Beklenen: DELETE 1 (kayıt varsa) / DELETE 0 (yoksa). Beklenmedik sayı → ROLLBACK;
COMMIT;

-- ── DOĞRULAMA (0 dönmeli) ────────────────────────────────────────────────────
SELECT count(*) FROM public.reservations WHERE id = '4eaabe67-d2bb-4d4b-a074-9b011415633d';
