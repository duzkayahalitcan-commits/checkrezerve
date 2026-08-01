import {
  sendReservationConfirmation,
  sendReservationReminder,
  sendSms,
  type ReservationNotificationParams,
} from '@/lib/notification-service'
import { triggerN8nReservation } from '@/lib/n8n'

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
      ? `https://checkrezerve.com/iptal/${reservation.cancellation_token}`
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
  if (event === 'created') tasks.push(notifyBusinessOwnerSms(restaurant, reservation, 'created'))
  if (event === 'cancelled') tasks.push(notifyBusinessOwnerSms(restaurant, reservation, 'cancelled'))

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
