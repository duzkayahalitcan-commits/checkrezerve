-- W-69: Paket Bitiş Otomatik Hatırlatma
-- musteri_paketleri'ne hatirlatma takibi ekler
-- View: kalan_seansi <= 2 ve > 0 olan paketler

ALTER TABLE musteri_paketleri
  ADD COLUMN IF NOT EXISTS hatirlatma_gonderildi boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hatirlatma_tarihi timestamptz;

CREATE OR REPLACE VIEW bitmek_uzere_paketler AS
SELECT
  mp.id,
  mp.musteri_id,
  mp.paket_id,
  (mp.toplam_seans - mp.kullanilan_seans) as kalan_seans,
  p.ad as paket_adi,
  pr.email as musteri_email,
  r.id as restaurant_id,
  r.name as isletme_adi,
  mp.hatirlatma_gonderildi
FROM musteri_paketleri mp
JOIN paketler p ON mp.paket_id = p.id
JOIN profiles pr ON mp.musteri_id = pr.id
JOIN restaurants r ON p.restaurant_id = r.id
WHERE (mp.toplam_seans - mp.kullanilan_seans) <= 2
  AND (mp.toplam_seans - mp.kullanilan_seans) > 0
  AND mp.hatirlatma_gonderildi = false
  AND mp.aktif = true;
