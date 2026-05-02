-- =============================================================================
-- Migration: Rol Tabanlı Yetkilendirme (RBAC)
-- Tarih: 2026-05-02
-- =============================================================================
-- profiles tablosu: id, role, isletme_id (zaten var), full_name, created_at
-- isletme_id zaten restaurant FK'si olarak kullanılıyor → restaurant_id olarak kullanıyoruz
--
-- Yeni rol sistemi:
--   super_admin      → tüm tablolara tam erişim
--   business_owner   → sadece kendi isletme_id'si
--   business_manager → owner ile aynı, export_logs hariç
--   customer         → kendi phone numarasıyla eşleşen rezervasyonlar
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES — phone kolonu ekle, constraint güncelle
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Önce constraint'i kaldır (veri güncellemeden önce)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Mevcut verileri yeni rollere taşı
UPDATE profiles SET role = 'business_owner'   WHERE role = 'isletme_admin';
UPDATE profiles SET role = 'business_manager' WHERE role = 'isletme_calisan';
UPDATE profiles SET role = 'customer'         WHERE role = 'musteri';
-- 'super_admin' değişmez

-- Yeni constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'business_owner', 'business_manager', 'customer'));

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'customer';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RESTAURANT_USERS — role constraint güncelle
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE restaurant_users DROP CONSTRAINT IF EXISTS restaurant_users_role_check;

UPDATE restaurant_users SET role = 'business_owner'   WHERE role = 'manager';
UPDATE restaurant_users SET role = 'business_manager' WHERE role = 'staff';

ALTER TABLE restaurant_users ADD CONSTRAINT restaurant_users_role_check
  CHECK (role IN ('super_admin', 'business_owner', 'business_manager', 'customer'));

ALTER TABLE restaurant_users ALTER COLUMN role SET DEFAULT 'business_manager';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. MEVCUT KULLANICILARI GÜNCELLE (auth.users email eşleştirmesi)
-- ─────────────────────────────────────────────────────────────────────────────

-- checkrezerve@proton.me → super_admin (profil satırı yoksa ekle)
INSERT INTO profiles (id, role, full_name)
SELECT u.id, 'super_admin', 'Super Admin'
FROM auth.users u
WHERE u.email = 'checkrezerve@proton.me'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- ceviz@checkrezerve.com → business_owner
-- isletme_id zaten '9e8bc507-56ea-4bbc-9b01-5e662985df83' (Ceviz Tuzla) — mevcut bağlantıyı koru
UPDATE profiles p
SET role = 'business_owner'
FROM auth.users u
WHERE p.id = u.id AND u.email = 'ceviz@checkrezerve.com';

-- ceviz.manager@checkrezerve.com → business_manager
UPDATE profiles p
SET role = 'business_manager'
FROM auth.users u
WHERE p.id = u.id AND u.email = 'ceviz.manager@checkrezerve.com';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. YARDIMCI FONKSİYONLAR
-- ─────────────────────────────────────────────────────────────────────────────

-- Mevcut kullanıcının rolü
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Mevcut kullanıcının bağlı olduğu restoran (isletme_id)
CREATE OR REPLACE FUNCTION get_my_restaurant_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT isletme_id FROM profiles WHERE id = auth.uid()
$$;

-- Mevcut kullanıcının telefon numarası (customer rezervasyon eşleştirmesi)
CREATE OR REPLACE FUNCTION get_my_phone()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT phone FROM profiles WHERE id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TÜM RLS POLİTİKALARINI YENİDEN YAZ
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 5a. RESTAURANTS ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "restaurants_public_read"       ON restaurants;
DROP POLICY IF EXISTS "restaurants_super_admin_write" ON restaurants;
DROP POLICY IF EXISTS "restaurants_anon_read"         ON restaurants;
DROP POLICY IF EXISTS "restaurants_super_admin_all"   ON restaurants;
DROP POLICY IF EXISTS "restaurants_owner_all"         ON restaurants;
DROP POLICY IF EXISTS "restaurants_manager_read"      ON restaurants;
DROP POLICY IF EXISTS "restaurants_public_select"     ON restaurants;
DROP POLICY IF EXISTS "restaurants_super_admin"       ON restaurants;
DROP POLICY IF EXISTS "restaurants_owner"             ON restaurants;
DROP POLICY IF EXISTS "restaurants_manager_select"    ON restaurants;

-- Anon + customer: aktif işletmeleri görür (mobil HomeScreen)
CREATE POLICY "restaurants_public_select" ON restaurants
  FOR SELECT USING (is_active = true);

