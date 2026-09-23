import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyPanelToken } from '@/lib/middleware-auth'

export function verifySession(raw: string): { userId: string; restaurantId: string; role: string } | null {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return null
  const result = verifyPanelToken(raw, secret)
  if (!result) return null
  return { userId: result.userId, restaurantId: result.restaurantId, role: result.role ?? '' }
}

const PANEL_ROLES = ['super_admin', 'business_owner', 'business_manager']

// Resolves session from either cr_panel cookie (web) or Authorization: Bearer <jwt> (mobile)
export async function resolveApiSession(
  req: NextRequest,
  cookieJar: { get: (name: string) => { value: string } | undefined },
): Promise<{ userId: string; restaurantId: string; role?: string } | null> {
  const cookieSession = verifySession(cookieJar.get('cr_panel')?.value ?? '')
  if (cookieSession) return cookieSession

  const auth  = req.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/)
  if (!match) return null

  const db = getSupabaseAdmin()
  const { data: { user }, error } = await db.auth.getUser(match[1])
  if (error || !user) return null

  const { data: profile } = await db
    .from('profiles')
    .select('isletme_id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.isletme_id) return null
  // Mobil (Bearer): yalnızca panel rolleri; isletme_id'si olan başka bir profil panel API'sine giremesin
  if (!PANEL_ROLES.includes(profile.role ?? '')) return null
  return { userId: user.id, restaurantId: profile.isletme_id, role: profile.role ?? undefined }
}

/**
 * API route'ları için panel oturumu: web (cr_panel cookie) veya mobil (Authorization: Bearer <Supabase JWT>).
 * restaurantId her zaman oturumdan gelir (cookie imzası veya profiles.isletme_id) — body/query'den ALINMAZ.
 */
export async function getPanelApiSession(req: NextRequest): Promise<{ userId: string; restaurantId: string; role: string } | null> {
  const s = await resolveApiSession(req, await cookies())
  return s ? { userId: s.userId, restaurantId: s.restaurantId, role: s.role ?? '' } : null
}
