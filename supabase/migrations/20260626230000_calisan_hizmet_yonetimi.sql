-- =============================================================
-- Çalışan & Hizmet Yönetimi Genişletme
-- =============================================================

-- 1. calisanlar tablosuna ek kolonlar (eğer yoksa)
alter table calisanlar add column if not exists soyad text;
alter table calisanlar add column if not exists email text;
alter table calisanlar add column if not exists telefon text;
alter table calisanlar add column if not exists pozisyon text;

-- 2. hizmetler tablosuna ek kolonlar
alter table hizmetler add column if not exists kategori text;
alter table hizmetler add column if not exists renk text default '#6366f1';

-- 3. calisan_saatler tablosu (çalışma günleri/saatleri)
create table if not exists calisan_saatler (
  id          uuid primary key default gen_random_uuid(),
  calisan_id  uuid not null references calisanlar(id) on delete cascade,
  gun         smallint not null check (gun between 0 and 6),  -- 0=Pazartesi..6=Pazar
  acik        boolean not null default true,
  baslangic   time not null default '09:00',
  bitis       time not null default '18:00',
  unique(calisan_id, gun)
);

-- 4. calisan_hizmetler junction tablosu
create table if not exists calisan_hizmetler (
  calisan_id  uuid not null references calisanlar(id) on delete cascade,
  hizmet_id   uuid not null references hizmetler(id) on delete cascade,
  primary key (calisan_id, hizmet_id)
);

-- 5. RLS
alter table calisan_saatler enable row level security;
alter table calisan_hizmetler enable row level security;

-- İşletme bazlı RLS politikaları
create policy "calisan_saatler_isletme" on calisan_saatler
  using (calisan_id in (select id from calisanlar where restaurant_id = (select restaurant_id from restaurant_users where user_id = auth.uid() limit 1)));

create policy "calisan_hizmetler_isletme" on calisan_hizmetler
  using (calisan_id in (select id from calisanlar where restaurant_id = (select restaurant_id from restaurant_users where user_id = auth.uid() limit 1)));

-- İndeksler
create index if not exists idx_calisan_saatler_calisan on calisan_saatler (calisan_id);
create index if not exists idx_calisan_hizmetler_calisan on calisan_hizmetler (calisan_id);
create index if not exists idx_calisan_hizmetler_hizmet on calisan_hizmetler (hizmet_id);
