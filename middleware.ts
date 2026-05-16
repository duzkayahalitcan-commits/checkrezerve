import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /rezervasyon → /tr/rezervasyon (locale-prefixed URL)
  if (pathname === '/rezervasyon') {
    const url = request.nextUrl.clone()
    url.pathname = '/tr/rezervasyon'
    return NextResponse.redirect(url)
  }

  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except for:
  // - /api/* routes
  // - /_next/* (static files)
  // - /admin/* routes
  // - /panel/* routes
  // - files with extensions (e.g. favicon.ico)
  matcher: [
    '/((?!api|_next|admin|panel|auth|.*\\..*).*)',
  ],
}
