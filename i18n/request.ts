import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { cookies } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  let locale: string

  if (hasLocale(routing.locales, requested)) {
    locale = requested
  } else {
    // Panel routes have no locale in the URL — fall back to cookie preference
    const jar = await cookies()
    const panelLocale = jar.get('panel_locale')?.value
    locale = hasLocale(routing.locales, panelLocale) ? panelLocale : routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
