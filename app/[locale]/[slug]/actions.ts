'use server'

import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendReservationConfirmation } from '@/lib/notification-service'
import { triggerN8nReservation } from '@/lib/n8n'

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

  const phoneDigits = guestPhone.replace(/\D/g, '')
  if (phoneDigits.length < 10) {
    return { success: false, error: 'Geçerli bir telefon numarası girin.', guestName: null }
  }

  const db = getSupabaseAdmin()

  // ── Kapasite kontrolü ────────────────────────────────────────────────────────
  const { data: restaurant } = await db
    .from('restaurants')
    .select('capacity, name')
    .eq('id', restaurantId)
    .single()

  if (restaurant?.capacity) {
    const { count } = await db
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId)
      .eq('reserved_date', reservedDate)
      .neq('status', 'cancelled')

    if ((count ?? 0) >= restaurant.capacity) {
      return {
        success: false,
        error: `Üzgünüz, ${reservedDate} tarihi için kapasitemiz dolmuştur. Farklı bir tarih seçebilirsiniz.`,
        guestName: null,
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  const { error } = await supabase.from('reservations').insert({
    restaurant_id:    restaurantId,
    guest_name:       guestName,
    guest_phone:      guestPhone,
    reserved_date:    reservedDate,
    reserved_time:    reservedTime,
    party_size:       isNaN(partySize) ? 1 : partySize,
    special_requests: notes,
    status:           'confirmed',
    source:           'form',
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

  // WhatsApp / SMS onayı
  const phone = guestPhone.replace(/\D/g, '')
  const e164  = phone.startsWith('0') ? `+9${phone}` : `+${phone}`

  sendReservationConfirmation({
    to:             e164,
    customerName:   guestName,
    restaurantName: restaurant?.name ?? undefined,
    date:           reservedDate,
    time:           reservedTime,
    partySize:      isNaN(partySize) ? 1 : partySize,
  }).catch(err => console.error('[MSG]', err))

  // n8n webhook — Dal A: anlık WhatsApp onay, Dal B: 4 saat önce hatırlatma
  const { data: inserted } = await db
    .from('reservations')
    .select('id')
    .eq('restaurant_id', restaurantId)
    .eq('guest_phone', guestPhone)
    .eq('reserved_date', reservedDate)
    .single()

  if (inserted?.id) {
    triggerN8nReservation({
      reservation_id:      inserted.id,
      customer_name:       guestName,
      phone:               e164,
      date:                reservedDate,
      time:                reservedTime,
      party_size:          isNaN(partySize) ? 1 : partySize,
      restaurant_name:     restaurant?.name ?? '',
      restaurant_address:  (restaurant as any)?.address ?? undefined,
    }).catch(err => console.error('[n8n]', err))
  }

  return { success: true, error: null, guestName: guestName }
}
