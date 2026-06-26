-- Isletme Onboarding Wizard
-- restaurants tablosuna onboarding_completed boolean kolonu ekle
alter table restaurants add column if not exists onboarding_completed boolean not null default false;

-- Yeni eklenen kayitlar icin de default false
-- Mevcut kayitlari true yapma (geriye donuk uyumluluk)
