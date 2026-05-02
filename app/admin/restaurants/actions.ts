'use server'

import { revalidatePath } from 'next/cache'
import { createHmac }    from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

export type RestaurantState = { error: string | null; success: boolean }

function hashPassword(password: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret-change-me'
  return createHmac('sha256', secret).update(password).digest('hex')
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createRestaurant(
  _prev: RestaurantState,
  formData: FormData
): Promise<RestaurantState> {
  const name          = (formData.get('name')          as string)?.trim()
  const phone         = (formData.get('phone')         as string)?.trim() || null
  const address       = (formData.get('address')       as string)?.trim() || null
  const capacity      = parseInt(formData.get('capacity') as string, 10) || 50
  const business_type = (formData.get('business_type') as string) || 'restaurant'
  const instagram     = (formData.get('instagram')     as string)?.trim() || null
  const website       = (formData.get('website')       as string)?.trim() || null
  const booking_duration_minutes = parseInt(formData.get('booking_duration_minutes') as string, 10) || 60

  if (!name) return { error: 'İşletme adı zorunludur.', success: false }

  const slug = toSlug(name)

  const { error } = await getSupabaseAdmin()
    .from('restaurants')
    .insert({ name, slug, phone, address, capacity, business_type, instagram, website, booking_duration_minutes })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Bu isimde bir işletme zaten var.', success: false }
    }
    return { error: 'Kayıt sırasında hata oluştu.', success: false }
  }

  revalidatePath('/admin')
  return { success: true, error: null }
}

export async function createRestaurantUser(
  _prev: RestaurantState,
  formData: FormData,
): Promise<RestaurantState> {
  const restaurant_id = (formData.get('restaurant_id') as string)?.trim()
  const username      = (formData.get('username')      as string)?.trim()
  const password      = (formData.get('password')      as string)?.trim()
  const role          = (formData.get('role')          as string) || 'business_manager'

  if (!restaurant_id) return { error: 'Restoran seçiniz.',          success: false }
  if (!username)      return { error: 'Kullanıcı adı zorunludur.',  success: false }
  if (!password || password.length < 8)
                      return { error: 'Şifre en az 8 karakter olmalıdır.', success: false }

  const { error } = await getSupabaseAdmin()
    .from('restaurant_users')
    .insert({ restaurant_id, username, password_hash: hashPassword(password), role })

  if (error) {
    if (error.code === '23505') return { error: 'Bu kullanıcı adı zaten alınmış.', success: false }
    return { error: 'Kayıt sırasında hata oluştu.', success: false }
  }

  revalidatePath('/admin')
  return { success: true, error: null }
}
