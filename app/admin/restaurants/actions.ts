'use server'

import { revalidatePath } from 'next/cache'
import { cookies }       from 'next/headers'
import { createHmac }    from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

export type RestaurantState = { error: string | null; success: boolean }

function hashPassword(password: string): string {
  const secret = process.env.ADMIN_SECRET! // S1-T3: fallback yok — env zorunlu
  return createHmac('sha256', secret).update(password).digest('hex')
}

// Server action'lar herkese açık POST uç noktasıdır; /admin proxy korumasına ek olarak
// admin oturumu burada da doğrulanır (app/api/admin/* ile aynı cr_admin kontrolü).
async function isAdmin(): Promise<boolean> {
  const adminSecret   = process.env.ADMIN_SECRET ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!adminSecret || !adminPassword) return false
  const token = (await cookies()).get('cr_admin')?.value ?? ''
  if (!token) return false
  return token === createHmac('sha256', adminSecret).update(adminPassword).digest('base64')
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
  if (!await isAdmin()) return { error: 'Yetkisiz.', success: false }
  const name          = (formData.get('name')          as string)?.trim()
  const phone         = (formData.get('phone')         as string)?.trim() || null
  const address       = (formData.get('address')       as string)?.trim() || null
  const capacity      = parseInt(formData.get('capacity') as string, 10) || 50
  const business_type = (formData.get('business_type') as string)?.trim() || null
  const instagram     = (formData.get('instagram')     as string)?.trim() || null
  const website       = (formData.get('website')       as string)?.trim() || null
  const booking_duration_minutes = parseInt(formData.get('booking_duration_minutes') as string, 10) || 60

  if (!name) return { error: 'İşletme adı zorunludur.', success: false }
  if (!business_type) return { error: 'İşletme kategorisi seçilmedi. Lütfen bir kategori seçin.', success: false }

  const slug = toSlug(name)

  const BUSINESS_TYPE_TO_KATEGORI: Record<string, string> = {
    restaurant:    'restoran',
    barber:        'berber',
    hairdresser:   'kuafor',
    spa:           'spa',
    beauty_salon:  'guzellik_salonu',
    fitness:       'fitness',
    pilates:       'pilates',
    chiropractor:  'diger',
    psychologist:  'diger',
    veterinary:    'diger',
    dentist:       'diger',
    other:         'diger',
  }
  const kategori = BUSINESS_TYPE_TO_KATEGORI[business_type]
  if (!kategori) return { error: `Geçersiz işletme kategorisi: ${business_type}. Lütfen geçerli bir kategori seçin.`, success: false }

  const { error } = await getSupabaseAdmin()
    .from('restaurants')
    .insert({ name, slug, phone, address, capacity, business_type, instagram, website, booking_duration_minutes, kategori })

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
  if (!await isAdmin()) return { error: 'Yetkisiz.', success: false }
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