-- super_admin: tam erişim
CREATE POLICY "restaurants_super_admin" ON restaurants
  FOR ALL USING (get_my_role() = 'super_admin');

-- business_owner: kendi restoranı tam yetki
CREATE POLICY "restaurants_owner" ON restaurants
  FOR ALL
  USING (get_my_role() = 'business_owner' AND id = get_my_restaurant_id())
  WITH CHECK (id = get_my_restaurant_id());

-- business_manager: kendi restoranını okur
CREATE POLICY "restaurants_manager_select" ON restaurants
  FOR SELECT USING (
    get_my_role() = 'business_manager'
    AND id = get_my_restaurant_id()
  );

-- ── 5b. RESERVATIONS ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "reservations_anon_insert"            ON reservations;
DROP POLICY IF EXISTS "reservations_customer_read_by_phone" ON reservations;
DROP POLICY IF EXISTS "reservations_super_admin_all"        ON reservations;
DROP POLICY IF EXISTS "reservations_super_admin"            ON reservations;
DROP POLICY IF EXISTS "reservations_owner"                  ON reservations;
DROP POLICY IF EXISTS "reservations_manager"                ON reservations;
DROP POLICY IF EXISTS "reservations_customer"               ON reservations;
DROP POLICY IF EXISTS "reservations_anon_select"            ON reservations;
DROP POLICY IF EXISTS "reservations_manager_select"         ON reservations;
DROP POLICY IF EXISTS "reservations_manager_insert"         ON reservations;
DROP POLICY IF EXISTS "reservations_manager_update"         ON reservations;
DROP POLICY IF EXISTS "reservations_customer_select"        ON reservations;

-- Anon: INSERT (web rezervasyon formu)
CREATE POLICY "reservations_anon_insert" ON reservations
  FOR INSERT WITH CHECK (true);

-- Anon: SELECT — mobil "Rezervasyonlarım" (güvenlik app katmanında .eq('phone',…))
CREATE POLICY "reservations_anon_select" ON reservations
  FOR SELECT USING (auth.role() = 'anon');

-- super_admin: tam erişim
CREATE POLICY "reservations_super_admin" ON reservations
  FOR ALL USING (get_my_role() = 'super_admin');

