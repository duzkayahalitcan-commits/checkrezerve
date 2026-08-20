-- W-74: Bilinmeyen / cevapsız soruları işaretlemek için kolon ekle
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS is_unknown boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_conversations_unknown
  ON conversations(is_unknown, created_at DESC);
