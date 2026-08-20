'use server'

import { getSupabaseAdmin } from '@/lib/supabase'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export type LeadState = { error: string | null; success: boolean }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

export async function createLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const name        = (formData.get('name')        as string)?.trim()
  const phone       = (formData.get('phone')       as string)?.trim()
  const countryCode = (formData.get('countryCode') as string)?.trim() || 'TR'
  const email       = (formData.get('email')       as string)?.trim()
  const category    = (formData.get('category')    as string)?.trim()
  const kvkk        = formData.get('kvkk') as string | null

  if (!name)     return { error: 'İşletme adı zorunludur.',      success: false }
  if (!category) return { error: 'Firma türü seçiniz.',          success: false }
  if (kvkk !== 'on') {
    return { error: 'KVKK Aydınlatma Metni\'ni onaylamanız gerekmektedir.', success: false }
  }

  if (!phone) return { error: 'Telefon numarası zorunludur.', success: false }
  const parsed = parsePhoneNumberFromString(phone, countryCode as never)
  if (!parsed || !parsed.isValid()) {
    return { error: 'Lütfen geçerli bir telefon numarası giriniz.', success: false }
  }

  if (!email) return { error: 'E-posta adresi zorunludur.', success: false }
  if (!EMAIL_RE.test(email)) {
    return { error: 'Geçerli bir e-posta adresi giriniz. (Örn: isim@sirket.com)', success: false }
  }
  const localPart = email.split('@')[0]
  if (/^\d+$/.test(localPart)) {
    return { error: 'Geçerli bir e-posta adresi giriniz. (Örn: isim@sirket.com)', success: false }
  }

  const { error } = await getSupabaseAdmin()
    .from('business_leads')
    .insert({ name, phone: parsed.number, email, category, payment_model: 'free', daily_avg_bookings: 1, kvkk_onay_tarihi: new Date().toISOString() })

  if (error) return { error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.', success: false }

  const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL
  if (N8N_WEBHOOK) {
    fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: parsed.number, email, category, source: 'checkrezerve_kayit' }),
    }).catch(() => {})
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (token && chatId) {
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🆕 Yeni Demo Talebi!\n\n🏢 İşletme: ${name}\n📞 Telefon: ${parsed.number}\n📧 Email: ${email}\n📂 Firma Türü: ${category}\n⏰ ${new Date().toLocaleString('tr-TR')}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {})
  }

  return { success: true, error: null }
}
