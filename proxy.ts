import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

// Node.js runtime — full crypto available
const COOKIE = 'cr_admin'
const LOGIN  = '/admin/login'
const LOGOUT = '/admin/logout'

function makeToken(password: string, secret: string): string {
  return createHmac('sha256', secret).update(password).digest('base64')
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Login ve logout serbest
  if (pathname.startsWith(LOGIN) || pathname.startsWith(LOGOUT)) {
    return NextResponse.next()
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  const adminSecret   = process.env.ADMIN_SECRET ?? 'checkrezerve-fallback-secret'

  // ADMIN_PASSWORD tanımlı değilse → geliştirme ortamı, geç
  if (!adminPassword) return NextResponse.next()

  const token    = req.cookies.get(COOKIE)?.value ?? ''
  const expected = makeToken(adminPassword, adminSecret)

  if (token !== expected) {
    const url = req.nextUrl.clone()
    url.pathname = LOGIN
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const proxyConfig = {
  matcher: ['/admin/:path*'],
}
