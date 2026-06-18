-- Floor plan: rotation & color support
-- Adds rotation to tables and area color labels

ALTER TABLE tables ADD COLUMN IF NOT EXISTS rotation INTEGER NOT NULL DEFAULT 0
  CHECK (rotation IN (0, 90, 180, 270));

ALTER TABLE special_areas ADD COLUMN IF NOT EXISTS color TEXT;

COMMENT ON COLUMN tables.rotation IS '0/90/180/270 derece dönüş';
COMMENT ON COLUMN special_areas.color IS 'Alan rengi (hex): #3B82F6=mavi #22C55E=yeşil #F97316=turuncu #6B7280=gri';
