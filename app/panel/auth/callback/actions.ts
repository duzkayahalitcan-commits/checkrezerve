'use server'

import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'

function makeSessionToken(userId: string, restaurantId: string): string {
  const secret = process.env.ADMIN_SECRET! // S1-T3: fallback yok — env zorunlu
  return createHmac('sha256', secret).update(`${userId}:${restaurantId}`).digest('base64url')
}

type CookieResult =
  | { success: true; slug: string }
  | { success: false; error: string }

export async function setPanelSessionCookie(userId: string): Promise<CookieResult> {
  const db = getSupabaseAdmin()

  const { data: profile } = await db
    .from('profiles')
    .select('isletme_id, role')
    .eq('id', userId)
    .maybeSingle()

  if (!profile?.isletme_id) {
    return { success: false, error: 'no_business' }
  }

  const roleMap: Record<string, string> = {
    isletme_admin:   'business_owner',
    isletme_calisan: 'business_manager',
    super_admin:     'super_admin',
  }
  const role = roleMap[profile.role] ?? profile.role ?? 'business_manager'
  const token = makeSessionToken(userId, profile.isletme_id)
  const cookiePayload = `${userId}:${profile.isletme_id}:${role}:${token}`

  const jar = await cookies()
  jar.set('cr_panel', cookiePayload, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 7,
    path:     '/',
  })

  const { data: restaurant } = await db
    .from('restaurants')
    .select('slug')
    .eq('id', profile.isletme_id)
    .single()

  return { success: true, slug: restaurant?.slug ?? '' }
}
