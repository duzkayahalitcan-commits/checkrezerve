'use server'

import { getSupabaseAdmin } from '@/lib/supabase'

export type BasvuruState = { error: string | null; success: boolean }

export async function createBasvuru(
  _prev: BasvuruState,
  formData: FormData,
): Promise<BasvuruState> {
  const business_name = (formData.get('business_name') as string)?.trim()
  const category      = (formData.get('category')      as string)?.trim()
  const name          = (formData.get('name')           as string)?.trim()
  const phone         = (formData.get('phone')          as string)?.trim() || null
  const email         = (formData.get('email')          as string)?.trim() || null
  const city          = (formData.get('city')           as string)?.trim() || null
  const message       = (formData.get('message')        as string)?.trim() || null

  if (!business_name) return { error: 'İşletme adı zorunludur.', success: false }
  if (!category)      return { error: 'Sektör seçiniz.',          success: false }
  if (!name)          return { error: 'Ad Soyad zorunludur.',      success: false }

  const notes = [
    business_name ? `İşletme: ${business_name}` : null,
    city          ? `Şehir: ${city}`             : null,
    message       ? `Mesaj: ${message}`           : null,
  ].filter(Boolean).join(' | ')

  const { error } = await getSupabaseAdmin()
    .from('business_leads')
    .insert({
      name,
      phone,
      email,
      category,
      payment_model: 'free',
      daily_avg_bookings: 1,
      notes,
    })

  if (error) return { error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.', success: false }

  return { success: true, error: null }
}
