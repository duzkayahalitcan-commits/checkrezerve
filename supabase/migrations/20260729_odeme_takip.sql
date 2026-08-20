-- W-67: Kalan Ödeme Takibi
-- musteri_paketleri'ne odeme bilgisi ekler

ALTER TABLE musteri_paketleri
  ADD COLUMN IF NOT EXISTS odeme_durumu text DEFAULT 'odendi'
    CHECK (odeme_durumu IN ('odendi', 'bekliyor', 'taksitli')),
  ADD COLUMN IF NOT EXISTS toplam_tutar numeric(10,2),
  ADD COLUMN IF NOT EXISTS odenen_tutar numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS son_odeme_tarihi date;
