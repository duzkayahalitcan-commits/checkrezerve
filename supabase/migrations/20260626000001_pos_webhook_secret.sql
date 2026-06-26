-- POS Webhook Secret — her restoran için ayrı güvenlik anahtarı
-- SambaPOS / benzeri POS sistemlerinden webhook doğrulaması için kullanılır
alter table restaurants add column if not exists webhook_secret text;
