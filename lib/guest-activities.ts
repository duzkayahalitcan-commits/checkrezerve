import { getSupabaseAdmin } from '@/lib/supabase'

export type GuestActivityType = 'reservation' | 'cancellation' | 'note' | 'tag_change' | 'payment'

interface LogParams {
  guest_id: string
  activity_type: GuestActivityType
  description?: string
  metadata?: Record<string, unknown>
}

/**
 * `guest_activities` tablosuna kayıt düşer (S4-T2).
 * RLS auth.uid() bazlı olduğundan loglama service-role (RLS bypass) ile
 * sunucu tarafında yapılır. Hatalar sessizce yakalanır — ana akışı bozmaz.
 */
export async function logGuestActivity({ guest_id, activity_type, description, metadata }: LogParams) {
  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('guest_activities').insert({
      guest_id,
      activity_type,
      description: description ?? null,
      metadata: metadata ?? null,
    })
  } catch (e) {
    console.error('[guest-activities] log hatası:', (e as Error).message)
  }
}

/**
 * Bir rezervasyonun misafirini telefon numarasıyla bulur (o işletmede).
 * Bulunamazsa null döner — loglama sessizce atlanır.
 */
export async function resolveGuestByPhone(
  restaurantId: string,
  phone: string,
): Promise<{ id: string } | null> {
  try {
    const { data } = await getSupabaseAdmin()
      .from('guests')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('phone', phone)
      .maybeSingle()
    return data
  } catch {
    return null
  }
}
