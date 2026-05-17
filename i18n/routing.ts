import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tr', 'en', 'de', 'ar', 'da', 'es', 'ru'],
  defaultLocale: 'tr',
  localePrefix: 'always',
})
