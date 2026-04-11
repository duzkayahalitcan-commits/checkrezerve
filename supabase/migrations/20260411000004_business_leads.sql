-- business_leads: Sisteme katılmak isteyen işletmelerin ön kayıt tablosu
CREATE TABLE IF NOT EXISTS business_leads (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,                          -- yetkili adı
  phone               text,
  email               text,
  category            text NOT NULL,                         -- firma türü (BusinessType)
  payment_model       text NOT NULL CHECK (payment_model IN ('prepaid', 'free')),
  daily_avg_bookings  integer NOT NULL CHECK (daily_avg_bookings > 0),
  status              text NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'contacted', 'onboarded', 'rejected')),
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE business_leads ENABLE ROW LEVEL SECURITY;

-- Sadece admin okuyabilir
CREATE POLICY "admin_read_leads" ON business_leads
  FOR SELECT USING (false);   -- service role key RLS'i bypass eder

-- Herkes kayıt ekleyebilir (ön kayıt formu)
CREATE POLICY "insert_lead" ON business_leads
  FOR INSERT WITH CHECK (true);
