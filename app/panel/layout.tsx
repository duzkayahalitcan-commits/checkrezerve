import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { ToastProvider } from '@/components/ui/Toast'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const locale   = await getLocale()
  const messages = await getMessages()
  const dir      = locale === 'ar' ? 'rtl' : 'ltr'

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
