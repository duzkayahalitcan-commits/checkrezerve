import { createHmac }   from 'crypto'
import { type NextRequest } from 'next/server'
import { getSupabaseAdmin } from './supabase'

export function verifySession(raw: string): { userId: string; restaurantId: string; role: string } | null {
  const parts = raw.split(':')
  if (parts.length < 4) return null
  const [userId, restaurantId, role, ...tokenParts] = parts
  const token    = tokenParts.join(':')
  const secret   = process.env.ADMIN_SECRET
  if (!secret) return null
  const expected = createHmac('sha256', secret).update(`${userId}:${restaurantId}`).digest('base64url')
  if (token !== expected) return null
  return { userId, restaurantId, role }
}

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
  return { userId: user.id, restaurantId: profile.isletme_id, role: profile.role ?? undefined }
}
