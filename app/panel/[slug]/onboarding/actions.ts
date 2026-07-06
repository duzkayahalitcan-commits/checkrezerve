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

  // ─── W-92: Server-side validasyon ─────────────────────────────────────────
  const errors: string[] = []

  // İşletme adı: en az 2 karakter
  if (!name?.trim() || name.trim().length < 2) {
    errors.push('İşletme adı en az 2 karakter olmalıdır.')
  }

  // Adres: en az 5 karakter
  if (!address?.trim() || address.trim().length < 5) {
    errors.push('Adres en az 5 karakter olmalıdır.')
  }

  // Telefon: Türkiye formatı (05XX XXX XX XX veya +905XX XXX XX XX)
  const phoneClean = phone?.replace(/\s/g, '') ?? ''
  const phoneTR = /^(0\d{10}|\+90\d{10})$/
  if (!phoneClean || !phoneTR.test(phoneClean)) {
    errors.push('Telefon numarası geçerli değil. (05XX XXX XX XX veya +90 5XX XXX XX XX)')
  }

  // Web sitesi: boşsa sorun değil, doluysa geçerli URL olmalı
  if (website?.trim()) {
    try {
      const url = new URL(website)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      errors.push('Web sitesi geçerli bir URL değil. (https:// ile başlamalı)')
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors[0] }
  }

  // ─── W-91: Çalışma saatleri — Switch → working_hours JSONB mapping ────────
  // Mapping (TEK YERDE, YORUM SATIRLI):
  //   Switch "Açık" (day_N_open=true)  →  working_hours.day.open = true   (işletme açık)
  //   Switch "Kapalı" (day_N_open=false) → working_hours.day.open = false (işletme kapalı)
  //   Saat inputları sadece "Açık" iken gönderilir, "Kapalı" iken placeholder gelir.
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const daysShort = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  const workingHours: Record<string, { open: boolean; start: string; end: string }> = {}

  for (let i = 0; i < days.length; i++) {
    const d = days[i]
    const ds = daysShort[i]

    // Switch: "day_N_open" varsa ve "on" ise o gün AÇIK (open: true)
    // Varsayılan: açık (checkbox işaretli değilse formData'da hiç gelmez, o zaman açık kabul edilir)
    const isOpen = formData.get(`day_${ds}_open`) === 'on'

    if (isOpen) {
      // Gün AÇIK → saatleri oku, validasyon yap
      const start = (formData.get(`day_${ds}_start`) as string) || '09:00'
      const end   = (formData.get(`day_${ds}_end`) as string)   || '18:00'

      if (start >= end) {
        return {
          success: false,
          error: `${dayNames[i]} için kapanış saati (${end}) açılış saatinden (${start}) önce olamaz.`,
        }
      }

      workingHours[d] = { open: true, start, end }
    } else {
      // Gün KAPALI → open: false, saat placeholder (kaydedilmez, okunurken yok sayılır)
      workingHours[d] = { open: false, start: '09:00', end: '18:00' }
    }
  }

  const { error } = await db
    .from('restaurants')
    .update({
      name,
      address,
      phone,
      website: website || null,
      working_hours: workingHours,
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
  const sureDakika      = parseInt(formData.get('sure_dakika') as string)
  const fiyat           = formData.get('fiyat') as string

  if (!name?.trim() || !sureDakika || sureDakika < 5) {
    return { success: false, error: 'Hizmet adı ve süre (en az 5 dk) zorunludur.' }
  }

  // NOT: DB kolonları sure_dakika / fiyat (duration_minutes / price DEĞİL)
  const { error } = await db.from('hizmetler').insert({
    restaurant_id:    session.restaurantId,
    ad:               name.trim(),
    sure_dakika:      sureDakika,
    fiyat:            fiyat ? parseFloat(fiyat) : null,
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
