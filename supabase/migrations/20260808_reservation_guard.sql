-- ============================================================
-- S2-T1: Temporal Reservation Guard — DB fonksiyonu (I1/I2)
-- Zaman çakışması VE masa kapasitesi kontrolünü tek fonksiyonda
-- yapar. /api/rezervasyon ve /api/ai-reserve gibi kayıt
-- noktaları bu fonksiyonu çağırır.
--
-- NOT: Reservations tablosundaki gerçek kolon adları kullanıldı:
--   reserved_date (date), reserved_time (time), party_size (int),
--   table_id (uuid), duration_minutes (int), status (text)
-- ============================================================

CREATE OR REPLACE FUNCTION check_reservation_availability(
  p_restaurant_id UUID,
  p_table_id      UUID,
  p_date          DATE,
  p_time          TIME,
  p_duration      INTEGER,   -- dakika; varsayılan: işletme booking_duration_minutes
  p_party_size    INTEGER,
  p_exclude_id    UUID DEFAULT NULL  -- düzenleme için mevcut rezervasyon ID'si
) RETURNS JSONB AS $$
DECLARE
  v_capacity  INTEGER;
  v_conflicts INTEGER;
  v_eff_dur   INTEGER;
BEGIN
  -- 0. Masa verilmediyse zaman çakışması kontrolü yapılamaz (masa bazlı)
  IF p_table_id IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'message', 'Masa seçilmedi — kapasite/çakışma kontrolü atlandı');
  END IF;

  -- 1. Masa kapasitesi kontrolü
  SELECT capacity INTO v_capacity FROM tables WHERE id = p_table_id;
  IF v_capacity IS NOT NULL AND p_party_size > v_capacity THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'capacity',
      'message', format('%s kişi için masa kapasitesi yetersiz (max %s)', p_party_size, v_capacity));
  END IF;

  -- 2. Etkin süre: p_duration verilmediyse işletme varsayılanı
  SELECT COALESCE(p_duration, booking_duration_minutes) INTO v_eff_dur
  FROM restaurants WHERE id = p_restaurant_id;
  IF v_eff_dur IS NULL OR v_eff_dur <= 0 THEN v_eff_dur := 60; END IF;

  -- 3. Zaman çakışması kontrolü (aynı masa, aynı gün, aktif kayıtlar)
  SELECT COUNT(*) INTO v_conflicts
  FROM reservations
  WHERE restaurant_id  = p_restaurant_id
    AND table_id       = p_table_id
    AND reserved_date  = p_date
    AND status NOT IN ('cancelled', 'completed')
    AND (p_exclude_id IS NULL OR id <> p_exclude_id)
    AND (
      (reserved_time, reserved_time + (COALESCE(duration_minutes, v_eff_dur) || ' minutes')::interval)
      OVERLAPS
      (p_time, p_time + (v_eff_dur || ' minutes')::interval)
    );

  IF v_conflicts > 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'conflict',
      'message', 'Seçilen saat aralığında masa dolu');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
