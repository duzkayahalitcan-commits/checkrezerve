-- 09 - reservations: status'e no_show, source'a walk_in/web/app/widget/instagram/ai_voice ekle
-- 06-OP-04-CH-06.sql'in yerini alir (onu ayrica calistirmaya gerek yok).
-- Mevcut degerler korunur; sadece izin verilen kume genisler. 27 satir, kilit anlik.
-- On kontrol: kume disinda deger yok (2026-09-23: status 4 deger, source hepsi 'form').
-- Geri alma: ayni iki constraint'i eski kumelerle yeniden olustur (once yeni degerli satirlari donustur).

BEGIN;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check
  CHECK (status = ANY (ARRAY['pending','confirmed','cancelled','completed','no_show']::text[]));
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_source_check;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_source_check
  CHECK (source = ANY (ARRAY['form','ai','phone','whatsapp','walk_in','web','app','widget','instagram','ai_voice']::text[]));
COMMIT;

SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname IN ('reservations_status_check','reservations_source_check');
