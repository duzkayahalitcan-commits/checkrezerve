-- W-70: Mevcut "Bölge X" zone isimlerini tema adina gore duzelt
-- Kodda yeni zone olusturma artik "İç Mekan" gibi tema bazli isim kullaniyor
-- Bu migration mevcut "Bölge 1", "Bölge 2" kayitlarini temizler

DO $$
DECLARE
  r RECORD;
  z JSONB;
  zones_arr JSONB;
  updated_zones JSONB;
  zone_name TEXT;
  theme TEXT;
  new_name TEXT;
  fixed_count INT := 0;
BEGIN
  FOR r IN
    SELECT id, name, kroki_zones FROM restaurants
    WHERE kroki_zones IS NOT NULL AND jsonb_typeof(kroki_zones) = 'array'
  LOOP
    zones_arr := r.kroki_zones;
    updated_zones := '[]'::JSONB;

    FOR z IN SELECT * FROM jsonb_array_elements(zones_arr)
    LOOP
      zone_name := z->>'name';
      theme := z->>'theme';

      -- "Bölge 1", "Bölge 2" vs. kontrol et
      IF zone_name ~ '^Bölge \d+$' THEN
        new_name := CASE theme
          WHEN 'ic_mekan'  THEN 'İç Mekan'
          WHEN 'bahce'     THEN 'Bahçe'
          WHEN 'teras'     THEN 'Teras'
          WHEN 'teras_alt' THEN 'Teras (Alt)'
          WHEN 'sokak'     THEN 'Sokak'
          ELSE zone_name
        END;
        z := z || jsonb_build_object('name', new_name);
        fixed_count := fixed_count + 1;
      END IF;

      updated_zones := updated_zones || z;
    END LOOP;

    UPDATE restaurants SET kroki_zones = updated_zones WHERE id = r.id;
  END LOOP;

  RAISE NOTICE 'Fixed % zone names', fixed_count;
END $$;
