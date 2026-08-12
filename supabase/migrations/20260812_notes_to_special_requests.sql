-- Birleştirme: reservations.special_requests ← reservations.notes
-- notes dolu olan kayıtlarda notes değerini special_requests'e taşı.
-- Migration'ı manuel uygula:
--   psql ... -f bu_dosya.sql
-- veya Supabase SQL Editor'dan çalıştır.

update reservations
set special_requests = coalesce(special_requests, notes)
where notes is not null;
