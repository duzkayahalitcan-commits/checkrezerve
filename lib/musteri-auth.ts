import type { NextRequest } from 'next/server'
import type { getSupabaseAdmin } from '@/lib/supabase'
import { phoneVariants } from '@/lib/phone'

type Admin = ReturnType<typeof getSupabaseAdmin>
export type Customer = { id: string; email: string | null; phones: string[] }

/** Bearer (Supabase access token) → müşteri kimliği + eşleşme anahtarları (e-posta, telefon varyantları). */
export async function getCustomer(req: NextRequest, db: Admin): Promise<Customer | null> {
  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return null
  const { data: { user } } = await db.auth.getUser(auth.slice(7))
  if (!user) return null
  const { data: profile } = await db.from('profiles').select('phone, telefon').eq('id', user.id).maybeSingle()
  const phones = [...new Set([...phoneVariants(profile?.phone), ...phoneVariants(profile?.telefon)])]
  return { id: user.id, email: user.email?.trim().toLowerCase() ?? null, phones }
}

/**
 * reservations için PostgREST `.or()` filtresi: bu müşteriye ait kayıtlar.
 * ilike'ta `_` ve `%` joker karakterdir → kaçışlanır (a_b@x.com, axb@x.com ile eşleşmesin).
 */
export function customerReservationFilter(c: Customer): string | null {
  const parts: string[] = []
  if (c.email) {
    const safe = c.email.replace(/[,()"]/g, '').replace(/[\\%_]/g, m => `\\${m}`)
    parts.push(`guest_email.ilike.${safe}`)
  }
  if (c.phones.length) parts.push(`guest_phone.in.(${c.phones.join(',')})`)
  return parts.length ? parts.join(',') : null
}
