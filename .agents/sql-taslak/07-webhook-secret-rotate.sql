-- =============================================================================
-- 07 — SambaPOS webhook sırlarını yenile (rotate) — 13 işletmenin hepsi
-- Hazırlayan: 2026-09-23 — UYGULANMADI, Halitcan çalıştıracak
--
-- NEDEN: restaurants.webhook_secret anon anahtarıyla okunabiliyordu (restaurants_public_select,
--   tüm kolonlar) → mevcut 13 sır sızmış kabul edilir.
-- KULLANIM KONTROLÜ (SELECT, 2026-09-23):
--   - reservations'ta POS izi ('POS ödeme:%') 0 satır → webhook hiç başarıyla işlememiş.
--   - app/api/pos/samba/webhook/route.ts olmayan `completed_at` kolonuna yazdığı için başarılı olması
--     zaten mümkün değil (update 500 döner) → "kullanan" işletme fiilen yok.
--   - Son 30 günlük istek logu YOK: nginx logları host'a yazılmıyor (/var/log/nginx son Haziran),
--     container logları 23 Eylül deploy'unda container'lar yeniden oluşturulunca silindi.
--   Bu yüzden 13'ünün de yenilenmesi mevcut hiçbir akışı bozmaz.
--
-- SIRA: 04-SC-02.sql (checkrezerve-app) önce çalıştırıldıysa restaurant_secrets de güncellenir.
-- Sırlar ekrana BASILMAZ; yeni sır işletmeye verilecekse panelden/tek tek okunmalı.
--
-- RİSK: Düşük. SambaPOS'u gerçekten yapılandırmış bir işletme varsa yeni sırrı girene kadar
--   webhook 401 alır (şu an zaten 404/500 alıyor).
-- GERİ ALMA: Yok (eski sırlar sızdığı için geri dönülmemeli).
-- =============================================================================

BEGIN;

UPDATE public.restaurants
   SET webhook_secret = encode(gen_random_bytes(32), 'hex')   -- 64 hex karakter, mevcut biçimle aynı
 WHERE webhook_secret IS NOT NULL;

-- 04-SC-02 uygulandıysa ayrı tablodaki kopyaları da yeni değerle eşitle
DO $$
BEGIN
  IF to_regclass('public.restaurant_secrets') IS NOT NULL THEN
    INSERT INTO public.restaurant_secrets (restaurant_id, webhook_secret, updated_at)
    SELECT id, webhook_secret, now() FROM public.restaurants WHERE webhook_secret IS NOT NULL
    ON CONFLICT (restaurant_id) DO UPDATE SET webhook_secret = EXCLUDED.webhook_secret, updated_at = now();
  END IF;
END $$;

COMMIT;

-- ── DOĞRULAMA (sır değerleri gösterilmez) ────────────────────────────────────
-- Beklenen: dolu=13, uzunluk=64, farkli=13; restaurant_secrets varsa esit=13
SELECT count(*) FILTER (WHERE webhook_secret IS NOT NULL) AS dolu,
       min(length(webhook_secret)) AS uzunluk,
       count(DISTINCT webhook_secret) AS farkli
FROM public.restaurants;

SELECT count(*) AS esit
FROM public.restaurants r JOIN public.restaurant_secrets s ON s.restaurant_id = r.id
WHERE s.webhook_secret = r.webhook_secret;   -- restaurant_secrets yoksa bu sorgu hata verir, yok say
