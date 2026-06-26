'use server'

import { revalidatePath } from 'next/cache'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'

// ─── Ortak session dogrulama ───────────────────────────────────────────────
async function requireSession() {
  const session = await getPanelSession()
  if (!session) throw new Error('Session required')
  return session
}

// ─── Adim 1: Isletme Bilgileri ──────────────────────────────────────────────
export async function saveBusinessInfo(formData: FormData) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const name    = formData.get('name') as string
  const address = formData.get('address') as string
  const phone   = formData.get('phone') as string
  const website = formData.get('website') as string

  if (!name?.trim() || !address?.trim() || !phone?.trim()) {
    return { success: false, error: 'İşletme adı, adres ve telefon zorunludur.' }
  }

  // Calisma saatleri: day_mon_open, day_mon_close, day_mon_closed, day_tue_...
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const hours: Record<string, string> = {}
  for (const d of days) {
    hours[`day_${d}_open`]   = formData.get(`day_${d}_open`)   as string ?? '09:00'
    hours[`day_${d}_close`]  = formData.get(`day_${d}_close`)  as string ?? '18:00'
    hours[`day_${d}_closed`] = formData.get(`day_${d}_closed`) === 'on' ? 'true' : 'false'
  }

  const { error } = await db
    .from('restaurants')
    .update({
      name,
      address,
      phone,
      website: website || null,
      ...hours,
    })
    .eq('id', session.restaurantId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/panel/${session.restaurantId}/onboarding/1`)
  return { success: true }
}

// ─── Adim 2: Hizmetler ──────────────────────────────────────────────────────
export async function addService(formData: FormData) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const name            = formData.get('name') as string
  const durationMinutes = parseInt(formData.get('duration_minutes') as string)
  const price           = formData.get('price') as string

  if (!name?.trim() || !durationMinutes || durationMinutes < 5) {
    return { success: false, error: 'Hizmet adı ve süre (en az 5 dk) zorunludur.' }
  }

  const { error } = await db.from('hizmetler').insert({
    restaurant_id:    session.restaurantId,
    ad:               name.trim(),
    duration_minutes: durationMinutes,
    price:            price ? parseFloat(price) : null,
    aktif:            true,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/panel/${session.restaurantId}/onboarding/2`)
  return { success: true }
}

export async function deleteService(serviceId: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const { error } = await db.from('hizmetler').delete().eq('id', serviceId).eq('restaurant_id', session.restaurantId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/panel/${session.restaurantId}/onboarding/2`)
  return { success: true }
}

// ─── Adim 3: Calisanlar ─────────────────────────────────────────────────────
export async function addStaff(formData: FormData) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const ad    = formData.get('ad') as string
  const title = formData.get('title') as string

  if (!ad?.trim()) return { success: false, error: 'Çalışan adı zorunludur.' }

  const { error } = await db.from('calisanlar').insert({
    restaurant_id: session.restaurantId,
    ad:            ad.trim(),
    unvan:         title?.trim() || null,
    aktif:         true,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/panel/${session.restaurantId}/onboarding/3`)
  return { success: true }
}

export async function deleteStaff(staffId: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const { error } = await db.from('calisanlar').delete().eq('id', staffId).eq('restaurant_id', session.restaurantId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/panel/${session.restaurantId}/onboarding/3`)
  return { success: true }
}

// ─── Adim 4: Masa / Alan ─────────────────────────────────────────────────────
export async function addTable(formData: FormData) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const ad       = formData.get('ad') as string
  const capacity = parseInt(formData.get('capacity') as string)
  const areaId   = formData.get('area_id') as string

  if (!ad?.trim() || !capacity || capacity < 1) {
    return { success: false, error: 'Masa adı ve kapasite zorunludur.' }
  }

  const { error } = await db.from('masa_tipleri').insert({
    isletme_id: session.restaurantId,
    ad:         ad.trim(),
    kapasite:   capacity,
    area_id:    areaId || null,
    aktif:      true,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/panel/${session.restaurantId}/onboarding/4`)
  return { success: true }
}

export async function deleteTable(tableId: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const { error } = await db.from('masa_tipleri').delete().eq('id', tableId).eq('isletme_id', session.restaurantId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/panel/${session.restaurantId}/onboarding/4`)
  return { success: true }
}

// ─── Adim 5: Tamamlama ──────────────────────────────────────────────────────
export async function completeOnboarding() {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const { error } = await db
    .from('restaurants')
    .update({ onboarding_completed: true })
    .eq('id', session.restaurantId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/panel/${session.restaurantId}`)
  return { success: true }
}
