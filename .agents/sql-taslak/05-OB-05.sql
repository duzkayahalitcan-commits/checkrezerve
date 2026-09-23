-- =============================================================================
-- 05 — OB-05 mesaj gönderim logu kolonları
-- Hazırlayan: Görev 3 (2026-09-23) — UYGULANMADI, Halitcan çalıştıracak
--
-- NE YAPAR:
--   1. sms_logs'a error_message + provider_message_id kolonları (lib/notification-service.ts
--      logSend() bunları yazar; kolonlar yokken temel alanlarla yazmaya devam eder).
--   2. bildirim_log'a hata_mesaji kolonu: app/panel/[slug]/bildirimler/actions.ts başarısız
--      gönderimleri `hata_mesaji` ile yazıyor ama kolon DB'de YOK → bu insert'ler şu an
--      hata verip düşüyor (başarısız toplu SMS/push kayıtları hiç tutulmuyor).
--
-- RİSK: Düşük — sadece nullable kolon ekleme, mevcut satır/kod bozulmaz.
-- =============================================================================

ALTER TABLE public.sms_logs     ADD COLUMN IF NOT EXISTS error_message       text;
ALTER TABLE public.sms_logs     ADD COLUMN IF NOT EXISTS provider_message_id text;
ALTER TABLE public.bildirim_log ADD COLUMN IF NOT EXISTS hata_mesaji         text;

-- ── DOĞRULAMA (3 satır dönmeli) ──────────────────────────────────────────────
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND ((table_name = 'sms_logs' AND column_name IN ('error_message', 'provider_message_id'))
    OR (table_name = 'bildirim_log' AND column_name = 'hata_mesaji'));

-- ── GERİ ALMA ────────────────────────────────────────────────────────────────
-- (Kolon silme kuyruk kurallarında yasak; gerekirse Halitcan karar verir.)
-- ALTER TABLE public.sms_logs     DROP COLUMN IF EXISTS error_message;
-- ALTER TABLE public.sms_logs     DROP COLUMN IF EXISTS provider_message_id;
-- ALTER TABLE public.bildirim_log DROP COLUMN IF EXISTS hata_mesaji;
