-- Konuşma kayıt tablosu
-- Sesli/yazılı chatbot konuşmalarını loglamak için
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  session_id text NOT NULL DEFAULT '',
  turn_number int NOT NULL DEFAULT 1,
  channel text NOT NULL CHECK (channel IN ('web_voice','web_chat','app_chat','app_voice')) DEFAULT 'web_chat',
  user_message text NOT NULL DEFAULT '',
  assistant_response text NOT NULL DEFAULT '',
  response_source text NOT NULL CHECK (response_source IN ('cache','concat','ai')) DEFAULT 'ai',
  voice_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_restaurant ON conversations(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_source ON conversations(response_source, restaurant_id);

-- RLS (admin-only access via service_role)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_admin_all" ON conversations USING (true);
