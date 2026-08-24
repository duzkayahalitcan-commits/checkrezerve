-- =============================================================
-- StaffManager hotfix (2026-08-21)
-- Sorun: /panel/[slug]/calisanlar StaffManager şu DB nesnelerine
--   erişiyor ama şemada yok:
--     • calisan_hizmetler (join tablosu)        → yok (PGRST205)
--     • calisan_saatler (çalışma saatleri)      → yok (PGRST205)
--     • calisanlar.soyad/email/telefon/pozisyon → yok (42703)
-- Hepsi IF NOT EXISTS korumalı → tekrar çalıştırılabilir.
-- Not: Orijinal 20260626230000 migration'ındaki RLS policy'leri
--   restaurant_users.user_id referans alıyordu ama o kolon DB'de
--   YOK (42703) → policy oluşturma hata verirdi. Burada projenin
--   iç-veri deseni olan profiles.role = 'super_admin' kullanıldı.
-- =============================================================

-- 1. calisanlar eksik kolonlar
alter table calisanlar add column if not exists soyad text;
alter table calisanlar add column if not exists email text;
alter table calisanlar add column if not exists telefon text;
alter table calisanlar add column if not exists pozisyon text;

-- 2. calisan_saatler — çalışma günleri/saatleri
--    StaffManager gun'u 0=Pazartesi..6=Pazar index'i olarak gönderir
create table if not exists calisan_saatler (
  id          uuid primary key default gen_random_uuid(),
  calisan_id  uuid not null references calisanlar(id) on delete cascade,
  gun         smallint not null check (gun between 0 and 6),
  acik        boolean not null default true,
  baslangic   time not null default '09:00',
  bitis       time not null default '18:00',
  unique(calisan_id, gun)
);

-- 3. calisan_hizmetler — çalışan↔hizmet junction
create table if not exists calisan_hizmetler (
  calisan_id  uuid not null references calisanlar(id) on delete cascade,
  hizmet_id   uuid not null references hizmetler(id) on delete cascade,
  primary key (calisan_id, hizmet_id)
);

-- 4. RLS — panel service_role ile erişir (bypass), iç veriler kilitli
alter table calisan_saatler enable row level security;
alter table calisan_hizmetler enable row level security;

drop policy if exists "calisan_saatler_super_admin_only" on calisan_saatler;
create policy "calisan_saatler_super_admin_only"
  on calisan_saatler for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

drop policy if exists "calisan_hizmetler_super_admin_only" on calisan_hizmetler;
create policy "calisan_hizmetler_super_admin_only"
  on calisan_hizmetler for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

-- 5. İndeksler
create index if not exists idx_calisan_saatler_calisan on calisan_saatler (calisan_id);
create index if not exists idx_calisan_hizmetler_calisan on calisan_hizmetler (calisan_id);
create index if not exists idx_calisan_hizmetler_hizmet on calisan_hizmetler (hizmet_id);
