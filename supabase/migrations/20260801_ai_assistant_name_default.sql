-- =============================================================
-- ai_assistant_name varsayılanını 'Asistan' yap
-- (Eski migration DEFAULT NULL set etmişti; isim boşsa UI/API
--  'Asistan' yerine boş görüyordu. Artık default 'Asistan'.)
-- =============================================================
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS ai_assistant_name TEXT DEFAULT 'Asistan';

-- Mevcut NULL değerleri de varsayılanla doldur (tutarlılık)
UPDATE restaurants SET ai_assistant_name = 'Asistan'
WHERE ai_assistant_name IS NULL;
