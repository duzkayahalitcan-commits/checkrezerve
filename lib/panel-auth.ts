import { createHmac } from 'crypto'

export function verifySession(raw: string): { userId: string; restaurantId: string } | null {
  const parts = raw.split(':')
  if (parts.length < 3) return null
  const [userId, restaurantId, ...tokenParts] = parts
  const token    = tokenParts.join(':')
  const secret   = process.env.ADMIN_SECRET ?? 'dev-secret-change-me'
  const expected = createHmac('sha256', secret).update(`${userId}:${restaurantId}`).digest('base64url')
  if (token !== expected) return null
  return { userId, restaurantId }
}
