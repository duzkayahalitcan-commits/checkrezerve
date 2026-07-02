-- =============================================================
-- Bölge (Zone) Sistemi — Yeni bağımsız yapı
-- Tarih: 2026-07-02
-- =============================================================

-- 1. restaurants tablosuna kroki_zones kolonu
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS kroki_zones JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Format:
-- [
--   {
--     "id":         "uuid-string",
--     "name":       "Bahçe",
--     "color":      "#FF5733",
--     "capacity":   20,
--     "tableCount": 6,
--     "theme":      "bahce",          -- ic_mekan | bahce | teras | teras_alt | sokak
--     "polygon":    [{"x": 0.1, "y": 0.2}, ...]   -- normalize 0-1 arası
--   }
-- ]

-- 2. reservations tablosuna zone bilgisi
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS zone_id   TEXT;

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS zone_name TEXT;

-- 3. İndeks (zone bazlı sorgu için)
CREATE INDEX IF NOT EXISTS idx_reservations_zone_id
  ON reservations (zone_id)
  WHERE zone_id IS NOT NULL;
