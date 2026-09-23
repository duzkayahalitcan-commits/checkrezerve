import {
  sendReservationConfirmation,
  sendReservationReminder,
  sendSms,
  type ReservationNotificationParams,
} from '@/lib/notification-service'
import { triggerN8nReservation } from '@/lib/n8n'
import { getSupabaseAdmin } from '@/lib/supabase'

// S2-T5: Notification Orchestrator — rezervasyon olaylarında müşteri + işletme
// + n8n bildirimlerini tek noktadan, hata toleranslı (allSettled) tetikler.
// Tek bir kanalın hatası diğerlerini veya ana akışı durdurmaz.

export interface ReservationForNotify {
  id:                 string
  restaurant_id:      string
  guest_name?:        string | null
  guest_phone?:       string | null
  party_size?:        number | null
  reserved_date?:     string | null
  reserved_time?:     string | null
  cancellation_token?: string | null
}

export interface RestaurantForNotify {
  id:     string
  name:   string
  phone?: string | null
  address?: string | null
}

export type ReservationEvent = 'created' | 'confirmed' | 'cancelled' | 'reminder'

/** İşletme sahibine SMS (rezervasyon bildirimi) */
async function notifyBusinessOwnerSms(
  restaurant: RestaurantForNotify,
  reservation: ReservationForNotify,
  event: ReservationEvent,
): Promise<void> {
  const to = restaurant.phone
  if (!to) return
  const date = reservation.reserved_date ?? ''
  const time = reservation.reserved_time ?? ''
  const name = reservation.guest_name ?? 'Müşteri'
  const size = reservation.party_size ?? 1

  const body = event === 'cancelled'
    ? `İptal: ${name} (${size} kişi, ${date} ${time}) rezervasyonunu iptal etti.`
    : `Yeni rezervasyon: ${name} (${size} kişi, ${date} ${time}). ${restaurant.name}`

  try {
    await sendSms({ to, body })
  } catch (e) {
    console.error('[notify] işletme SMS hatası:', (e as Error).message)
  }
}

/**
 * Rezervasyon olayını işler:
 *  - created/confirmed → müşteriye onay SMS'i
 *  - cancelled         → müşteriye iptal SMS'i
 *  - created/cancelled → işletme sahibine SMS
 *  - tüm olaylar        → n8n webhook
 *  - reminder           → müşteriye hatırlatma
 */
export async function notifyReservationEvent(
  event: ReservationEvent,
  reservation: ReservationForNotify,
  restaurant: RestaurantForNotify,
  opts: { skipBusinessSms?: boolean } = {},
): Promise<void> {
  const tasks: Promise<unknown>[] = []

  const to = reservation.guest_phone ?? ''
  const base: ReservationNotificationParams = {
    to,
    customerName: reservation.guest_name ?? 'Müşteri',
    restaurantName: restaurant.name,
    restaurantAddress: restaurant.address ?? undefined,
    date: reservation.reserved_date ?? '',
    time: reservation.reserved_time ?? '',
    partySize: reservation.party_size ?? 1,
    cancelUrl: reservation.cancellation_token
      ? `https://checkrezerve.com/tr/rezervasyon/iptal/${reservation.cancellation_token}` // CM-01: /iptal/ yolu 404'tü
      : undefined,
  }

  // ── Müşteri bildirimleri ─────────────────────────────────────────
  if (event === 'created' || event === 'confirmed') {
    if (to) tasks.push(sendReservationConfirmation(base))
  }
  if (event === 'cancelled') {
    if (to) {
      tasks.push(sendSms({
        to,
        body: `Merhaba ${reservation.guest_name ?? ''}, rezervasyonunuz iptal edildi. Başka bir sorunuz olursa bize ulaşabilirsiniz.`,
      }).catch(() => undefined))
    }
  }
  if (event === 'reminder') {
    if (to) tasks.push(sendReservationReminder(base))
  }

  // ── İşletme sahibi bildirimleri ──────────────────────────────────
  // İşlemi işletmenin kendisi yaptıysa (panelden onay/iptal) kendine SMS atılmaz
  if (!opts.skipBusinessSms) {
    if (event === 'created') tasks.push(notifyBusinessOwnerSms(restaurant, reservation, 'created'))
    if (event === 'cancelled') tasks.push(notifyBusinessOwnerSms(restaurant, reservation, 'cancelled'))
  }

  // ── n8n (webhook) ────────────────────────────────────────────────
  tasks.push(triggerN8nReservation({
    reservation_id: reservation.id,
    customer_name: reservation.guest_name ?? '',
    phone: to,
    date: reservation.reserved_date ?? '',
    time: reservation.reserved_time ?? '',
    party_size: reservation.party_size ?? 1,
    restaurant_name: restaurant.name,
    restaurant_address: restaurant.address ?? undefined,
  }))

  // ── Tek hata tüm akışı durdurmasın ───────────────────────────────
  const results = await Promise.allSettled(tasks)
  results.forEach((r, i) => {
    if (r.status === 'rejected')
      console.error(`[notify] task ${i} failed:`, (r.reason as Error)?.message)
  })
}

// #7: Panelden durum değişikliği (onay/iptal) müşteriye bildirilir. Önceden yalnız 'created'
// olayında bildirim gidiyordu. Çağıran, durumun gerçekten değiştiğinden emin olmalı.
export async function notifyStatusChange(reservationId: string, status: string): Promise<void> {
  if (status !== 'confirmed' && status !== 'cancelled') return
  const { data: r, error } = await getSupabaseAdmin()
    .from('reservations')
    .select('id, restaurant_id, guest_name, guest_phone, party_size, reserved_date, reserved_time, cancellation_token, restaurants(id, name, phone, address)')
    .eq('id', reservationId)
    .maybeSingle()
  if (error || !r) { if (error) console.error('[notifyStatusChange]', error); return }
  const rest = (Array.isArray(r.restaurants) ? r.restaurants[0] : r.restaurants) as RestaurantForNotify | null
  if (!rest) return
  await notifyReservationEvent(status, {
    id: r.id, restaurant_id: r.restaurant_id, guest_name: r.guest_name, guest_phone: r.guest_phone,
    party_size: r.party_size, reserved_date: r.reserved_date, reserved_time: r.reserved_time,
    cancellation_token: r.cancellation_token,
  }, rest, { skipBusinessSms: true })
}
