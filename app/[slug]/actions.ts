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
  const guestName    = (formData.get('guest_name')    as string)?.trim()
  const guestPhone   = (formData.get('guest_phone')   as string)?.trim()
  const reservedDate = (formData.get('reserved_date') as string)?.trim()
  const reservedTime = (formData.get('reserved_time') as string)?.trim()
  const partySize    = parseInt(formData.get('party_size') as string, 10)
  const notes        = (formData.get('notes')         as string)?.trim() || null

  if (!guestName || !guestPhone || !reservedDate || !reservedTime) {
    return { success: false, error: 'Lütfen tüm zorunlu alanları doldurun.', guestName: null }
  }

  // Basit telefon doğrulama
  const phoneDigits = guestPhone.replace(/\D/g, '')
  if (phoneDigits.length < 10) {
    return { success: false, error: 'Geçerli bir telefon numarası girin.', guestName: null }
  }

  const { error } = await supabase.from('reservations').insert({
    restaurant_id: restaurantId,
    guest_name:    guestName,
    guest_phone:   guestPhone,
    reserved_date: reservedDate,
    reserved_time: reservedTime,
    party_size:    isNaN(partySize) ? 1 : partySize,
    special_requests: notes,
    status: 'confirmed',
    source: 'form',
  })

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        error: 'Bu gün için zaten bir rezervasyonunuz var. Değişiklik için lütfen bizi arayın.',
        guestName: null,
      }
    }
    console.error('[createReservation]', error)
    return { success: false, error: 'Bir hata oluştu. Lütfen tekrar deneyin.', guestName: null }
  }

  return { success: true, error: null, guestName: guestName }
}
