-- 08 - restaurants.webhook_secret eski kolonunu bosalt (anon'a acik kopya kalmasin)
-- SADECE 71ad17a (webhook restaurant_secrets'tan okuyor) deploy edildikten SONRA calistir.
-- On kosul: restaurant_secrets 13 satir ve restaurants ile esit (dogrulandi 2026-09-23).
-- Kolon silinmez, sadece NULL yapilir. Geri alma:
--   UPDATE public.restaurants r SET webhook_secret = s.webhook_secret FROM public.restaurant_secrets s WHERE s.restaurant_id = r.id;

UPDATE public.restaurants SET webhook_secret = NULL WHERE webhook_secret IS NOT NULL;

SELECT (SELECT count(*) FROM public.restaurants WHERE webhook_secret IS NOT NULL) AS eski_kolonda_kalan, (SELECT count(*) FROM public.restaurant_secrets WHERE webhook_secret IS NOT NULL) AS yeni_tabloda;
