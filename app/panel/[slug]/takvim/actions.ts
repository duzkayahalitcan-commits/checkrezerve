'use server'

import { revalidatePath } from 'next/cache'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'

async function requireSession() {
  const s = await getPanelSession()
  if (!s) throw new Error('Unauthorized')
  return s
}

/** Rezervasyon güncelle (tarih, saat, masa, personel, not) */
export async function updateReservation(
  id: string,
  data: {
    reserved_date?: string
    reserved_time?: string
    table_id?: string | null
    calisan_id?: string | null
    special_requests?: string | null
  }
) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const patch: Record<string, string | null> = {}
  if (data.reserved_date) patch.reserved_date = data.reserved_date!
  if (data.reserved_time) patch.reserved_time = data.reserved_time!
  if ('table_id' in data) patch.table_id = data.table_id ?? null
  if ('calisan_id' in data) patch.calisan_id = data.calisan_id ?? null
  if ('special_requests' in data) patch.special_requests = data.special_requests ?? null

  const { error } = await db
    .from('reservations')
    .update(patch)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/[slug]/takvim')
  return { success: true }
}

/** Soft-delete: is_deleted=true, 5 saniye icinde geri alinabilir */
export async function softDeleteReservation(id: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const { error } = await db
    .from('reservations')
    .update({ is_deleted: true })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/[slug]/takvim')
  return { success: true }
}

/** Geri al: soft-delete iptal */
export async function undoDeleteReservation(id: string) {
  const session = await requireSession()
  const db = getSupabaseAdmin()

  const { error } = await db
    .from('reservations')
    .update({ is_deleted: false })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/panel/[slug]/takvim')
  return { success: true }
}
