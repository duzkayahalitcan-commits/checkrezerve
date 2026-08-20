-- ============================================================
-- GÜVENLİK FİX: ORTA/DÜŞÜK RLS bulguları
--  1) isletme_ozellikleri  — anon public ALL idi -> kapat, sadece
--     owner/manager/super_admin kendi isletmesine erişebilir.
--     (public sayfalarda gösterilmiyor; tüm okumalar server-side)
--  2) masa_tipleri        — anon public ALL (okuma+YAZMA) idi ->
--     yazma kaldırıldı; public yalnızca SELECT (aktif), yazma
--     authenticated owner/manager (isletme_id) + super_admin.
--  3) ozellik_tanimlari   — statik genel katalog, hassas değil ->
--     public SELECT korunur, WRITE yalnızca super_admin.
-- ============================================================

-- ── 1) isletme_ozellikleri ────────────────────────────────────
DROP POLICY IF EXISTS isletme_ozellikleri_all ON public.isletme_ozellikleri;

-- super_admin: tam erişim
CREATE POLICY isletme_ozellikleri_super_admin ON public.isletme_ozellikleri
  FOR ALL
  TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

-- owner/manager: yalnızca kendi isletmesinin özellikleri
CREATE POLICY isletme_ozellikleri_owner ON public.isletme_ozellikleri
  FOR ALL
  TO authenticated
  USING (
    get_my_role() IN ('business_owner', 'business_manager')
    AND restaurant_id = get_my_restaurant_id()
  )
  WITH CHECK (
    get_my_role() IN ('business_owner', 'business_manager')
    AND restaurant_id = get_my_restaurant_id()
  );

-- ── 2) masa_tipleri ───────────────────────────────────────────
DROP POLICY IF EXISTS "service role all" ON public.masa_tipleri;

-- super_admin: tam erişim
CREATE POLICY masa_tipleri_super_admin ON public.masa_tipleri
  FOR ALL
  TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

-- owner/manager: yalnızca kendi isletmesi (isletme_id kolonu)
CREATE POLICY masa_tipleri_owner ON public.masa_tipleri
  FOR ALL
  TO authenticated
  USING (
    get_my_role() IN ('business_owner', 'business_manager')
    AND isletme_id = get_my_restaurant_id()
  )
  WITH CHECK (
    get_my_role() IN ('business_owner', 'business_manager')
    AND isletme_id = get_my_restaurant_id()
  );

-- public: yalnızca SELECT (aktif masalar) — floor plan / rezervasyon akışı
-- (mevcut 'public read aktif' policy'si zaten SELECT aktif=true veriyor;
--  yazma yok)

-- ── 3) ozellik_tanimlari ──────────────────────────────────────
DROP POLICY IF EXISTS ozellik_tanimlari_all ON public.ozellik_tanimlari;

-- public: yalnızca SELECT (statik genel katalog — hassas değil)
CREATE POLICY ozellik_tanimlari_public_select ON public.ozellik_tanimlari
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- super_admin: yazma/tam erişim (katalog yönetimi)
CREATE POLICY ozellik_tanimlari_super_admin ON public.ozellik_tanimlari
  FOR ALL
  TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');
