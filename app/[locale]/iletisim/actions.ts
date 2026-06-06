'use server'

import { getSupabaseAdmin } from '@/lib/supabase'

export type ContactState = { error: string | null; success: boolean }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const firstName    = (formData.get('firstName')    as string)?.trim()
  const lastName     = (formData.get('lastName')     as string)?.trim()
  const email        = (formData.get('email')        as string)?.trim()
  const businessName = (formData.get('businessName') as string)?.trim()
  const message      = (formData.get('message')      as string)?.trim()

  if (!firstName || firstName.length < 2)    return { error: 'Ad alanı zorunludur (en az 2 karakter).', success: false }
  if (!lastName || lastName.length < 2)      return { error: 'Soyad alanı zorunludur (en az 2 karakter).', success: false }
  if (!email || !EMAIL_RE.test(email))       return { error: 'Geçerli bir e-posta adresi giriniz.', success: false }
  if (!businessName || businessName.length < 2) return { error: 'İşletme adı zorunludur (en az 2 karakter).', success: false }
  if (!message || message.length < 10)       return { error: 'Mesaj alanı zorunludur (en az 10 karakter).', success: false }

  const fullName = `${firstName} ${lastName}`
  const notes = `İletişim formu\nAd Soyad: ${fullName}\nMesaj: ${message}`

  const { error } = await getSupabaseAdmin()
    .from('business_leads')
    .insert({
      name: fullName,
      email,
      category: 'İletişim',
      payment_model: 'free',
      daily_avg_bookings: 1,
      notes,
    })

  if (error) return { error: 'Gönderim sırasında bir hata oluştu. Lütfen tekrar deneyin.', success: false }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (token && chatId) {
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `📩 Yeni İletişim Mesajı!\n\n👤 Ad Soyad: ${fullName}\n📧 Email: ${email}\n🏢 İşletme: ${businessName}\n💬 Mesaj: ${message}\n⏰ ${new Date().toLocaleString('tr-TR')}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {})
  }

  return { success: true, error: null }
}
