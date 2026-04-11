-- ══════════════════════════════════════════════════════════════════
-- Multi-sector support: restoran, berber, kuaför, psikolog, spa …
-- ══════════════════════════════════════════════════════════════════

-- 1. İş yeri türü enum
DO $$ BEGIN
  CREATE TYPE business_type AS ENUM (
    'restaurant',
    'barber',
    'hairdresser',
    'psychologist',
    'spa',
    'beauty_salon',
    'dentist',
    'fitness',
    'veterinary',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. restaurants tablosuna çok sektörlü alanlar ekle
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS business_type   business_type NOT NULL DEFAULT 'restaurant',
  ADD COLUMN IF NOT EXISTS timezone        text          NOT NULL DEFAULT 'Europe/Istanbul',
  ADD COLUMN IF NOT EXISTS booking_duration_minutes int NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS currency        text          NOT NULL DEFAULT 'TRY',
  ADD COLUMN IF NOT EXISTS description     text,
  ADD COLUMN IF NOT EXISTS website         text,
  ADD COLUMN IF NOT EXISTS instagram       text,
  ADD COLUMN IF NOT EXISTS is_active       boolean       NOT NULL DEFAULT true;

-- 3. Hizmetler tablosu (berber: "Saç Kesimi", psikolog: "Bireysel Seans" vb.)
CREATE TABLE IF NOT EXISTS services (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  description     text,
  duration_minutes int        NOT NULL DEFAULT 60,
  price           numeric(10,2),
  currency        text        NOT NULL DEFAULT 'TRY',
  is_active       boolean     NOT NULL DEFAULT true,
  sort_order      int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 4. Personel tablosu (berber: Ali Usta, psikolog: Dr. Ayşe vb.)
CREATE TABLE IF NOT EXISTS staff (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  title           text,
  bio             text,
  avatar_url      text,
  is_active       boolean     NOT NULL DEFAULT true,
  sort_order      int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 5. reservations tablosuna hizmet/personel bağlantısı ekle
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS service_id       uuid REFERENCES services(id),
  ADD COLUMN IF NOT EXISTS staff_id         uuid REFERENCES staff(id),
  ADD COLUMN IF NOT EXISTS duration_minutes int,
  ADD COLUMN IF NOT EXISTS end_time         text,  -- HH:MM
  ADD COLUMN IF NOT EXISTS price_paid       numeric(10,2),
  ADD COLUMN IF NOT EXISTS currency         text DEFAULT 'TRY',
  ADD COLUMN IF NOT EXISTS reminder_sent    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes            text;

-- 6. Index'ler
CREATE INDEX IF NOT EXISTS idx_services_restaurant ON services(restaurant_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_staff_restaurant    ON staff(restaurant_id)    WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_type    ON restaurants(business_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_active  ON restaurants(is_active)  WHERE is_active = true;

-- 7. RLS politikaları
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read services" ON services;
DROP POLICY IF EXISTS "Public read staff"    ON staff;

CREATE POLICY "Public read services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read staff"    ON staff    FOR SELECT USING (is_active = true);

-- 8. Mevcut restoranlar için varsayılan hizmet oluştur
-- (geriye dönük uyumluluk: masa rezervasyonu default hizmet)
INSERT INTO services (restaurant_id, name, duration_minutes, sort_order)
SELECT id, 'Masa Rezervasyonu', 120, 0
FROM restaurants
WHERE business_type = 'restaurant'
ON CONFLICT DO NOTHING;
