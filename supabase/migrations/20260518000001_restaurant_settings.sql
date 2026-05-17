ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS working_hours     JSONB    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS closed_dates      TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prepayment_amount INTEGER  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dress_code        TEXT,
  ADD COLUMN IF NOT EXISTS special_notes     TEXT;
