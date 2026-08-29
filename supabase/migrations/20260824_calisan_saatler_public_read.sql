-- =============================================================
-- calisan_saatler: public-read SELECT policy (2026-08-24)
-- Amaç: Müşteri booking akışı (mobil supabase anon istemci) çalışan
--   çalışma saatlerini okuyabilsin. RLS yazma policy'si
--   (calisan_saatler_super_admin_only) DEĞİŞMEZ — yazma hâlâ super_admin.
-- Yeniden çalıştırılabilir: drop + create.
-- =============================================================
drop policy if exists "calisan_saatler_public_read" on calisan_saatler;
create policy "calisan_saatler_public_read"
  on calisan_saatler for select
  using (true);
