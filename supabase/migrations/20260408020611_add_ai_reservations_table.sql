-- AI mesaj analizinden gelen rezervasyon talepleri
-- Sütunlar: id, name, date, party_size, status (+ analiz meta verileri)

create table if not exists ai_reservations (
  id              uuid primary key default gen_random_uuid(),

  -- Temel rezervasyon bilgileri (Claude tarafından çıkarılır)
  name            text,                       -- Müşteri adı
  date            date,                       -- Rezervasyon tarihi
  time            time,                       -- Rezervasyon saati
  party_size      integer,                    -- Kişi sayısı
  phone           text,                       -- Telefon
  notes           text,                       -- Ek notlar

  -- Durum yönetimi
  status          text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'cancelled')),

  -- AI analiz meta verileri
  original_message text not null,             -- Ham müşteri mesajı
  confidence      numeric(3,2),               -- 0.00–1.00
  raw_date_text   text,                       -- "yarın", "cuma akşamı" vb.

  -- İlişki (opsiyonel — hangi restoran için analiz yapıldıysa)
  restaurant_id   uuid references restaurants(id) on delete set null,

  created_at      timestamptz not null default now()
);

-- Hızlı sorgular için index
create index if not exists ai_reservations_date_idx on ai_reservations (date);
create index if not exists ai_reservations_status_idx on ai_reservations (status);
create index if not exists ai_reservations_restaurant_idx on ai_reservations (restaurant_id);
