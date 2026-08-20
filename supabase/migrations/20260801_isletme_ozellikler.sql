-- ============================================================
-- W-76: İşletme Özellik Matrisi (asistan bilgi sistemi)
-- Çalıştırma: Supabase SQL Editor'de elle çalıştır.
-- İki tablo + seed verileri.
-- ============================================================

-- Tablo 1: Özellik tanımları (ortak + sektörel)
CREATE TABLE IF NOT EXISTS ozellik_tanimlari (
  id      serial PRIMARY KEY,
  kod     text UNIQUE NOT NULL,
  baslik  text NOT NULL,
  sektor  text NOT NULL,   -- 'ortak' veya business_type değeri (restaurant/hairdresser/spa/pilates/psychologist/dentist)
  sira    int  NOT NULL DEFAULT 0,
  aktif   boolean NOT NULL DEFAULT true
);

-- Tablo 2: İşletme bazlı özellik durumları
CREATE TABLE IF NOT EXISTS isletme_ozellikleri (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  -- ozellik_kodu ozellik_tanimlari'na FK DEĞİLDİR: 'genel_bilgi_*' dinamik satırlar
  -- da bu tabloda saklanır (Bölüm D — yanıtlanan sorular).
  ozellik_kodu    text NOT NULL,
  durum           text NOT NULL CHECK (durum IN ('var','yok','bilgi_al')) DEFAULT 'bilgi_al',
  notu            text,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, ozellik_kodu)
);

CREATE INDEX IF NOT EXISTS idx_isletme_ozellikleri_rest ON isletme_ozellikleri(restaurant_id);

-- RLS: yalnızca service_role (admin) erişimi
ALTER TABLE ozellik_tanimlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE isletme_ozellikleri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ozellik_tanimlari_all" ON ozellik_tanimlari USING (true);
CREATE POLICY "isletme_ozellikleri_all" ON isletme_ozellikleri USING (true);

-- ============================================================
-- SEED — Ortak çekirdek (10)
-- ============================================================
INSERT INTO ozellik_tanimlari (kod, baslik, sektor, sira) VALUES
  ('otopark',            'Otopark',            'ortak', 1),
  ('engelli_erisim',     'Engelli Erişimi',    'ortak', 2),
  ('kredi_karti',        'Kredi Kartı',        'ortak', 3),
  ('wifi',               'Wi-Fi',              'ortak', 4),
  ('evcil_hayvan',       'Evcil Hayvan',       'ortak', 5),
  ('sigara_alani',       'Sigara Alanı',       'ortak', 6),
  ('cocuk_dostu',        'Çocuk Dostu',        'ortak', 7),
  ('klima',              'Klima',              'ortak', 8),
  ('kapora',             'Kapora',             'ortak', 9),
  ('grup_rezervasyon',   'Grup Rezervasyon',   'ortak', 10)
ON CONFLICT (kod) DO NOTHING;

-- ============================================================
-- SEED — Restoran
-- ============================================================
INSERT INTO ozellik_tanimlari (kod, baslik, sektor, sira) VALUES
  ('alkol',              'Alkol',              'restaurant', 1),
  ('canli_muzik',        'Canlı Müzik',        'restaurant', 2),
  ('bahce_teras',        'Bahçe/Teras',        'restaurant', 3),
  ('vejetaryen_vegan',   'Vejetaryen/Vegan',   'restaurant', 4),
  ('glutensiz',          'Glutensiz',          'restaurant', 5),
  ('paket_servis',       'Paket Servis',       'restaurant', 6),
  ('kahvalti',           'Kahvaltı',           'restaurant', 7)
ON CONFLICT (kod) DO NOTHING;

-- ============================================================
-- SEED — Kuaför
-- ============================================================
INSERT INTO ozellik_tanimlari (kod, baslik, sektor, sira) VALUES
  ('erkek_kadin_karma',  'Erkek/Kadın Karma',  'hairdresser', 1),
  ('randevusuz',         'Randevusuz',         'hairdresser', 2),
  ('gelin_paketi',       'Gelin Paketi',       'hairdresser', 3),
  ('evde_hizmet',        'Evde Hizmet',        'hairdresser', 4)
ON CONFLICT (kod) DO NOTHING;

-- ============================================================
-- SEED — Spa
-- ============================================================
INSERT INTO ozellik_tanimlari (kod, baslik, sektor, sira) VALUES
  ('hamam',              'Hamam',              'spa', 1),
  ('sauna',              'Sauna',              'spa', 2),
  ('cift_masaji',        'Çift Masajı',        'spa', 3),
  ('cilt_bakimi',        'Cilt Bakımı',        'spa', 4)
ON CONFLICT (kod) DO NOTHING;

-- ============================================================
-- SEED — Pilates
-- ============================================================
INSERT INTO ozellik_tanimlari (kod, baslik, sektor, sira) VALUES
  ('reformer',           'Reformer',           'pilates', 1),
  ('birebir_ders',       'Birebir Ders',       'pilates', 2),
  ('deneme_dersi',       'Deneme Dersi',       'pilates', 3),
  ('soyunma_dus',        'Soyunma/Duş',        'pilates', 4)
ON CONFLICT (kod) DO NOTHING;

-- ============================================================
-- SEED — Psikolog
-- ============================================================
INSERT INTO ozellik_tanimlari (kod, baslik, sektor, sira) VALUES
  ('psikolog_online_seans',     'Online Seans',       'psychologist', 1),
  ('psikolog_cocuk_ergen',      'Çocuk/Ergen',        'psychologist', 2),
  ('psikolog_sigorta_anlasma',  'Sigorta Anlaşması',  'psychologist', 3),
  ('psikolog_dil_secenekleri',  'Dil Seçenekleri',    'psychologist', 4)
ON CONFLICT (kod) DO NOTHING;

-- ============================================================
-- SEED — Klinik
-- ============================================================
INSERT INTO ozellik_tanimlari (kod, baslik, sektor, sira) VALUES
  ('klinik_online_seans',       'Online Seans',       'dentist', 1),
  ('klinik_sigorta_anlasma',    'Sigorta Anlaşması',  'dentist', 2),
  ('klinik_dil_secenekleri',    'Dil Seçenekleri',    'dentist', 3),
  ('klinik_cocuk_ergen',        'Çocuk/Ergen',        'dentist', 4)
ON CONFLICT (kod) DO NOTHING;
