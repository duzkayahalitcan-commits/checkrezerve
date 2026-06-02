import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { ToastProvider } from '@/components/ui/Toast'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const locale = jar.get('panel_locale')?.value ?? 'tr'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const messages = (await import(`@/messages/${locale}.json`)).default

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastProvider>
        <div dir={dir} lang={locale}>
          {children}
        </div>
      </ToastProvider>
    </NextIntlClientProvider>
  )
}
