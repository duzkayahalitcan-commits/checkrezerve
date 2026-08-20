import { createHmac } from 'crypto'

/**
 * Merkezi cookie auth mantığı (S3-T4).
 * Hem `proxy.ts` (middleware) hem `lib/panel-auth.ts` (API route'ları) buradan
 * beslenir; HMAC doğrulama tek kaynakta tanımlıdır.
 * Bu modül saf (pure) ve edge-safe'tir — supabase/DB içermez.
 */

// ── Admin (super-admin) cookie token ──────────────────────────────────────
export function makeAdminToken(password: string, secret: string): string {
  return createHmac('sha256', secret).update(password).digest('base64')
}

export function verifyAdminToken(raw: string, password: string, secret: string): boolean {
  if (!password || !secret) return false
  return raw === makeAdminToken(password, secret)
}

// ── Panel (business) cookie token ─────────────────────────────────────────
// Format: `userId:restaurantId:role:hmac(userId:restaurantId:role)`
// K1 FİX: HMAC artık role DAHİL olacak şekilde `userId:restaurantId:role`
// üzerinden hesaplanır. Böylece kullanıcı cookie'deki role değerini
// değiştirirse HMAC doğrulaması başarısız olur (privilege escalation engellenir).
export function makePanelToken(userId: string, restaurantId: string, role: string, secret: string): string {
  return createHmac('sha256', secret).update(`${userId}:${restaurantId}:${role}`).digest('base64url')
}

export interface PanelSession {
  userId: string
  restaurantId: string
  role?: string
}

export function parsePanelCookie(
  raw: string,
): { userId: string; restaurantId: string; role?: string; token: string } | null {
  const parts = raw.split(':')
  if (parts.length < 4) return null
  const [userId, restaurantId, role, ...tokenParts] = parts
  return { userId, restaurantId, role, token: tokenParts.join(':') }
}

export function verifyPanelToken(raw: string, secret: string): PanelSession | null {
  const parsed = parsePanelCookie(raw)
  if (!parsed) return null
  // K1 FİX: role'u da HMAC hesabına kat
  const expected = makePanelToken(parsed.userId, parsed.restaurantId, parsed.role ?? '', secret)
  if (parsed.token !== expected) return null
  return { userId: parsed.userId, restaurantId: parsed.restaurantId, role: parsed.role }
}
