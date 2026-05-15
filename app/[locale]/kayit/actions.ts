'use server'

import { getSupabaseAdmin } from '@/lib/supabase'

export type LeadState = { error: string | null; success: boolean }

export async function createLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const name     = (formData.get('name')     as string)?.trim()
  const phone    = (formData.get('phone')    as string)?.trim() || null
  const email    = (formData.get('email')    as string)?.trim() || null
  const category = (formData.get('category') as string)?.trim()

  if (!name)     return { error: 'Ad Soyad zorunludur.',   success: false }
  if (!category) return { error: 'Firma türü seçiniz.',    success: false }

  const { error } = await getSupabaseAdmin()
    .from('business_leads')
    .insert({ name, phone, email, category, payment_model: 'free', daily_avg_bookings: 1 })

  if (error) return { error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.', success: false }

  return { success: true, error: null }
}
