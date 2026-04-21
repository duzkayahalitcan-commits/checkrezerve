-- =============================================================================
-- Migration: profiles (role sistemi) + masa_tipleri
-- Tarih: 2026-04-20
-- =============================================================================

-- ── 1. Profiles tablosu ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  role       TEXT        NOT NULL DEFAULT 'musteri'
               CHECK (role IN ('super_admin', 'isletme_admin', 'musteri')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi profilini görebilir
CREATE POLICY IF NOT EXISTS "profiles_own_select"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- super_admin her şeyi yapabilir
CREATE POLICY IF NOT EXISTS "profiles_super_admin_all"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid() AND p2.role = 'super_admin'
    )
  );

-- ── 2. Yeni kullanıcıda otomatik profil oluştur ────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Mevcut auth kullanıcılarına profil ekle (boşluk doldur)
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ── 3. Masa Tipleri tablosu ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS masa_tipleri (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  isletme_id  UUID        NOT NULL,   -- references isletmeler(id)
  ad          TEXT        NOT NULL,
  kapasite    INTEGER     NOT NULL DEFAULT 2,
  aktif       BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (isletme_id, ad)
);

CREATE INDEX IF NOT EXISTS masa_tipleri_isletme_idx
  ON masa_tipleri (isletme_id);

ALTER TABLE masa_tipleri ENABLE ROW LEVEL SECURITY;

-- Herkes aktif masa tiplerini görebilir (müşteri rezervasyonu için)
CREATE POLICY IF NOT EXISTS "masa_tipleri_public_read"
  ON masa_tipleri FOR SELECT
  USING (aktif = true);

-- super_admin her şeyi yapabilir
CREATE POLICY IF NOT EXISTS "masa_tipleri_super_admin_all"
  ON masa_tipleri FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- ── 4. Rezervasyonlara masa_tipi_id ekle ──────────────────────────────────
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS masa_tipi_id UUID REFERENCES masa_tipleri(id) ON DELETE SET NULL;

-- ── 5. isletmeler tablosuna user_id ekle (eğer yoksa) ─────────────────────
-- Not: isletmeler tablosu Supabase panelinden oluşturulmuşsa bu çalışır
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'isletmeler') THEN
    ALTER TABLE isletmeler ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
