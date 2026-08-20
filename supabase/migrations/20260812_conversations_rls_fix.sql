-- ============================================================
-- GÜVENLİK FİX: conversations RLS
-- Önceki durum: conversations_admin_all policy'si {public} rolüne
--   qual=true ile TAM (ALL) erişim veriyordu -> anon key ile herkes
--   tüm konuşma kayıtlarını okuyabiliyor/yazabiliyordu (çapraz-kiracı sızıntı).
-- Bu migration:
--   1) conversations_admin_all policy'sini DROP eder
--   2) anon/authenticated için SADECE INSERT (chatbot bootstrap) bırakır
--   3) SELECT/UPDATE/DELETE -> authenticated + kendi restaurant_id + rol koşulu
--   (reservations tablosundaki mevcut policy deseniyle birebir uyumlu)
-- ============================================================

DROP POLICY IF EXISTS conversations_admin_all ON public.conversations;

-- anon + authenticated: yalnızca INSERT (chatbot konuşma başlatırken kayıt açar)
CREATE POLICY conversations_anon_insert ON public.conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- super_admin: tüm konuşma kayıtlarına tam erişim (admin paneli)
CREATE POLICY conversations_super_admin ON public.conversations
  FOR ALL
  TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

-- business_owner / business_manager: yalnızca kendi isletmesinin konuşmaları
CREATE POLICY conversations_owner ON public.conversations
  FOR ALL
  TO authenticated
  USING (
    get_my_role() IN ('business_owner', 'business_manager')
    AND restaurant_id = get_my_restaurant_id()
  )
  WITH CHECK (
    get_my_role() IN ('business_owner', 'business_manager')
    AND restaurant_id = get_my_restaurant_id()
  );
