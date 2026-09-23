-- =============================================================================
-- 06 — OP-04 / CH-06: reservations.source değer kümesini genişlet
-- Hazırlayan: Görev 3 (2026-09-23) — UYGULANMADI, Halitcan çalıştıracak
--
-- DURUM: reservations_source_check = ('form','ai','phone','whatsapp').
--   Walk-in kaydı (panel "Şimdi geldi") 'walk_in' yazmayı dener; CHECK reddederse kod
--   'phone' + "[Walk-in]" not önekiyle yazar (app/api/panel/reservations/route.ts).
--   Bu SQL'den sonra gerçek 'walk_in' kaydedilir; CH-06 için web/app/widget/instagram/ai_voice da eklenir.
--
-- RİSK: Düşük — mevcut değerler korunuyor, sadece küme genişliyor. Mevcut satırlar yeni CHECK'i
--   sağlıyor (hepsi 'form'). Kısa süreli ACCESS EXCLUSIVE kilit (26 satır, anlık).
-- =============================================================================

-- ÖN KONTROL: kümede olmayan değer var mı? (0 satır beklenir)
SELECT source, count(*) FROM public.reservations
WHERE source NOT IN ('form','ai','phone','whatsapp','walk_in','web','app','widget','instagram','ai_voice')
GROUP BY 1;

BEGIN;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_source_check;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_source_check
  CHECK (source = ANY (ARRAY['form','ai','phone','whatsapp','walk_in','web','app','widget','instagram','ai_voice']::text[]));
COMMIT;

-- DOĞRULAMA
SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'reservations_source_check';

-- GERİ ALMA (yeni değerlerle satır yazıldıysa önce onları 'phone'/'form'a çek)
-- ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_source_check;
-- ALTER TABLE public.reservations ADD CONSTRAINT reservations_source_check
--   CHECK (source = ANY (ARRAY['form','ai','phone','whatsapp']::text[]));
