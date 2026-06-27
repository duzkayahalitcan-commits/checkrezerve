'use server'

import { revalidatePath } from 'next/cache'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'

async function requireSession() {
  const s = await getPanelSession()
  if (!s) throw new Error('Unauthorized')
  return s
}

// ─── Şablon CRUD ────────────────────────────────────────────────────────────

export async function saveTemplate(formData: FormData) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const id = formData.get('id') as string | null
  const ad = formData.get('ad') as string
  const icerik = formData.get('icerik') as string
  const tip = formData.get('tip') as string

  if (!ad?.trim() || !icerik?.trim()) return { success: false, error: 'Ad ve içerik zorunludur' }

  const payload = { isletme_id: session.restaurantId, ad: ad.trim(), icerik: icerik.trim(), tip: tip || 'sms' }

  if (id) {
    const { error } = await db.from('bildirim_sablonlari').update(payload).eq('id', id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await db.from('bildirim_sablonlari').insert(payload)
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true }
}

export async function deleteTemplate(id: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()
  const { error } = await db.from('bildirim_sablonlari').delete().eq('id', id).eq('isletme_id', session.restaurantId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true }
}

// ─── Manuel bildirim gönder ─────────────────────────────────────────────────

export async function sendNotification(formData: FormData) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const tip = formData.get('tip') as string
  const alici = formData.get('alici') as string
  const mesaj = formData.get('mesaj') as string

  if (!mesaj?.trim()) return { success: false, error: 'Mesaj zorunludur' }

  // Log'a kaydet
  const { error } = await db.from('bildirim_log').insert({
    isletme_id: session.restaurantId,
    tip: tip || 'sms',
    alici: alici || 'manuel',
    mesaj: mesaj.trim(),
    durum: 'pending',
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true }
}

// ─── Tekrar gönder ──────────────────────────────────────────────────────────

export async function resendNotification(id: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const { error } = await db.from('bildirim_log').update({ durum: 'pending', hata_mesaji: null }).eq('id', id).eq('isletme_id', session.restaurantId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/[slug]/bildirimler')
  return { success: true }
}
