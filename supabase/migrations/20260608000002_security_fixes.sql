-- Security fixes: RLS policies and missing protections
-- 20260608000002

-- 1. email_logs — enable RLS (was missing entirely)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_logs_admin_all" ON email_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 2. reservations_anon_select — restrict to zero rows for anon
--    Previously allowed ALL reservations to any anonymous user
DROP POLICY IF EXISTS "reservations_anon_select" ON reservations;
CREATE POLICY "reservations_anon_select" ON reservations
  FOR SELECT USING (false);

-- 3. guests_anon_select — restrict instead of full public access
DROP POLICY IF EXISTS "guests_anon_select" ON guests;
CREATE POLICY "guests_anon_select" ON guests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()
      AND (role = 'super_admin' OR (role IN ('business_owner','business_manager') AND isletme_id = guests.restaurant_id)))
  );

-- 4. guest_tag_assignments_owner_all — add restaurant ownership check
DROP POLICY IF EXISTS "guest_tag_assignments_owner_all" ON guest_tag_assignments;
CREATE POLICY "guest_tag_assignments_owner_all" ON guest_tag_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM guest_tags gt
      JOIN restaurants r ON r.id = gt.restaurant_id
      WHERE gt.id = guest_tag_assignments.tag_id
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()
          AND (role = 'super_admin' OR (role IN ('business_owner','business_manager') AND isletme_id = gt.restaurant_id)))
    )
  );

-- 5. guest_activities_owner_all — add ownership check
DROP POLICY IF EXISTS "guest_activities_owner_all" ON guest_activities;
CREATE POLICY "guest_activities_owner_all" ON guest_activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM guests g
      WHERE g.id = guest_activities.guest_id
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()
          AND (role = 'super_admin' OR (role IN ('business_owner','business_manager') AND isletme_id = g.restaurant_id)))
    )
  );

-- 6. ai_reservations_business — add restaurant_id filter
DROP POLICY IF EXISTS "ai_reservations_business" ON ai_reservations;
CREATE POLICY "ai_reservations_business" ON ai_reservations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()
      AND (role = 'super_admin' OR (role IN ('business_owner','business_manager')
        AND isletme_id = ai_reservations.restaurant_id)))
  );
