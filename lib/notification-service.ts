/**
 * Bildirim Servisi — Mesajlaşma sağlayıcı soyutlama katmanı
 *
 * Desteklenen sağlayıcılar:
 *   - whatsapp : Twilio WhatsApp API (aktif)
 *   - twilio   : Twilio SMS (Türkiye'de kısıtlı)
 *   - netgsm   : Türkiye yerel SMS
 *   - mock     : Test — mesajlar Supabase'e kaydedilir
 *   - disabled : Bildirim kapalı
 *
 * Ortam değişkeni: SMS_PROVIDER=whatsapp|twilio|netgsm|mock|disabled
 */

// ── Tip tanımları ─────────────────────────────────────────────────────────────
export interface SmsPayload {
  to:   string   // E.164 formatı: +905321234567
  body: string
}

export interface SmsResult {
  success:    boolean
  messageId?: string
  error?:     string
}

export interface ReservationNotificationParams {
  to:           string
  customerName: string
  restaurantName?: string
  date:         string  // YYYY-MM-DD
  time:         string  // HH:MM
  partySize:    number
}

// ── Sağlayıcı arayüzü ────────────────────────────────────────────────────────
interface SmsProvider {
  send(payload: SmsPayload): Promise<SmsResult>
}

// ── Twilio yardımcısı (SMS ve WhatsApp ortak) ─────────────────────────────────
async function twilioSend(
  accountSid: string,
  authToken:  string,
  from:       string,
  to:         string,
  body:       string,
): Promise<SmsResult> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  })

  const data = await res.json() as { sid?: string; message?: string }
  if (!res.ok) return { success: false, error: data.message ?? `HTTP ${res.status}` }
  return { success: true, messageId: data.sid }
}

// ── Twilio WhatsApp sağlayıcısı ───────────────────────────────────────────────
class WhatsAppProvider implements SmsProvider {
  private accountSid:  string
  private authToken:   string
  private fromNumber:  string  // "whatsapp:+14155238886"

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID      ?? ''
    this.authToken  = process.env.TWILIO_AUTH_TOKEN       ?? ''
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER  ?? ''

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('WhatsApp env vars eksik: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER')
    }
  }

  async send({ to, body }: SmsPayload): Promise<SmsResult> {
    // Alıcıya "whatsapp:" prefix'i ekle
    const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    return twilioSend(this.accountSid, this.authToken, this.fromNumber, toWhatsApp, body)
  }
}

// ── Twilio SMS sağlayıcısı ────────────────────────────────────────────────────
class TwilioProvider implements SmsProvider {
  private accountSid: string
  private authToken:  string
  private fromNumber: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID ?? ''
    this.authToken  = process.env.TWILIO_AUTH_TOKEN  ?? ''
    this.fromNumber = process.env.TWILIO_FROM_NUMBER ?? ''

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio env vars eksik: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER')
    }
  }

  async send({ to, body }: SmsPayload): Promise<SmsResult> {
    return twilioSend(this.accountSid, this.authToken, this.fromNumber, to, body)
  }
}

// ── Netgsm sağlayıcısı (Türkiye) ─────────────────────────────────────────────
class NetgsmProvider implements SmsProvider {
  private usercode:  string
  private password:  string
  private msgheader: string

  constructor() {
    this.usercode  = process.env.NETGSM_USERCODE  ?? ''
    this.password  = process.env.NETGSM_PASSWORD  ?? ''
    this.msgheader = process.env.NETGSM_MSGHEADER ?? ''

    if (!this.usercode || !this.password || !this.msgheader) {
      throw new Error('Netgsm env vars eksik: NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_MSGHEADER')
    }
  }

