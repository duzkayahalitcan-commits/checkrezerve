-- =============================================================================
-- Migration: Çift masa veri modelini birleştir — `masa_tipleri` kanonik
-- Tarih: 2026-08-01
--
-- STRATEJİ (SEÇENEK A — en az riskli, veri kaybı YOK):
--   `masa_tipleri` de-facto standart (kroki, müşteri rezervasyonu, floor-plan,
--   onboarding, admin, API'ler) → tek kaynak yapılır.
--   Legacy `tables` tablosuna DOKUNULMAZ: drop YOK, FK `reservations.table_id`
--   kırılmaz. Sadece OKUMA tarafı birleştirilir (panel görünümleri masa_tipleri
--   ve `reservations.masa_tipi_id` kullanır).
--
-- NEDEN BLIND ID EŞLEMESİ YAPILMADI:
--   `tables.id` ve `masa_tipleri.id` iki bağımsız tablonun ayrı üretilmiş
--   UUID'leridir; birebir karşılık YOKTUR. `SET masa_tipi_id = table_id`
--   yanlış/saçma eşlemeler üretir. Bunun yerine deterministik ve güvenli olan
--   (işletme + ad) anahtarı kullanılır — `masa_tipleri` üzerinde
--   `UNIQUE (isletme_id, ad)` kısıtı mevcuttur, yani aynı işletmede ad benzersizdir.
--
-- Güvenlik: yalnızca NULL `masa_tipi_id` değerleri doldurulur; `table_id`
--   asla değiştirilmez/silinmez; operasyon geri alınabilir (NULL'a dönülebilir).
-- =============================================================================

-- ── 1. Geri doldurma (backfill) ─────────────────────────────────────────────
-- `reservations.table_id` dolu ama `masa_tipi_id` NULL olan kayıtları,
-- aynı işletmede aynı ada sahip `masa_tipleri` satırına bağla.
-- Sadece NULL değerleri doldurur; table_id'ye dokunmaz; veri kaybı yoktur.
UPDATE reservations r
SET masa_tipi_id = mt.id
FROM tables t
JOIN masa_tipleri mt
  ON mt.isletme_id = t.restaurant_id
 AND mt.ad = t.label
WHERE r.table_id = t.id
  AND r.masa_tipi_id IS NULL;

-- ── 2. Masa tipi bazlı okuma için dizin ─────────────────────────────────────
-- Panel görünümleri artık `reservations.masa_tipi_id` üzerinden eşleşir;
-- bu sık sorgulanan filtre için performans dizini ekle. Zaten varsa no-op.
CREATE INDEX IF NOT EXISTS idx_reservations_masa_tipi_id
  ON reservations (masa_tipi_id)
  WHERE masa_tipi_id IS NOT NULL;

-- ── Notlar ───────────────────────────────────────────────────────────────────
-- * `tables` tablosu bilinçli olarak yerinde bırakılır (drop yok).
-- * `reservations.table_id` → `tables.id` FK'si bozulmaz; mevcut legacy veri
--   korunur. Yeni yazımlar `masa_tipi_id` kullanır; `table_id` NULL kalır.
-- * Gelecekte (veri doğrulandıktan sonra) `tables` ve `table_id` ayrı bir
--   migration'da kaldırılabilir; bu migration bilinçli olarak bunu yapmaz.
