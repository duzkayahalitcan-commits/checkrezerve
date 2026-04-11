-- =============================================================================
-- Migration: RBAC + Özel Alanlar (Cam Kenarı vb.)
-- Tarih: 2026-04-10
-- =============================================================================

-- ─── 1. Restoran Yetkilileri ─────────────────────────────────────────────────
-- Her restoran için ayrı yönetici/çalışan hesabı
CREATE TABLE IF NOT EXISTS restaurant_users (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID    NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  username      TEXT    NOT NULL UNIQUE,
  -- SHA-256(password + ':' + ADMIN_SECRET) hex digest
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'manager'
                CHECK (role IN ('manager', 'staff')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS restaurant_users_restaurant_idx
  ON restaurant_users(restaurant_id);

COMMENT ON TABLE restaurant_users IS
  'Restoran paneline giriş yapabilen yönetici/çalışan hesapları';

-- ─── 2. Özel Alanlar ──────────────────────────────────────────────────────────
-- "Cam Kenarı", "VIP Salon", "Bahçe" gibi ayrı takip edilecek alanlar
CREATE TABLE IF NOT EXISTS special_areas (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID    NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT    NOT NULL,        -- "Cam Kenarı"
  capacity      INTEGER NOT NULL DEFAULT 10,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS special_areas_restaurant_idx
  ON special_areas(restaurant_id);

COMMENT ON TABLE special_areas IS
  'Restoran içindeki özel alanlar (Cam Kenarı, VIP vb.) ve kapasiteleri';

-- ─── 3. Rezervasyonlara Alan Bağlantısı ─────────────────────────────────────
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS special_area_id UUID
  REFERENCES special_areas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reservations_special_area_idx
  ON reservations(special_area_id);

-- ─── 4. Export Log (haftalık ihracat takibi) ─────────────────────────────────
-- Restoran kullanıcılarının export geçmişi — denetim izi
CREATE TABLE IF NOT EXISTS export_logs (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_user_id UUID   REFERENCES restaurant_users(id) ON DELETE SET NULL,
  restaurant_id     UUID    NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  export_type       TEXT    NOT NULL DEFAULT 'weekly_csv'
                    CHECK (export_type IN ('weekly_csv')),
  week_start        DATE    NOT NULL,   -- pazartesi tarihi
  week_end          DATE    NOT NULL,   -- pazar tarihi
  row_count         INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS export_logs_restaurant_idx
  ON export_logs(restaurant_id, created_at DESC);
