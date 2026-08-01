import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { verifyAdminToken, verifyPanelToken } from './lib/middleware-auth'

const intlMiddleware = createIntlMiddleware(routing)

// ── Super-admin cookie auth ──────────────────────────────────────
const COOKIE = 'cr_admin'
const LOGIN  = '/admin/login'
const LOGOUT = '/admin/logout'

// ── Panel (business) cookie auth ────────────────────────────────
const PANEL_LOGIN  = '/panel/login'
const PANEL_LOGOUT = '/panel/logout'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Next.js internal requests — ASLA intl middleware'e sokma ─────
  // RSC, Server Actions, _next data fetches direkt geçmeli
  if (
    req.headers.get('Next-Action') ||       // Server Action request
    req.headers.get('Next-Url') ||          // RSC internal navigation
    req.headers.get('RSC') === '1' ||       // RSC fetch header
    pathname.startsWith('/_next')           // Static/data/build files
  ) {
    return NextResponse.next()
  }

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
    const token = req.cookies.get(COOKIE)?.value ?? ''
    if (!verifyAdminToken(token, adminPassword, adminSecret)) {
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
    const raw = req.cookies.get('cr_panel')?.value ?? ''
    if (!raw || !verifyPanelToken(raw, secret)) {
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
    /\.(?:svg|png|jpg|jpeg|gif|webp|mp3|ico|txt|xml|json|woff2?|ttf)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // ── next-intl locale routing for public pages ────────────────────
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|sitemap\\.txt|atom\\.xml|license\\.txt|manifest\\.webmanifest|sitemaps\\.xml|robots\\.txt|[^/]+\\.json).*)',
  ],
}
