-- Floor plan tabloları
CREATE TABLE IF NOT EXISTS tables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  capacity      INTEGER NOT NULL DEFAULT 4,
  area_id       UUID REFERENCES special_areas(id) ON DELETE SET NULL,
  x             NUMERIC DEFAULT 0,
  y             NUMERIC DEFAULT 0,
  width         NUMERIC DEFAULT 80,
  height        NUMERIC DEFAULT 80,
  shape         TEXT NOT NULL DEFAULT 'rect' CHECK (shape IN ('rect', 'circle')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_area ON tables(area_id);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tables_owner_all" ON tables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'super_admin' OR (role IN ('isletme_admin','isletme_calisan') AND isletme_id = tables.restaurant_id))
    )
  );

-- reservations tablosuna table_id ekle (zaten yoksa)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES tables(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_table ON reservations(table_id);
