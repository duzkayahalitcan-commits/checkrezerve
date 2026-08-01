-- ============================================================
-- S1-T1: reservations RLS düzelt (KRİTİK — G1)
-- Sorun: anon key bilen herkes tüm rezervasyonları okuyabiliyordu
--   (POLICY "reservations_anon_select" USING (auth.role() = 'anon')).
-- Çözüm: anon'un tüm rezervasyonları okuması kapatıldı. Sadece
--   oturum sahibinin telefonuna ait rezervasyonlar okunabilir.
--   (Mobil "Rezervasyonlarım" telefon eşleşmesiyle app katmanında
--   daraltılıyor; burada da telefon eşleşmesi zorunlu tutuldu.)
-- ============================================================

-- Eski, herkese açık anon SELECT politikasını kaldır
DROP POLICY IF EXISTS "reservations_anon_select"            ON reservations;
DROP POLICY IF EXISTS "reservations_customer_read_by_phone" ON reservations;

-- Yeni: yalnızca kendi telefonuna ait rezervasyonları oku
CREATE POLICY "reservations_customer_read_by_phone"
  ON reservations FOR SELECT
  USING (phone = get_my_phone());
