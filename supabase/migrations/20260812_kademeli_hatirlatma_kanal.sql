-- ============================================================
-- KADEMELİ SEANS HATIRLATMA + KANAL TERCİHİ (ONAYLANDI)
-- BOLUM 1: JSONB eşik takibi
-- BOLUM 2: iki katmanlı kanal tercihi
-- ============================================================

-- ── BÖLÜM 1: Kademeli eşik takibi ────────────────────────────
ALTER TABLE public.musteri_paketleri
  ADD COLUMN IF NOT EXISTS hatirlatma_gonderilen_esikler jsonb DEFAULT '{}'::jsonb;

-- Yeni view: kalan seans 0..3, aktif. business_type + telefon + email.
-- Müşteri email'i auth.users'tan gelir (profiles'ta email yok).
DROP VIEW IF EXISTS bitmek_uzere_paketler;
CREATE OR REPLACE VIEW bitmek_uzere_paketler AS
SELECT
  mp.id,
  mp.musteri_id,
  mp.paket_id,
  (mp.toplam_seans - mp.kullanilan_seans) AS kalan_seans,
  p.ad AS paket_adi,
  au.email AS musteri_email,
  pr.phone AS musteri_telefon,
  r.id AS restaurant_id,
  r.name AS isletme_adi,
  r.business_type,
  mp.hatirlatma_gonderilen_esikler,
  mp.aktif
FROM musteri_paketleri mp
JOIN paketler p ON mp.paket_id = p.id
JOIN profiles pr ON mp.musteri_id = pr.id
LEFT JOIN auth.users au ON mp.musteri_id = au.id
JOIN restaurants r ON p.restaurant_id = r.id
WHERE (mp.toplam_seans - mp.kullanilan_seans) BETWEEN 0 AND 3
  AND mp.aktif = true;

-- ── BÖLÜM 2: Kanal tercihi ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bildirim_kanal_ayarlari (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  kanal         text NOT NULL CHECK (kanal IN ('email','sms','whatsapp','push')),
  aktif         boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, kanal)
);

INSERT INTO bildirim_kanal_ayarlari (restaurant_id, kanal, aktif)
SELECT r.id, k.kanal, (k.kanal IN ('email','sms','whatsapp'))
FROM restaurants r
CROSS JOIN (VALUES ('email'),('sms'),('whatsapp'),('push')) AS k(kanal)
ON CONFLICT (restaurant_id, kanal) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.musteri_kanal_tercihleri (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  musteri_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  kanal         text NOT NULL CHECK (kanal IN ('email','sms','whatsapp','push')),
  aktif         boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (musteri_id, restaurant_id, kanal)
);

CREATE OR REPLACE FUNCTION public.get_aktif_kanallar(
  p_musteri_id uuid,
  p_restaurant_id uuid
) RETURNS text[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT array_agg(b.kanal ORDER BY b.kanal)
  FROM bildirim_kanal_ayarlari b
  LEFT JOIN musteri_kanal_tercihleri m
    ON m.restaurant_id = b.restaurant_id
   AND m.musteri_id = p_musteri_id
   AND m.kanal = b.kanal
  WHERE b.restaurant_id = p_restaurant_id
    AND b.aktif = true
    AND (m.aktif IS NULL OR m.aktif = true);
$$;

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.bildirim_kanal_ayarlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musteri_kanal_tercihleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY bka_owner ON public.bildirim_kanal_ayarlari
  FOR ALL TO authenticated
  USING (restaurant_id = get_my_restaurant_id()
         AND get_my_role() IN ('business_owner','business_manager','super_admin'))
  WITH CHECK (restaurant_id = get_my_restaurant_id()
              AND get_my_role() IN ('business_owner','business_manager','super_admin'));
CREATE POLICY bka_super_admin ON public.bildirim_kanal_ayarlari
  FOR ALL TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY mkt_own ON public.musteri_kanal_tercihleri
  FOR ALL TO authenticated
  USING (musteri_id = auth.uid())
  WITH CHECK (musteri_id = auth.uid());
CREATE POLICY mkt_super_admin ON public.musteri_kanal_tercihleri
  FOR ALL TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');
