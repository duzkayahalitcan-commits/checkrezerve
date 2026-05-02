-- ══════════════════════════════════════════════════════════════════
-- Floor plan / masa krokisi özelliği
-- Tarih: 2026-05-02
-- ══════════════════════════════════════════════════════════════════

-- 1. İşletme bazlı kroki aktiflik bayrağı
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS floor_plan_enabled boolean NOT NULL DEFAULT false;

-- 2. Bireysel masa tanımları (koordinat + boyut + şekil)
CREATE TABLE IF NOT EXISTS tables (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  label         text        NOT NULL DEFAULT 'Masa',
  capacity      integer     NOT NULL DEFAULT 4,
  x             float8      NOT NULL DEFAULT 100,
  y             float8      NOT NULL DEFAULT 100,
  width         float8      NOT NULL DEFAULT 80,
  height        float8      NOT NULL DEFAULT 80,
  shape         text        NOT NULL DEFAULT 'rect'
                              CHECK (shape IN ('rect', 'circle')),
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables (restaurant_id);

-- 3. Rezervasyonlara spesifik masa bağlantısı
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS table_id uuid REFERENCES tables(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_table ON reservations (table_id);
