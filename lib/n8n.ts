/**
 * n8n Webhook Tetikleyici
 *
 * Yeni bir rezervasyon kaydedildiğinde bu fonksiyon çağrılır.
 * n8n workflow'u: Dal A (anlık WhatsApp onay) + Dal B (zamanlı hatırlatma)
 *
 * Ortam değişkeni: N8N_WEBHOOK_URL=https://n8n.checkrezerve.com/webhook/rezervasyon-webhook
 */

export interface ReservationWebhookPayload {
  reservation_id:      string
  customer_name:       string
  phone:               string          // E.164: +905321234567
  date:                string          // YYYY-MM-DD
  time:                string          // HH:MM
  party_size:          number
  restaurant_name:     string
  restaurant_address?: string
}

export async function triggerN8nReservation(
  payload: ReservationWebhookPayload,
): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn('[n8n] N8N_WEBHOOK_URL tanımlı değil, atlıyorum.')
    return
  }

  try {
    const res = await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[n8n] Webhook hatası ${res.status}: ${text}`)
    } else {
      console.log(`[n8n] Webhook tetiklendi: ${payload.reservation_id}`)
    }
  } catch (err) {
    // n8n erişilemese de rezervasyon kaydı iptal edilmez — sessizce geç
    console.error('[n8n] Webhook ulaşılamadı:', err)
  }
}
