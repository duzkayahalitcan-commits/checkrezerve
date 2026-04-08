'use server'

import { supabase } from '@/lib/supabase'

export type ActionState = {
  success: boolean
  error: string | null
  guestName: string | null
}

export async function createReservation(
  restaurantId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guestName = formData.get('guest_name') as string
  const guestPhone = formData.get('guest_phone') as string
  const reservedDate = formData.get('reserved_date') as string
  const reservedTime = formData.get('reserved_time') as string
  const partySize = parseInt(formData.get('party_size') as string, 10)

  if (!guestName || !guestPhone || !reservedDate || !reservedTime) {
    return { success: false, error: 'Lütfen tüm alanları doldurun.', guestName: null }
  }

  const { error } = await supabase.from('reservations').insert({
    restaurant_id: restaurantId,
    guest_name: guestName,
    guest_phone: guestPhone,
    reserved_date: reservedDate,
    reserved_time: reservedTime,
    party_size: partySize || 1,
  })

  if (error) {
    // Postgres unique violation kodu: 23505
    if (error.code === '23505') {
      return {
        success: false,
        error: 'Bu gün için zaten bir rezervasyonunuz var.',
        guestName: null,
      }
    }
    return { success: false, error: 'Bir hata oluştu. Lütfen tekrar deneyin.', guestName: null }
  }

  return { success: true, error: null, guestName: guestName }
}
