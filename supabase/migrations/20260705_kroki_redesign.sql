-- =============================================================
-- W-100: Bölge Sistemi Redesign — kart modeli + kroki_mode
-- =============================================================

-- 1. restaurants tablosuna kroki_mode kolonu
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS kroki_mode TEXT NOT NULL DEFAULT 'zones'
  CHECK (kroki_mode IN ('tables', 'zones'));

-- 2. kroki_zones formatı: koordinat alanları nullable, zorunlu name/theme/capacity
-- polygon alanı nullable yapılır (eski kayıtlar bozulmasın)
-- custom_photo_url eklenir
-- (JSONB olduğu için tablo DDL değişmez, uygulama tarafında kontrol edilir)

-- 3. Eski bölgelere theme ata (theme'siz olanlara 'ic_mekan' default)
UPDATE restaurants
SET kroki_zones = (
  SELECT jsonb_agg(
    CASE
      WHEN (zone->>'theme') IS NULL OR (zone->>'theme') = ''
      THEN zone || '{"theme": "ic_mekan"}'::jsonb
      ELSE zone
    END
  )
  FROM jsonb_array_elements(kroki_zones) AS zone
)
WHERE kroki_zones IS NOT NULL AND jsonb_array_length(kroki_zones) > 0;

-- 4. reservations tablosu: zone_id + zone_name zaten var (20260702 migration'ı)
-- Ekstra: kroki_mode bazlı rezervasyon akışı için flag
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS kroki_mode_used TEXT; -- 'tables' | 'zones' | NULL
