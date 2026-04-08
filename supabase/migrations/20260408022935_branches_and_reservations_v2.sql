-- Şubeler tablosu (çok şubeli restoran desteği)
create table if not exists branches (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name          text not null,
  address       text,
  phone         text,
  capacity      integer not null default 50,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists branches_restaurant_idx on branches (restaurant_id);

-- Mevcut reservations tablosuna eksik sütunları ekle
alter table reservations
  add column if not exists customer_name    text,
  add column if not exists phone            text,
  add column if not exists date             date,
  add column if not exists branch_id        uuid references branches(id) on delete set null,
  add column if not exists special_requests text,
  add column if not exists source           text not null default 'form'
                                              check (source in ('form', 'ai', 'phone', 'whatsapp')),
  add column if not exists original_message text,
  add column if not exists ai_confidence    numeric(3,2);

-- ai_reservations tablosuna reservation_id bağlantısı ekle
alter table ai_reservations
  add column if not exists reservation_id uuid references reservations(id) on delete set null;

create index if not exists reservations_branch_idx on reservations (branch_id);
create index if not exists reservations_source_idx on reservations (source);