  async send({ to, body }: SmsPayload): Promise<SmsResult> {
    const gsm = to.replace(/^\+90/, '0').replace(/\s/g, '')
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <usercode>${this.usercode}</usercode>
    <password>${this.password}</password>
    <msgheader>${this.msgheader}</msgheader>
    <type>1:n</type>
  </header>
  <body>
    <msg><![CDATA[${body}]]></msg>
    <no>${gsm}</no>
  </body>
</mainbody>`

    const res = await fetch('https://api.netgsm.com.tr/sms/send/xml', {
      method:  'POST',
      headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
      body:    xml,
    })

    const text = await res.text()
    const success = text.startsWith('00') || text.startsWith('01')
    return success
      ? { success: true, messageId: text.trim().split(' ')[1] }
      : { success: false, error: text.trim() }
  }
}

// ── Mock (test) sağlayıcısı — mesajları Supabase'e kaydeder ──────────────────
class MockProvider implements SmsProvider {
  async send({ to, body }: SmsPayload): Promise<SmsResult> {
    const mockId = `mock_${Date.now()}`
    console.log(`[MSG mock] to=${to}\n${body}`)

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (url && key) {
        await fetch(`${url}/rest/v1/sms_logs`, {
          method:  'POST',
          headers: {
            apikey:         key,
            Authorization:  `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ provider: 'mock', to_number: to, body, status: 'simulated' }),
        })
      }
    } catch { /* sessizce geç */ }

    return { success: true, messageId: mockId }
  }
}

// ── Disabled sağlayıcısı ──────────────────────────────────────────────────────
class DisabledProvider implements SmsProvider {
  async send({ to, body }: SmsPayload): Promise<SmsResult> {
    console.log(`[MSG disabled] to=${to}\n${body}`)
    return { success: true, messageId: 'disabled' }
  }
}

// ── Fabrika fonksiyonu ────────────────────────────────────────────────────────
function createProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER ?? 'disabled'
  switch (provider) {
    case 'whatsapp': return new WhatsAppProvider()
    case 'twilio':   return new TwilioProvider()
    case 'netgsm':   return new NetgsmProvider()
    case 'mock':     return new MockProvider()
    default:         return new DisabledProvider()
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function sendSms(payload: SmsPayload): Promise<SmsResult> {
  return createProvider().send(payload)
}

export interface ReservationNotificationParams {
  to:             string
  customerName:   string
  restaurantName?: string
  restaurantAddress?: string  // Google Maps linki için
  date:           string      // YYYY-MM-DD
  time:           string      // HH:MM
  partySize:      number
  cancelUrl?:     string      // İptal linki (hatırlatma mesajında kullanılır)
}

export async function sendReservationConfirmation(
  params: ReservationNotificationParams
): Promise<SmsResult> {
  const { to, customerName, restaurantName, restaurantAddress, date, time, partySize } = params

  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('tr-TR', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : ''

  // Google Maps linki (adres varsa)
  const mapsUrl = restaurantAddress
    ? `https://maps.google.com/?q=${encodeURIComponent(restaurantAddress)}`
    : null

  const lines = [
    `Merhaba ${customerName} 👋`,
    ``,
    `✅ *Rezervasyonunuz onaylandı!*`,
    restaurantName ? `🍽️ *${restaurantName}*` : `🍽️ *checkrezerve*`,
    ``,
    `📅 ${formattedDate}${time ? `  •  🕐 ${time}` : ''}`,
    `👥 ${partySize} kişi`,
    ``,
    mapsUrl ? `📍 Konum: ${mapsUrl}` : null,
    ``,
    `Değişiklik veya iptal için lütfen restoranı arayın.`,
    ``,
    `_checkrezerve ile rezerve edildi._`,
  ].filter(l => l !== null)

  return sendSms({ to, body: lines.join('\n') })
}

// ─── Hatırlatma Mesajı (rezervasyon günü sabahı gönderilir) ─────────────────
export async function sendReservationReminder(
  params: ReservationNotificationParams
): Promise<SmsResult> {
  const { to, customerName, restaurantName, restaurantAddress, time, partySize, cancelUrl } = params

  const mapsUrl = restaurantAddress
    ? `https://maps.google.com/?q=${encodeURIComponent(restaurantAddress)}`
    : null

  const lines = [
    `Merhaba ${customerName} 👋`,
    ``,
    `🔔 *Bugün rezervasyonunuz var!*`,
    restaurantName ? `🍽️ *${restaurantName}*` : `🍽️ *checkrezerve*`,
    ``,
    `🕐 Saat: ${time ?? '—'}`,
    `👥 ${partySize} kişi`,
    ``,
    mapsUrl    ? `📍 Konum için: ${mapsUrl}`       : null,
    cancelUrl  ? `❌ İptal etmek için: ${cancelUrl}` : null,
    ``,
    `Görüşmek üzere! 😊`,
  ].filter(l => l !== null)

  return sendSms({ to, body: lines.join('\n') })
}
