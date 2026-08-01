-- =============================================================
-- S3-T5: Sprint 3 — Composite Index'ler
-- Panel listeleme, dashboard sayaçları ve rapor sorgularındaki
-- seq scan'leri index scan'e çevirmek.
-- IF NOT EXISTS içerir, DROP yok (geri alınamaz yapı değil).
-- =============================================================

-- ── reservations: panel dashboard sayaçları (restaurant + tarih + durum) ──
-- panel/[slug]/page.tsx: .eq('restaurant_id').eq('date', today).neq('status', ...)
-- admin/restaurants/[id]: .eq('restaurant_id').order('created_at', {desc}).limit(10)
CREATE INDEX IF NOT EXISTS idx_reservations_rest_date_status
  ON reservations (restaurant_id, reserved_date, status);

CREATE INDEX IF NOT EXISTS idx_reservations_rest_created
  ON reservations (restaurant_id, created_at DESC);

-- Müşteri tarafı müsaitlik sorguları .eq('date', today) kullanıyor (multi_sector date kolonu)
CREATE INDEX IF NOT EXISTS idx_reservations_rest_date_col_status
  ON reservations (restaurant_id, date, status);

-- ── masa_tipleri: panel kroki + rezervasyon akışı (isletme + aktif) ──
CREATE INDEX IF NOT EXISTS idx_masa_tipleri_isletme_aktif
  ON masa_tipleri (isletme_id, aktif);

-- ── hizmetler / calisanlar: panel + public listeler (restaurant + aktif) ──
CREATE INDEX IF NOT EXISTS idx_hizmetler_restaurant_aktif
  ON hizmetler (restaurant_id, aktif);

CREATE INDEX IF NOT EXISTS idx_calisanlar_restaurant_aktif
  ON calisanlar (restaurant_id, aktif);

-- ── musteri_paketleri: müşteri kendi paketlerini listeler (musteri + aktif) ──
CREATE INDEX IF NOT EXISTS idx_musteri_paketleri_musteri_aktif
  ON musteri_paketleri (musteri_id, aktif);

-- ── guests: misafirler paneli en çok ziyarete göre listeler ──
CREATE INDEX IF NOT EXISTS idx_guests_restaurant_visits
  ON guests (restaurant_id, total_visits DESC);

-- ── push_subscriptions: user bazlı sorgular (mevcut tekli index'in tamamlayıcısı) ──
CREATE INDEX IF NOT EXISTS idx_push_subs_user_created
  ON push_subscriptions (user_id, created_at DESC);
