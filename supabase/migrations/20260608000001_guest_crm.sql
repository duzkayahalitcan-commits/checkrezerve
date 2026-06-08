-- Guest CRM: Müşteri profilleri ve segmentasyon
-- 20260608000001

-- 1. Guests tablosu — müşteri profilleri
CREATE TABLE IF NOT EXISTS guests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  notes           TEXT,
  total_visits    INTEGER DEFAULT 0,
  total_spent     NUMERIC(10,2) DEFAULT 0,
  last_visit_date DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guests_restaurant ON guests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(restaurant_id, phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_restaurant_phone ON guests(restaurant_id, phone) WHERE phone IS NOT NULL;

-- 2. Guest tags tablosu — VIP, Blacklist, Big Spender vb.
CREATE TABLE IF NOT EXISTS guest_tags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  color           TEXT NOT NULL DEFAULT '#F59E0B',
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_guest_tags_restaurant ON guest_tags(restaurant_id);

-- 3. Guest <-> Tag ilişkisi
CREATE TABLE IF NOT EXISTS guest_tag_assignments (
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES guest_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (guest_id, tag_id)
);

-- 4. Reservations tablosuna guest_id ekle (optional)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guests(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_guest ON reservations(guest_id);

-- 5. Guest activities log
CREATE TABLE IF NOT EXISTS guest_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id        UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL, -- 'reservation','cancellation','note','tag_change','payment'
  description     TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_activities_guest ON guest_activities(guest_id);

-- RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guests_owner_all" ON guests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()
      AND (role = 'super_admin' OR (role IN ('business_owner','business_manager') AND isletme_id = guests.restaurant_id)))
  );

CREATE POLICY "guests_anon_select" ON guests
  FOR SELECT USING (true);

CREATE POLICY "guest_tags_owner_all" ON guest_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()
      AND (role = 'super_admin' OR (role IN ('business_owner','business_manager') AND isletme_id = guest_tags.restaurant_id)))
  );

CREATE POLICY "guest_tag_assignments_owner_all" ON guest_tag_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM guest_tags WHERE id = guest_tag_assignments.tag_id)
  );

CREATE POLICY "guest_activities_owner_all" ON guest_activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM guests WHERE id = guest_activities.guest_id)
  );
