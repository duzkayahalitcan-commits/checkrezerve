-- W-61: Pilates Paket & Kalan Seans Sistemi
-- isletmelerin satacagi paketler (10 seanslik pilates paketi gibi)

CREATE TABLE IF NOT EXISTS paketler (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  ad              TEXT NOT NULL,
  seans_sayisi    INTEGER NOT NULL CHECK (seans_sayisi > 0),
  gecerlilik_gun  INTEGER NOT NULL CHECK (gecerlilik_gun > 0),
  fiyat           DECIMAL(10,2),
  hizmet_id       UUID REFERENCES hizmetler(id) ON DELETE SET NULL,
  aktif           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paketler_restaurant ON paketler(restaurant_id);

-- musterinin satin aldigi / atanan paket kaydi
CREATE TABLE IF NOT EXISTS musteri_paketleri (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  paket_id        UUID NOT NULL REFERENCES paketler(id) ON DELETE CASCADE,
  musteri_adi     TEXT NOT NULL,
  musteri_telefon TEXT,
  toplam_seans    INTEGER NOT NULL CHECK (toplam_seans > 0),
  kalan_seans     INTEGER NOT NULL CHECK (kalan_seans >= 0),
  baslangic_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
  bitis_tarihi    DATE,
  durum           TEXT NOT NULL DEFAULT 'aktif' CHECK (durum IN ('aktif', 'bitti', 'iptal')),
  calisan_id      UUID REFERENCES calisanlar(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_musteri_paketleri_restaurant ON musteri_paketleri(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_musteri_paketleri_durum ON musteri_paketleri(durum);
CREATE INDEX IF NOT EXISTS idx_musteri_paketleri_calisan ON musteri_paketleri(calisan_id);

-- reservations tablosuna paket baglantisi
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS musteri_paket_id UUID REFERENCES musteri_paketleri(id) ON DELETE SET NULL;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS seans_dusuldu BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_reservations_musteri_paket ON reservations(musteri_paket_id);
