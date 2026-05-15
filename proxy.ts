import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Admin cookie auth
const COOKIE = 'cr_admin'
const LOGIN  = '/admin/login'
const LOGOUT = '/admin/logout'

function makeToken(password: string, secret: string): string {
  return createHmac('sha256', secret).update(password).digest('base64')
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Admin auth ──────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith(LOGIN) || pathname.startsWith(LOGOUT)) {
      return NextResponse.next()
    }
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminSecret   = process.env.ADMIN_SECRET ?? 'checkrezerve-fallback-secret'
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

  // ── Skip intl for non-public paths ──────────────────────────────
  if (
    pathname.startsWith('/panel') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|woff2?|ttf)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // ── next-intl locale routing for public pages ────────────────────
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
