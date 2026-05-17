import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { cookies, headers } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  let locale: string

  if (hasLocale(routing.locales, requested)) {
    locale = requested
  } else {
    // Panel routes: cookie → Accept-Language → default
    const jar         = await cookies()
    const panelLocale = jar.get('panel_locale')?.value
    if (hasLocale(routing.locales, panelLocale)) {
      locale = panelLocale
    } else {
      const acceptLang = (await headers()).get('accept-language') ?? ''
      const preferred  = acceptLang.split(',')[0].trim().split(/[-_]/)[0]
      locale = hasLocale(routing.locales, preferred) ? preferred : routing.defaultLocale
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
