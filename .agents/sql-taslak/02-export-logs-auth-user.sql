-- =============================================================================
-- 02 — export_logs: Supabase Auth kullanıcısını doğrudan kaydet
-- Hazırlayan: gece görevi G1 (2026-09-23) — UYGULANMADI, Halitcan çalıştıracak
--
-- NE YAPAR:
--   export_logs'a nullable `auth_user_id uuid` kolonu ekler (auth.users FK, ON DELETE SET NULL).
--   Neden: Supabase Auth ile panele giren kullanıcıda session.userId = profiles.id (auth uid).
--   restaurant_users.user_id kolonu var ama 6 satırın 6'sında NULL (20260922 migration'ının
--   username↔email eşleşmesi 0 satır buldu). Yani auth kullanıcıları için
--   restaurant_user_id her zaman NULL yazılıyor → denetim izinde "kim export etti" kayboluyor.
--   Bu kolonla kod, auth kullanıcısını restaurant_users eşlemesine ihtiyaç duymadan yazabilir.
--
-- RİSK: Düşük. Sadece nullable kolon ekler, mevcut satır yok (export_logs = 0 satır, 2026-09-23).
--   Kod değişikliği bu SQL çalıştıktan SONRA yapılmalı (panel-export/route.ts insert'ine
--   `auth_user_id: exportUserId ? null : session.userId` benzeri alan). Önce kod gelirse insert
--   42703 ile başarısız olur (export yine çalışır, sadece log düşer).
--
-- GERİ DÖNÜŞ: ALTER TABLE public.export_logs DROP COLUMN IF EXISTS auth_user_id;
-- =============================================================================

ALTER TABLE public.export_logs
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- DOĞRULAMA (tek satır dönmeli: auth_user_id | uuid | YES)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'export_logs' AND column_name = 'auth_user_id';
