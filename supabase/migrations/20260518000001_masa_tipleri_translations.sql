-- masa_tipleri tablosuna çok dilli isim kolonları ekleniyor (7 dil)
ALTER TABLE masa_tipleri
  ADD COLUMN IF NOT EXISTS ad_en TEXT,
  ADD COLUMN IF NOT EXISTS ad_ar TEXT,
  ADD COLUMN IF NOT EXISTS ad_de TEXT,
  ADD COLUMN IF NOT EXISTS ad_da TEXT,
  ADD COLUMN IF NOT EXISTS ad_es TEXT,
  ADD COLUMN IF NOT EXISTS ad_ru TEXT;
