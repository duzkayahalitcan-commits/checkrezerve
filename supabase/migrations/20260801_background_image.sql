-- =============================================================
-- İşletmeye özel arka plan sistemi
-- restaurants tablosuna background_image kolonu ekler.
-- Storage bucket 'business-backgrounds' public olarak oluşturulur.
-- =============================================================

-- 1. Arka plan görseli (Supabase Storage public URL)
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS background_image text;

-- 2. Storage bucket (güvenli şekilde, varsa dokunma)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-backgrounds', 'business-backgrounds', true)
ON CONFLICT (id) DO NOTHING;
