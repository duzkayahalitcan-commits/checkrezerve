-- KVKK başvuruları tablosu
CREATE TABLE IF NOT EXISTS kvkk_applications (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now(),
  ad_soyad        text NOT NULL,
  tc_kimlik       text,
  yabanci_kimlik  text,
  telefon         text,
  eposta          text,
  adres           text,
  sirket_iliskisi text,
  calisilan_yillar text,
  calisan_firma   text,
  birim           text,
  konu            text,
  talep_detayi    text NOT NULL,
  yanit_yontemi   text,
  durum           text DEFAULT 'beklemede'
);

ALTER TABLE kvkk_applications ENABLE ROW LEVEL SECURITY;

-- Herkes başvuru ekleyebilir; okuma yalnızca service role ile
CREATE POLICY "insert_kvkk" ON kvkk_applications
  FOR INSERT WITH CHECK (true);
