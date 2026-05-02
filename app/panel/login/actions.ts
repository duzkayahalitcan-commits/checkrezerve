'use server'

import { createHmac } from 'crypto'
import { cookies }    from 'next/headers'
import { redirect }   from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'

function hashPassword(password: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret-change-me'
  return createHmac('sha256', secret).update(password).digest('hex')
}

function makeSessionToken(userId: string, restaurantId: string): string {
  const secret  = process.env.ADMIN_SECRET ?? 'dev-secret-change-me'
  const payload = `${userId}:${restaurantId}`
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export type PanelLoginState = { error: string | null }

export async function panelLoginAction(
  _prev: PanelLoginState,
  formData: FormData,
): Promise<PanelLoginState> {
  const username = (formData.get('username') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!username || !password) {
    return { error: 'Kullanıcı adı ve şifre zorunludur.' }
  }

  await new Promise(r => setTimeout(r, 300)) // brute-force gecikmesi

  const db = getSupabaseAdmin()
  const { data: user } = await db
    .from('restaurant_users')
    .select('id, restaurant_id, password_hash, is_active, role')
    .eq('username', username)
    .single()

  if (!user || !user.is_active || user.password_hash !== hashPassword(password)) {
    return { error: 'Kullanıcı adı veya şifre hatalı.' }
  }

  const token = makeSessionToken(user.id, user.restaurant_id)
  const cookiePayload = `${user.id}:${user.restaurant_id}:${user.role ?? 'business_manager'}:${token}`

  const jar = await cookies()
  jar.set('cr_panel', cookiePayload, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 7, // 7 gün
    path:     '/panel',
  })

  // Restoranın slug'ını al
  const { data: restaurant } = await db
    .from('restaurants')
    .select('slug')
    .eq('id', user.restaurant_id)
    .single()

  redirect(`/panel/${restaurant?.slug ?? ''}`)
}

// ─── Cookie doğrulama (panel sayfalarında kullanılır) ────────────────────────
export type PanelSession = {
  userId:       string
  restaurantId: string
  role:         string
} | null

export async function getPanelSession(): Promise<PanelSession> {
  const jar   = await cookies()
  const raw   = jar.get('cr_panel')?.value
  if (!raw) return null

  const parts = raw.split(':')
  // Format: userId:restaurantId:role:token  (4+ parts)
  // Legacy format had 3 parts — force re-login by rejecting
  if (parts.length < 4) return null

  const [userId, restaurantId, role, ...tokenParts] = parts
  const token    = tokenParts.join(':')
  const expected = makeSessionToken(userId, restaurantId)

  if (token !== expected) return null
  return { userId, restaurantId, role }
}
