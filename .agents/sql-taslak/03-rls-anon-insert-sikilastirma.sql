-- =============================================================================
-- 03 — RLS: anon rezervasyon insert'ini sıkılaştır + çalışan PII kolonlarını kapat
-- Hazırlayan: gece görevi G7 (2026-09-23) — UYGULANMADI, Halitcan çalıştıracak
--
-- DURUM (pg_policies SELECT, 2026-09-23):
--   reservations_anon_insert : INSERT, roles {public}, WITH CHECK (true)
--     → anon key'i bilen herkes (key istemcide açık) API'yi (rate-limit, müsaitlik guard'ı)
--       atlayıp herhangi bir işletmeye, herhangi bir status ile ('confirmed' dahil),
--       herhangi bir saate doğrudan rezervasyon yazabilir.
--   calisanlar_public_read / anon_read_calisanlar : SELECT (aktif = true), TÜM kolonlar
--     → telefon ve email kolonları da herkese açık. Şu an 10 aktif çalışanda ikisi de BOŞ
--       (risk gizil), panelden doldurulduğu anda KVKK sızıntısı olur.
--
-- ⚠ ÖNCE KONTROL ET: mobil uygulama (checkrezerve-app) rezervasyonu anon/authenticated
--   client ile doğrudan insert ediyor mu, ve hangi status ile? (mobil `hizmet_id` yazıyor,
--   web API `service_id` — mobil büyük olasılıkla doğrudan insert yapıyor.)
--   Mobil 'pending' dışında status yazıyorsa ADIM 1 mobil rezervasyonu KIRAR.
--   Mobil repoda: grep -rn "from('reservations')" -A5 | grep -E "insert|status"
--
-- RİSK: ADIM 1 orta (mobil akışa bağlı), ADIM 2 düşük-orta (istemci tarafında calisanlar'dan
--   telefon/email okuyan ekran varsa boş gelir; web'de panel yazmaları admin client ile).
--
-- GERİ DÖNÜŞ: dosyanın sonunda.
-- =============================================================================

-- ── ADIM 1 — anon insert: sadece 'pending', sadece aktif işletmeye ──────────────
BEGIN;
DROP POLICY IF EXISTS reservations_anon_insert ON public.reservations;
CREATE POLICY reservations_anon_insert ON public.reservations
  FOR INSERT TO public
  WITH CHECK (
    status = 'pending'
    AND EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id)
  );
COMMIT;

-- ── ADIM 2 — çalışan telefon/email'i anon ve authenticated'a kapat ────────────
-- (service_role etkilenmez; web panel getSupabaseAdmin ile okuyor/yazıyor)
-- REVOKE SELECT (telefon, email) ON public.calisanlar FROM anon, authenticated;
-- NOT: Supabase'de tablo seviyesinde GRANT SELECT varsa kolon REVOKE tek başına yetmez;
-- o durumda: REVOKE SELECT ON public.calisanlar FROM anon, authenticated;
--            GRANT SELECT (id, restaurant_id, ad, soyad, uzmanlik, foto_url, aktif, pozisyon, created_at)
--              ON public.calisanlar TO anon, authenticated;
-- Bu yüzden ADIM 2 yorumda bırakıldı — Halitcan mobilde calisanlar'dan hangi kolonların
-- okunduğunu kontrol ettikten sonra açsın.

-- ── DOĞRULAMA ────────────────────────────────────────────────────────────────
SELECT policyname, cmd, with_check FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'reservations' AND policyname = 'reservations_anon_insert';
-- Beklenen with_check: ((status = 'pending'::text) AND (EXISTS ...))

-- ── GERİ DÖNÜŞ (ADIM 1) ──────────────────────────────────────────────────────
-- DROP POLICY IF EXISTS reservations_anon_insert ON public.reservations;
-- CREATE POLICY reservations_anon_insert ON public.reservations FOR INSERT TO public WITH CHECK (true);
