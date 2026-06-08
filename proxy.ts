import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// ── Super-admin cookie auth ──────────────────────────────────────
const COOKIE = 'cr_admin'
const LOGIN  = '/admin/login'
const LOGOUT = '/admin/logout'

function makeToken(password: string, secret: string): string {
  return createHmac('sha256', secret).update(password).digest('base64')
}

// ── Panel (business) cookie auth ────────────────────────────────
const PANEL_LOGIN  = '/panel/login'
const PANEL_LOGOUT = '/panel/logout'

function makePanelToken(userId: string, restaurantId: string, secret: string): string {
  return createHmac('sha256', secret).update(`${userId}:${restaurantId}`).digest('base64url')
}

function verifyPanelCookie(raw: string, secret: string): boolean {
  const parts = raw.split(':')
  if (parts.length < 4) return false
  const [userId, restaurantId, , ...tokenParts] = parts
  const token    = tokenParts.join(':')
  const expected = makePanelToken(userId, restaurantId, secret)
  return token === expected
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Admin auth ──────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith(LOGIN) || pathname.startsWith(LOGOUT)) {
      return NextResponse.next()
    }
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminSecret   = process.env.ADMIN_SECRET
    if (!adminPassword || !adminSecret) {
      const url = req.nextUrl.clone()
      url.pathname = LOGIN
      return NextResponse.redirect(url)
    }
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

  // ── Panel auth ──────────────────────────────────────────────────
  if (pathname.startsWith('/panel')) {
    const panelLocale = req.cookies.get('panel_locale')?.value ?? 'tr'

    // Public panel routes — no auth required
    if (
      pathname.startsWith(PANEL_LOGIN) ||
      pathname.startsWith(PANEL_LOGOUT) ||
      pathname.startsWith('/panel/register') ||
      pathname.startsWith('/panel/forgot-password') ||
      pathname.startsWith('/panel/reset-password') ||
      pathname.startsWith('/panel/auth')
    ) {
      const res = NextResponse.next()
      res.headers.set('x-next-intl-locale', panelLocale)
      return res
    }

    const secret = process.env.ADMIN_SECRET
    if (!secret) {
      const url = req.nextUrl.clone()
      url.pathname = PANEL_LOGIN
      return NextResponse.redirect(url)
    }
    const raw    = req.cookies.get('cr_panel')?.value ?? ''
    if (!raw || !verifyPanelCookie(raw, secret)) {
      const url = req.nextUrl.clone()
      url.pathname = PANEL_LOGIN
      return NextResponse.redirect(url)
    }
    const res = NextResponse.next()
    res.headers.set('x-next-intl-locale', panelLocale)
    return res
  }

  // ── Skip intl for non-public paths ──────────────────────────────
  if (
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
