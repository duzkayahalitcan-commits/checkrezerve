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

/**
 * BUG 3 FİX: Asistan erişim kontrolü — TEK yetkili anahtar ai_assistant_enabled.
 * İşletmenin ai_assistant_enabled'ı restaurants tablosundan okunur; false ise
 * feature flag ne olursa olsun (true bile) erişim reddedilir. Böylece DB'den
 * yalnızca ai_assistant_enabled=false yapmak da asistanı tamamen kapatır.
 */
export async function checkAssistantEnabled(
  restaurantId: string,
  feature: string,
): Promise<boolean> {
  if (!restaurantId) return false
  try {
    const db = getSupabaseAdmin()
    const { data: rest } = await db
      .from('restaurants')
      .select('ai_assistant_enabled')
      .eq('id', restaurantId)
      .maybeSingle()
    if (rest?.ai_assistant_enabled !== true) return false // master kapalı
    return checkFeatureFlag(restaurantId, feature)
  } catch {
    return false
  }
}
