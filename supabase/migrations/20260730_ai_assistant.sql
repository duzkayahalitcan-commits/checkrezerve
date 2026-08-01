-- AI Sesli Asistan (W-XX)
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS ai_assistant_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_assistant_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_assistant_voice text DEFAULT NULL;
