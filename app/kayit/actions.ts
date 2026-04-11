'use server'

import { getSupabaseAdmin } from '@/lib/supabase'

export type LeadState = { error: string | null; success: boolean }

export async function createLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const name               = (formData.get('name')               as string)?.trim()
  const phone              = (formData.get('phone')              as string)?.trim() || null
  const email              = (formData.get('email')              as string)?.trim() || null
  const category           = (formData.get('category')           as string)
  const payment_model      = (formData.get('payment_model')      as string)
  const daily_avg_bookings = parseInt(formData.get('daily_avg_bookings') as string, 10)

  if (!name)                         return { error: 'İsim zorunludur.',                     success: false }
  if (!category)                     return { error: 'Firma türü seçiniz.',                  success: false }
  if (!payment_model)                return { error: 'Hizmet modeli seçiniz.',                success: false }
  if (!daily_avg_bookings || daily_avg_bookings < 1)
                                     return { error: 'Geçerli bir randevu sayısı giriniz.',   success: false }

  const { error } = await getSupabaseAdmin()
    .from('business_leads')
    .insert({ name, phone, email, category, payment_model, daily_avg_bookings })

  if (error) return { error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.', success: false }

  return { success: true, error: null }
}
