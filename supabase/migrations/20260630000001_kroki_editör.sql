-- =============================================================
-- Kroki Editörü — restaurants tablosuna kroki_data/kroki_enabled
-- =============================================================

alter table restaurants add column if not exists kroki_data jsonb default null;
alter table restaurants add column if not exists kroki_enabled boolean default false;
