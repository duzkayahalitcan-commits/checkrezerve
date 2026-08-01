import { getSupabaseAdmin } from '@/lib/supabase'

// S1-T5: Feature flag kontrolü — ilgili işletmede özellik açık değilse erişimi engelle.
// Tablo/flag yoksa güvenli tarafta kal: false döner (erişim kapalı).
export async function checkFeatureFlag(restaurantId: string, feature: string): Promise<boolean> {
  if (!restaurantId) return false
  try {
    const db = getSupabaseAdmin()
    const { data } = await db
      .from('feature_flags')
      .select('enabled')
      .eq('restaurant_id', restaurantId)
      .eq('feature', feature)
      .maybeSingle()
    return data?.enabled === true
  } catch {
    return false
  }
}
