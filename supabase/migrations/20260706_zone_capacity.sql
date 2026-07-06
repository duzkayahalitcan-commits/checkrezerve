-- =============================================================
-- W-100: Müşteri tarafı bölge bazlı müsaitlik kontrolü
-- Zone ID'yi reservations'a kaydet, kapasite kontrolü yap
-- =============================================================

-- 1. reservations tablosuna zone_id ekle (zaten varsa tekrar ekleme)
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS zone_id TEXT;

-- 2. zone_id indeksi (zone bazlı sorgu hızlandırma)
CREATE INDEX IF NOT EXISTS idx_reservations_zone_id
  ON reservations (zone_id)
  WHERE zone_id IS NOT NULL;

-- 3. reservations tablosuna zone_name ekle (opsiyonel, kartta göstermek için)
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS zone_name TEXT;
