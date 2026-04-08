/**
 * Bildirim Servisi — SMS sağlayıcı soyutlama katmanı
 *
 * Desteklenen sağlayıcılar:
 *   - twilio  : Uluslararası, güvenilir (varsayılan)
 *   - netgsm  : Türkiye yerel, uygun maliyetli
 *   - disabled: Bildirim kapalı (geliştirme ortamı)
 *
 * Ortam değişkeni: SMS_PROVIDER=twilio|netgsm|disabled
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
  date:         string  // YYYY-MM-DD
  time:         string  // HH:MM
  partySize:    number
}

// ── Sağlayıcı arayüzü ────────────────────────────────────────────────────────
interface SmsProvider {
  send(payload: SmsPayload): Promise<SmsResult>
}

// ── Twilio sağlayıcısı ────────────────────────────────────────────────────────
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
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`
    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')

    const res = await fetch(url, {
      method:  'POST',
      headers: {
        Authorization:  `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: this.fromNumber, Body: body }),
    })

    const data = await res.json() as { sid?: string; message?: string }

    if (!res.ok) {
      return { success: false, error: data.message ?? `HTTP ${res.status}` }
    }
    return { success: true, messageId: data.sid }
  }
}

// ── Netgsm sağlayıcısı (Türkiye) ─────────────────────────────────────────────
class NetgsmProvider implements SmsProvider {
  private usercode:   string
  private password:   string
  private msgheader:  string

  constructor() {
    this.usercode  = process.env.NETGSM_USERCODE   ?? ''
    this.password  = process.env.NETGSM_PASSWORD   ?? ''
    this.msgheader = process.env.NETGSM_MSGHEADER  ?? ''

    if (!this.usercode || !this.password || !this.msgheader) {
      throw new Error('Netgsm env vars eksik: NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_MSGHEADER')
    }
  }

  async send({ to, body }: SmsPayload): Promise<SmsResult> {
    // Netgsm XML API
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
    // Netgsm başarılı yanıt: "00 <msgId>" veya "01 <msgId>"
    const success = text.startsWith('00') || text.startsWith('01')
    return success
      ? { success: true, messageId: text.trim().split(' ')[1] }
      : { success: false, error: text.trim() }
  }
}

// ── Disabled (geliştirme / test) sağlayıcısı ─────────────────────────────────
class DisabledProvider implements SmsProvider {
  async send({ to, body }: SmsPayload): Promise<SmsResult> {
    console.log(`[SMS disabled] to=${to}\n${body}`)
    return { success: true, messageId: 'disabled' }
  }
}

// ── Fabrika fonksiyonu ────────────────────────────────────────────────────────
function createProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER ?? 'disabled'
  switch (provider) {
    case 'twilio':  return new TwilioProvider()
    case 'netgsm':  return new NetgsmProvider()
    default:        return new DisabledProvider()
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function sendSms(payload: SmsPayload): Promise<SmsResult> {
  const provider = createProvider()
  return provider.send(payload)
}

export async function sendReservationConfirmation(
  params: ReservationNotificationParams
): Promise<SmsResult> {
  const { to, customerName, date, time, partySize } = params

  // Tarihi okunabilir formata çevir
  const formattedDate = date
    ? new Date(date).toLocaleDateString('tr-TR', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : ''

  const body = [
    `Merhaba ${customerName},`,
    `checkrezerve rezervasyonunuz onaylandı! ✅`,
    `📅 ${formattedDate}${time ? ` — ${time}` : ''}`,
    `👥 ${partySize} kişi`,
    `Sorularınız için bizi arayabilirsiniz.`,
  ].join('\n')

  return sendSms({ to, body })
}
