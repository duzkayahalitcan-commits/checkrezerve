-- ─────────────────────────────────────────────────────────────────────────────
-- checkrezerve — Tam Veritabanı Şeması
-- Supabase SQL Editöründe veya `supabase db push` ile çalıştırılabilir.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Uzantılar ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Restoranlar ───────────────────────────────────────────────────────────────
create table if not exists restaurants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  phone       text,
  address     text,
  capacity    integer not null default 50,
  created_at  timestamptz not null default now()
);

-- ── Şubeler (çok şubeli restoran desteği) ────────────────────────────────────
create table if not exists branches (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text not null,                   -- Şube adı (ör. "Bağcılar Şubesi")
  address       text,
  phone         text,
  capacity      integer not null default 50,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists branches_restaurant_idx on branches (restaurant_id);

-- ── Rezervasyonlar ────────────────────────────────────────────────────────────
create table if not exists reservations (
  id               uuid primary key default gen_random_uuid(),

  -- Müşteri bilgileri
  customer_name    text not null,
  phone            text not null,

  -- Rezervasyon detayları
  date             date not null,
  time             time,
  party_size       integer not null default 1,
  special_requests text,

  -- İlişkiler
  branch_id        uuid references branches(id) on delete set null,
  restaurant_id    uuid references restaurants(id) on delete cascade,

  -- Durum
  status           text not null default 'confirmed'
                     check (status in ('confirmed', 'pending', 'cancelled', 'completed')),

  -- Kaynak (manuel form | AI analizi | telefon vb.)
  source           text not null default 'form'
                     check (source in ('form', 'ai', 'phone', 'whatsapp')),

  -- AI meta verisi (kaynak 'ai' ise doldurulur)
  original_message text,
  ai_confidence    numeric(3,2),

  created_at       timestamptz not null default now()
);

-- Aynı telefon + aynı gün + aynı restoran için mükerrer kayıt engeli
create unique index if not exists reservations_no_duplicate
  on reservations (restaurant_id, phone, date)
  where status != 'cancelled';

create index if not exists reservations_date_idx      on reservations (date);
create index if not exists reservations_branch_idx    on reservations (branch_id);
create index if not exists reservations_status_idx    on reservations (status);
create index if not exists reservations_phone_idx     on reservations (phone);

-- ── AI Rezervasyon Kuyruğu (ham analiz geçmişi) ──────────────────────────────
create table if not exists ai_reservations (
  id               uuid primary key default gen_random_uuid(),
  name             text,
  date             date,
  time             time,
  party_size       integer,
  phone            text,
  notes            text,
  status           text not null default 'pending'
                     check (status in ('pending', 'confirmed', 'cancelled')),
  original_message text not null,
  confidence       numeric(3,2),
  raw_date_text    text,
  restaurant_id    uuid references restaurants(id) on delete set null,
  -- Onaylandıktan sonra gerçek reservations tablosuna bağlanır
  reservation_id   uuid references reservations(id) on delete set null,
  created_at       timestamptz not null default now()
);

create index if not exists ai_reservations_date_idx       on ai_reservations (date);
create index if not exists ai_reservations_status_idx     on ai_reservations (status);
create index if not exists ai_reservations_restaurant_idx on ai_reservations (restaurant_id);
