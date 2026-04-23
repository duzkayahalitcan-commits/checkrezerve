-- user_favorites: kullanici favori isletmeler
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid        NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, restaurant_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites"   ON public.user_favorites;
DROP POLICY IF EXISTS "Users can add favorites"        ON public.user_favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.user_favorites;

CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);
