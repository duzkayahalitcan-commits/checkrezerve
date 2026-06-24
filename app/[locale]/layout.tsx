import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ToastProvider } from "@/components/ui/Toast";
import PageTransition from "@/components/ui/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";
import NavigationProgress from "@/components/ui/NavigationProgress";
import ChatWidget from "@/components/ChatWidget";
import CookieBanner from "@/components/CookieBanner";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://checkrezerve.com';
  return {
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `${baseUrl}/${l}`])
      ),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastProvider>
        <NavigationProgress />
        <ChatWidget />
        <CookieBanner />
        <div dir={dir} lang={locale} style={{ minHeight: '100%' }}>
          <SmoothScroll />
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
