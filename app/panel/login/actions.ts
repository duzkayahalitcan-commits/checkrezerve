'use server'

import { createHmac }        from 'crypto'
import { createClient }      from '@supabase/supabase-js'
import { cookies }           from 'next/headers'
import { redirect }          from 'next/navigation'
import { getSupabaseAdmin }  from '@/lib/supabase'

function hashPassword(password: string): string {
  const secret = process.env.ADMIN_SECRET
  if (!secret) throw new Error('ADMIN_SECRET is not configured')
  return createHmac('sha256', secret).update(password).digest('hex')
}

function makeSessionToken(userId: string, restaurantId: string): string {
  const secret  = process.env.ADMIN_SECRET
  if (!secret) throw new Error('ADMIN_SECRET is not configured')
  const payload = `${userId}:${restaurantId}`
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

async function setSessionCookie(userId: string, restaurantId: string, role: string, remember = true) {
  const token         = makeSessionToken(userId, restaurantId)
  const cookiePayload = `${userId}:${restaurantId}:${role}:${token}`
  const jar           = await cookies()
  jar.set('cr_panel', cookiePayload, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    ...(remember ? { maxAge: 60 * 60 * 24 * 7 } : {}),
    path:     '/',
  })
}

export type PanelLoginState = { error: 'errorRequired' | 'errorInvalid' | null }

export async function panelLoginAction(
  _prev: PanelLoginState,
  formData: FormData,
): Promise<PanelLoginState> {
  const username   = (formData.get('username') as string)?.trim()
  const password   = (formData.get('password') as string)?.trim()
  const rememberMe = formData.get('rememberMe') === 'on'

  if (!username || !password) {
    return { error: 'errorRequired' as const }
  }

  await new Promise(r => setTimeout(r, 300)) // brute-force gecikmesi

  const db = getSupabaseAdmin()

  // ── 1. restaurant_users tablosu (eski kullanıcı adı sistemi) ─────────────
  const { data: panelUser } = await db
    .from('restaurant_users')
    .select('id, restaurant_id, password_hash, is_active, role')
    .eq('username', username)
    .single()

  if (panelUser && panelUser.is_active && panelUser.password_hash === hashPassword(password)) {
    await setSessionCookie(panelUser.id, panelUser.restaurant_id, panelUser.role ?? 'business_manager', rememberMe)
    const { data: restaurant } = await db.from('restaurants').select('slug').eq('id', panelUser.restaurant_id).single()
    redirect(`/panel/${restaurant?.slug ?? ''}`)
  }

  // ── 2. Supabase Auth (e-posta ile giriş) ─────────────────────────────────
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email:    username,
    password,
  })

  if (authError || !authData.user) {
    return { error: 'errorInvalid' as const }
  }

  const { data: profile } = await db
    .from('profiles')
    .select('isletme_id, role')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (!profile?.isletme_id) {
    return { error: 'errorInvalid' as const }
  }

  // isletme_admin / isletme_calisan → panel rol etiketlerine eşle
  const roleMap: Record<string, string> = {
    isletme_admin:   'business_owner',
    isletme_calisan: 'business_manager',
    super_admin:     'super_admin',
  }
  const role = roleMap[profile.role] ?? profile.role ?? 'business_manager'

  await setSessionCookie(authData.user.id, profile.isletme_id, role, rememberMe)

  const { data: restaurant } = await db.from('restaurants').select('slug').eq('id', profile.isletme_id).single()
  redirect(`/panel/${restaurant?.slug ?? ''}`)
}

// ─── Cookie doğrulama ────────────────────────────────────────────────────────
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
  if (parts.length < 4) return null

  const [userId, restaurantId, role, ...tokenParts] = parts
  const token    = tokenParts.join(':')
  const expected = makeSessionToken(userId, restaurantId)

  if (token !== expected) return null
  return { userId, restaurantId, role }
}
