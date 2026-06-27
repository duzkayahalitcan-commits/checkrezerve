-- =============================================================
-- Bildirim Yönetimi: log tablosu + şablon tablosu
-- =============================================================

-- 1. bildirim_log — tüm SMS/push/email gönderim kayıtları
create table if not exists bildirim_log (
  id          uuid primary key default gen_random_uuid(),
  isletme_id  uuid not null references restaurants(id) on delete cascade,
  tip         text not null check (tip in ('sms', 'push', 'email', 'whatsapp')),
  alici       text not null,                -- telefon numarası veya email
  mesaj       text not null,
  durum       text not null default 'pending' check (durum in ('pending', 'sent', 'failed', 'delivered')),
  hata_mesaji text,
  sablon_id   uuid,
  rezervasyon_id uuid,
  created_at  timestamptz not null default now()
);

-- 2. bildirim_sablonlari — mesaj şablonları
create table if not exists bildirim_sablonlari (
  id          uuid primary key default gen_random_uuid(),
  isletme_id  uuid not null references restaurants(id) on delete cascade,
  ad          text not null,
  icerik      text not null,
  tip         text not null default 'sms' check (tip in ('sms', 'push', 'email', 'whatsapp')),
  aktif       boolean not null default true,
  son_kullanim timestamptz,
  created_at  timestamptz not null default now()
);

-- 3. RLS
alter table bildirim_log enable row level security;
alter table bildirim_sablonlari enable row level security;

create policy "bildirim_log_isletme" on bildirim_log
  using (isletme_id = (select restaurant_id from restaurant_users where user_id = auth.uid() limit 1));

create policy "bildirim_sablonlari_isletme" on bildirim_sablonlari
  using (isletme_id = (select restaurant_id from restaurant_users where user_id = auth.uid() limit 1));

-- 4. İndeksler
create index if not exists idx_bildirim_log_isletme on bildirim_log (isletme_id, created_at desc);
create index if not exists idx_bildirim_log_durum   on bildirim_log (isletme_id, durum);
create index if not exists idx_bildirim_sablon_isletme on bildirim_sablonlari (isletme_id);
