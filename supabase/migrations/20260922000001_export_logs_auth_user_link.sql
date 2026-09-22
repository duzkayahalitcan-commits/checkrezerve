-- =============================================================================
-- Migration: export_logs FK bug fix — restaurant_users.user_id eksik kolon
-- Tarih: 2026-09-22
-- ⚠️ OTOMATİK UYGULANMADI. Halitcan Supabase SQL Editor'den elle çalıştıracak.
--
-- Kök neden: restaurant_users tablosunda Supabase Auth kullanıcısına (auth.uid())
-- bağlayan bir kolon hiç yoktu. Daha önceki migration'lar (20260626230000,
-- 20260627000001) `restaurant_users.user_id` kolonunu RLS policy'lerinde
-- referans alıyordu ama kolon DB'ye hiç eklenmemişti (20260821 hotfix'te de
-- belgelenmiş bir durum). Bu yüzden panel-export route'unda auth ile giriş
-- yapan owner/manager kullanıcıları için export_logs.restaurant_user_id FK'i
-- hiçbir zaman eşleşmiyordu ve insert sessizce başarısız oluyordu.
--
-- Bu migration:
--   1. restaurant_users.user_id (nullable, auth.users(id) referansı) ekler
--   2. Var olan satırları username ile auth email eşleşmesiyle otomatik doldurmaya
--      ÇALIŞIR (best-effort, garanti değil — eşleşmeyenler NULL kalır)
--   3. İndeks ekler
-- =============================================================================

-- 1. Kolon ekle
ALTER TABLE restaurant_users
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS restaurant_users_user_id_idx
  ON restaurant_users(user_id);

-- 2. Best-effort doldurma: restaurant_users.username genelde e-posta formatında,
--    auth.users.email ile birebir eşleşiyorsa otomatik bağla.
--    (username e-posta değilse — örn. "nusret_yönetici" gibi legacy kullanıcı adları —
--    eşleşme olmaz, user_id NULL kalır ve o kullanıcılar legacy panel login akışını
--    kullanmaya devam eder; kod tarafında zaten id eşleşmesiyle çalışıyorlar.)
UPDATE restaurant_users ru
SET user_id = au.id
FROM auth.users au
WHERE ru.user_id IS NULL
  AND lower(ru.username) = lower(au.email);

-- 3. Doğrulama sorgusu (bilgi amaçlı, manuel çalıştırılacak):
-- SELECT id, username, user_id, restaurant_id FROM restaurant_users ORDER BY created_at;
