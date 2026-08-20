-- =============================================================
-- Ses seçimi özelliği: restaurants tablosuna ses kolonları
-- voice_id: seçili ElevenLabs sesi ('yunus' | 'mert' | 'lisa' | 'gulsu')
-- voice_changed_at: son ses değişikliği zamanı (24s kilit için)
-- =============================================================

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS voice_id text;

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS voice_changed_at timestamptz;
