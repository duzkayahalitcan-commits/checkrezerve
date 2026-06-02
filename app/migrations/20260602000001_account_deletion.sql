-- =============================================================================
-- Migration: Hesap silme altyapısı
-- Tarih: 2026-06-02
-- =============================================================================

-- ── 1. reservations tablosuna customer_id ve deleted_at ekle ──────────────
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS customer_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;

-- customer_name ve phone nullable olmalı (silinen hesaplarda NULL yapılacak)
ALTER TABLE public.reservations
  ALTER COLUMN customer_name DROP NOT NULL,
  ALTER COLUMN phone         DROP NOT NULL;

CREATE INDEX IF NOT EXISTS reservations_customer_id_idx ON public.reservations (customer_id);
CREATE INDEX IF NOT EXISTS reservations_deleted_at_idx  ON public.reservations (deleted_at) WHERE deleted_at IS NOT NULL;

-- ── 2. 90 günden eski soft-deleted rezervasyonları tamamen anonimleştiren fonksiyon ──
CREATE OR REPLACE FUNCTION public.anonymize_old_deleted_reservations()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.reservations
  SET
    customer_name    = NULL,
    phone            = NULL,
    special_requests = NULL
  WHERE
    deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '90 days'
    AND (customer_name IS NOT NULL OR phone IS NOT NULL OR special_requests IS NOT NULL);
$$;

-- ── 3. pg_cron ile her gece 02:00'de çalıştır ────────────────────────────
-- pg_cron Supabase'de varsayılan olarak etkindir (cron schema'sı)
SELECT cron.schedule(
  'anonymize-deleted-reservations',          -- job adı (idempotent)
  '0 2 * * *',                               -- her gece 02:00 UTC
  $$SELECT public.anonymize_old_deleted_reservations()$$
);
