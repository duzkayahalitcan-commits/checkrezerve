import { type NextRequest, NextResponse } from 'next/server'

async function hmacBase64url(secret: string, payload: string): Promise<string> {
  const enc     = new TextEncoder()
  const key     = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig     = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const bytes   = new Uint8Array(sig)
  let binary    = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function verifyPanelCookie(raw: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false

  const parts = raw.split(':')
  if (parts.length < 4) return false

  const [userId, restaurantId, , ...tokenParts] = parts
  const token    = tokenParts.join(':')
  const expected = await hmacBase64url(secret, `${userId}:${restaurantId}`)
  return token === expected
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/panel')) return NextResponse.next()

  const exempt = ['/panel/login', '/panel/logout']
  if (exempt.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const raw = req.cookies.get('cr_panel')?.value
  if (!raw || !(await verifyPanelCookie(raw))) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/panel/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/panel/:path*'],
}
