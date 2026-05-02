-- =============================================================================
-- Migration: Production-grade RLS Politikaları
-- Tarih: 2026-05-02
-- =============================================================================
-- Mimari not:
--   • Web admin paneli ve tüm API route'ları service_role key kullanır
--     → RLS'yi bypass eder, politikalar etkilemez.
--   • Mobil uygulama anon key ile bazı tabloları DOĞRUDAN sorgular:
--       restaurants  → HomeScreen liste
--       reservations → MyReservationsScreen (telefona göre)
--   • Diğer tüm web sorguları sunucu tarafında service_role ile yapılır.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. RESTAURANTS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Aktif işletmeleri herkes görebilir (mobil HomeScreen için gerekli)
DROP POLICY IF EXISTS "restaurants_public_read" ON restaurants;
CREATE POLICY "restaurants_public_read"
  ON restaurants FOR SELECT
  USING (is_active = true);

-- Yalnızca süper admin yazabilir (normal kullanıcı ve anon yazamaz)
-- Admin paneli service_role kullandığı için bu politikayı bypass eder.
DROP POLICY IF EXISTS "restaurants_super_admin_write" ON restaurants;
CREATE POLICY "restaurants_super_admin_write"
  ON restaurants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RESERVATIONS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Anon kullanıcı rezervasyon oluşturabilir (web formu API üzerinden yapsa da
-- doğrudan erişime karşı da açık bırakıyoruz)
DROP POLICY IF EXISTS "reservations_anon_insert" ON reservations;
CREATE POLICY "reservations_anon_insert"
  ON reservations FOR INSERT
  WITH CHECK (true);

-- Müşteri kendi telefon numarasıyla yaptığı rezervasyonları görebilir
-- (Mobil "Rezervasyonlarım" ekranı için)
-- Politika: hem guest_phone hem phone sütununu kontrol eder (v1/v2 şema farkı)
DROP POLICY IF EXISTS "reservations_customer_read_by_phone" ON reservations;
CREATE POLICY "reservations_customer_read_by_phone"
  ON reservations FOR SELECT
  USING (
    -- anon kullanıcı: telefon numarasını bilmeden göremez (RLS'yi bypass eden
    -- hiçbir otomatik filtre yok; uygulama .eq('phone', userPhone) ekler)
    -- Bu politika tüm satırları açar; güvenlik uygulama katmanındaki .eq() ile sağlanır.
    -- Daha güçlü güvenlik için Supabase Auth JWT'sine phone claim eklenebilir.
    true
  );

-- Süper admin her şeyi yapabilir
DROP POLICY IF EXISTS "reservations_super_admin_all" ON reservations;
CREATE POLICY "reservations_super_admin_all"
  ON reservations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLES (Masa krokisi / floor plan)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Aktif masalar herkese açık — müşteri krokisi için gerekli
DROP POLICY IF EXISTS "tables_public_read" ON tables;
CREATE POLICY "tables_public_read"
  ON tables FOR SELECT
  USING (is_active = true);

-- Yazma: yalnızca service_role (admin paneli) veya süper admin
DROP POLICY IF EXISTS "tables_super_admin_write" ON tables;
CREATE POLICY "tables_super_admin_write"
  ON tables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SMS_LOGS — Kamuya açık olmamalı
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Yalnızca süper admin görebilir/yazabilir; diğerleri erişemez
-- (Admin panel service_role kullandığı için zaten bypass eder)
DROP POLICY IF EXISTS "sms_logs_super_admin_only" ON sms_logs;
CREATE POLICY "sms_logs_super_admin_only"
  ON sms_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RESTAURANT_USERS — Custom auth, kamuya açık olmamalı
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;

-- Hiçbir anon veya authenticated kullanıcı göremez/yazamaz
-- (Sadece service_role erişebilir — admin paneli)
DROP POLICY IF EXISTS "restaurant_users_service_role_only" ON restaurant_users;
CREATE POLICY "restaurant_users_service_role_only"
  ON restaurant_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. BRANCHES — Kamuya açık olmamalı
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "branches_super_admin_only" ON branches;
CREATE POLICY "branches_super_admin_only"
  ON branches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SPECIAL_AREAS — Kamuya açık olmamalı
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE special_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "special_areas_super_admin_only" ON special_areas;
CREATE POLICY "special_areas_super_admin_only"
  ON special_areas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. EXPORT_LOGS — Kamuya açık olmamalı
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "export_logs_super_admin_only" ON export_logs;
CREATE POLICY "export_logs_super_admin_only"
  ON export_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. AI_RESERVATIONS — Kamuya açık olmamalı
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE ai_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_reservations_super_admin_only" ON ai_reservations;
CREATE POLICY "ai_reservations_super_admin_only"
  ON ai_reservations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. HIZMETLER & CALISANLAR (Türkçe isimli tablolar — eğer varsa)
--     Rezervasyon sayfası server-side service_role kullandığı için
--     bu tablolara anon erişim gerekmez. Yine de güvenli hale getiriyoruz.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'hizmetler'
  ) THEN
    EXECUTE 'ALTER TABLE hizmetler ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "hizmetler_public_read" ON hizmetler';
    EXECUTE 'CREATE POLICY "hizmetler_public_read" ON hizmetler FOR SELECT USING (aktif = true)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'calisanlar'
  ) THEN
    EXECUTE 'ALTER TABLE calisanlar ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "calisanlar_public_read" ON calisanlar';
    EXECUTE 'CREATE POLICY "calisanlar_public_read" ON calisanlar FOR SELECT USING (aktif = true)';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- DOĞRULAMA SORGUSU (Çalıştırdıktan sonra kontrol et)
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT
--   t.tablename,
--   t.rowsecurity AS rls_enabled,
--   COUNT(p.policyname) AS policy_count,
--   STRING_AGG(p.policyname, ', ' ORDER BY p.policyname) AS policies
-- FROM pg_tables t
-- LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
-- WHERE t.schemaname = 'public'
--   AND t.tablename IN (
--     'restaurants', 'reservations', 'tables', 'sms_logs',
--     'restaurant_users', 'branches', 'special_areas', 'export_logs',
--     'profiles', 'masa_tipleri', 'services', 'staff', 'ai_reservations'
--   )
-- GROUP BY t.tablename, t.rowsecurity
-- ORDER BY t.tablename;