-- business_owner: kendi restoranının tüm rezervasyonları
CREATE POLICY "reservations_owner" ON reservations
  FOR ALL
  USING (get_my_role() = 'business_owner' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

-- business_manager: kendi restoranı — SELECT / INSERT / UPDATE (DELETE yok)
CREATE POLICY "reservations_manager_select" ON reservations
  FOR SELECT USING (
    get_my_role() = 'business_manager'
    AND restaurant_id = get_my_restaurant_id()
  );

CREATE POLICY "reservations_manager_insert" ON reservations
  FOR INSERT WITH CHECK (
    get_my_role() = 'business_manager'
    AND restaurant_id = get_my_restaurant_id()
  );

CREATE POLICY "reservations_manager_update" ON reservations
  FOR UPDATE
  USING (get_my_role() = 'business_manager' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

-- customer (Supabase Auth): kendi telefon numarasıyla eşleşen rezervasyonlar
CREATE POLICY "reservations_customer_select" ON reservations
  FOR SELECT USING (
    get_my_role() = 'customer'
    AND get_my_phone() IS NOT NULL
    AND (guest_phone = get_my_phone() OR phone = get_my_phone())
  );

-- ── 5c. TABLES ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tables_public_read"       ON tables;
DROP POLICY IF EXISTS "tables_super_admin_write" ON tables;
DROP POLICY IF EXISTS "tables_super_admin"       ON tables;
DROP POLICY IF EXISTS "tables_owner"             ON tables;
DROP POLICY IF EXISTS "tables_manager_select"    ON tables;
DROP POLICY IF EXISTS "tables_public_select"     ON tables;

CREATE POLICY "tables_public_select" ON tables
  FOR SELECT USING (is_active = true);

CREATE POLICY "tables_super_admin" ON tables
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "tables_owner" ON tables
  FOR ALL
  USING (get_my_role() = 'business_owner' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

CREATE POLICY "tables_manager_select" ON tables
  FOR SELECT USING (
    get_my_role() = 'business_manager'
    AND restaurant_id = get_my_restaurant_id()
  );

-- ── 5d. SMS_LOGS ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sms_logs_super_admin_only"   ON sms_logs;
DROP POLICY IF EXISTS "sms_logs_super_admin"        ON sms_logs;
DROP POLICY IF EXISTS "sms_logs_business_select"    ON sms_logs;

CREATE POLICY "sms_logs_super_admin" ON sms_logs
  FOR ALL USING (get_my_role() = 'super_admin');

-- ── 5e. RESTAURANT_USERS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "restaurant_users_service_role_only"  ON restaurant_users;
DROP POLICY IF EXISTS "restaurant_users_super_admin"        ON restaurant_users;
DROP POLICY IF EXISTS "restaurant_users_owner"              ON restaurant_users;
DROP POLICY IF EXISTS "restaurant_users_manager_select"     ON restaurant_users;

CREATE POLICY "restaurant_users_super_admin" ON restaurant_users
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "restaurant_users_owner" ON restaurant_users
  FOR ALL
  USING (get_my_role() = 'business_owner' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

CREATE POLICY "restaurant_users_manager_select" ON restaurant_users
  FOR SELECT USING (
    get_my_role() = 'business_manager'
    AND restaurant_id = get_my_restaurant_id()
  );

-- ── 5f. BRANCHES ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "branches_super_admin_only" ON branches;
DROP POLICY IF EXISTS "branches_super_admin"      ON branches;
DROP POLICY IF EXISTS "branches_owner"            ON branches;
DROP POLICY IF EXISTS "branches_manager"          ON branches;

CREATE POLICY "branches_super_admin" ON branches
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "branches_owner" ON branches
  FOR ALL
  USING (get_my_role() = 'business_owner' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

CREATE POLICY "branches_manager" ON branches
  FOR ALL
  USING (get_my_role() = 'business_manager' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

-- ── 5g. SPECIAL_AREAS ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "special_areas_super_admin_only" ON special_areas;
DROP POLICY IF EXISTS "special_areas_super_admin"      ON special_areas;
DROP POLICY IF EXISTS "special_areas_owner"            ON special_areas;
DROP POLICY IF EXISTS "special_areas_manager"          ON special_areas;

CREATE POLICY "special_areas_super_admin" ON special_areas
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "special_areas_owner" ON special_areas
  FOR ALL
  USING (get_my_role() = 'business_owner' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

CREATE POLICY "special_areas_manager" ON special_areas
  FOR ALL
  USING (get_my_role() = 'business_manager' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

-- ── 5h. EXPORT_LOGS — business_manager erişemez ──────────────────────────────
DROP POLICY IF EXISTS "export_logs_super_admin_only" ON export_logs;
DROP POLICY IF EXISTS "export_logs_super_admin"      ON export_logs;
DROP POLICY IF EXISTS "export_logs_owner"            ON export_logs;

CREATE POLICY "export_logs_super_admin" ON export_logs
  FOR ALL USING (get_my_role() = 'super_admin');

-- business_owner: kendi restoranının logları (business_manager kasıtlı hariç)
CREATE POLICY "export_logs_owner" ON export_logs
  FOR ALL
  USING (get_my_role() = 'business_owner' AND restaurant_id = get_my_restaurant_id())
  WITH CHECK (restaurant_id = get_my_restaurant_id());

-- ── 5i. AI_RESERVATIONS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ai_reservations_super_admin_only" ON ai_reservations;
DROP POLICY IF EXISTS "ai_reservations_super_admin"      ON ai_reservations;
DROP POLICY IF EXISTS "ai_reservations_owner"            ON ai_reservations;
DROP POLICY IF EXISTS "ai_reservations_manager"          ON ai_reservations;

CREATE POLICY "ai_reservations_super_admin" ON ai_reservations
  FOR ALL USING (get_my_role() = 'super_admin');

-- owner ve manager restaurant_id kolonuyla eşleştirilecek
-- ai_reservations'da restaurant_id varsa kullan, yoksa service_role üzerinden erişilir
CREATE POLICY "ai_reservations_business" ON ai_reservations
  FOR ALL USING (get_my_role() IN ('business_owner', 'business_manager'));

-- ── 5j. PROFILES ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_own_select"      ON profiles;
DROP POLICY IF EXISTS "profiles_super_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_own"             ON profiles;
DROP POLICY IF EXISTS "profiles_service"         ON profiles;
DROP POLICY IF EXISTS "profiles_own_update"      ON profiles;
DROP POLICY IF EXISTS "profiles_super_admin"     ON profiles;

-- Kullanıcı kendi profilini okur
CREATE POLICY "profiles_own_select" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Kullanıcı kendi profilini günceller (role ve isletme_id değiştirilemez)
CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles p2 WHERE p2.id = auth.uid())
    AND (isletme_id IS NOT DISTINCT FROM
         (SELECT isletme_id FROM profiles p2 WHERE p2.id = auth.uid()))
  );

-- super_admin: tam erişim
CREATE POLICY "profiles_super_admin" ON profiles
  FOR ALL USING (get_my_role() = 'super_admin');
