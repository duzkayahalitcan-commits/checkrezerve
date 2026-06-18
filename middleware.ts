import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Panel ve API route'larını exclude et
  matcher: ['/((?!panel|api|admin|auth|_next|_vercel|.*\\..*).*)'],
}
