-- restaurants tablosu
create table if not exists restaurants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  phone       text,
  address     text,
  capacity    integer not null default 50,
  created_at  timestamptz not null default now()
);

-- reservations tablosu
create table if not exists reservations (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null references restaurants(id) on delete cascade,
  guest_name      text not null,
  guest_phone     text not null,
  party_size      integer not null default 1,
  reserved_date   date not null,
  reserved_time   time not null,
  notes           text,
  status          text not null default 'confirmed'
                    check (status in ('confirmed', 'cancelled', 'completed')),
  created_at      timestamptz not null default now(),

  -- Aynı telefon + aynı gün + aynı restoran için mükerrer kaydı engelle
  constraint reservations_no_duplicate
    unique (restaurant_id, guest_phone, reserved_date)
);

-- Hızlı sorgu için index'ler
create index on reservations (restaurant_id, reserved_date);
create index on reservations (guest_phone);
