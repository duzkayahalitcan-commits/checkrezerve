-- EK IS 1: hizmetler tablosuna kategori ve renk kolonlari ekle
-- (ServiceManager.tsx ve /api/panel-tables zaten kullaniyordu ama DB'de yoktu -> 42703 hatasi)
ALTER TABLE public.hizmetler
  ADD COLUMN IF NOT EXISTS kategori text,
  ADD COLUMN IF NOT EXISTS renk text;
