-- restaurants tablosuna konum alanları eklendi
alter table restaurants
  add column if not exists city     text,
  add column if not exists district text,
  add column if not exists country  text not null default 'TR';

-- Şehir + ilçeye göre hızlı filtreleme için index
create index if not exists restaurants_city_district_idx
  on restaurants (city, district);
