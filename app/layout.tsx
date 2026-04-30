import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://checkrezerve.com'),
  title: {
    default: "CheckRezerve | Türkiye'nin Akıllı Rezervasyon Platformu",
    template: '%s | CheckRezerve',
  },
  description:
    'Restoran, berber, kuaför, spa ve kafe işletmeleri için online rezervasyon yönetim sistemi.',
  keywords: ['restoran rezervasyon', 'online rezervasyon', 'masa rezervasyonu', 'randevu sistemi', 'checkrezerve', 'berber randevu', 'kuaför randevu'],
  authors: [{ name: 'CheckRezerve' }],
  creator: 'CheckRezerve',
  alternates: { canonical: 'https://checkrezerve.com' },
  verification: { google: 'GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN' },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon-32x32.png',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://checkrezerve.com',
    siteName: 'CheckRezerve',
    title: "CheckRezerve | Türkiye'nin Akıllı Rezervasyon Platformu",
    description: 'Restoran, berber, kuaför, spa ve kafe işletmeleri için online rezervasyon yönetim sistemi.',
    images: [{ url: 'https://checkrezerve.com/hero-restaurant.jpg', width: 1200, height: 630, alt: 'CheckRezerve' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "CheckRezerve | Türkiye'nin Akıllı Rezervasyon Platformu",
    description: 'Restoran, berber, kuaför, spa ve kafe işletmeleri için online rezervasyon yönetim sistemi.',
    images: ['https://checkrezerve.com/hero-restaurant.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'checkrezerve',
    // Splash screens — iOS cihaz çözünürlüklerine göre
    startupImage: [
      // iPhone 16 Pro Max / 15 Pro Max
      {
        url: '/api/splash?w=1320&h=2868',
        media: '(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 16 Pro / 15 Pro
      {
        url: '/api/splash?w=1206&h=2622',
        media: '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 16 Plus / 15 Plus / 14 Plus
      {
        url: '/api/splash?w=1284&h=2778',
        media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 16 / 15 / 14
      {
        url: '/api/splash?w=1179&h=2556',
        media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 13 / 13 Pro / 14
      {
        url: '/api/splash?w=1170&h=2532',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone SE (3. nesil)
      {
        url: '/api/splash?w=750&h=1334',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      // iPad Pro 12.9"
      {
        url: '/api/splash?w=2048&h=2732',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      // iPad Pro 11" / Air
      {
        url: '/api/splash?w=1668&h=2388',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Açık sayfalarda amber, admin/panel sayfalarında koyu
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#dc2626' },
    { media: '(prefers-color-scheme: dark)',  color: '#18181b' },
  ],
  viewportFit: 'cover', // iPhone notch/Dynamic Island için
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CheckRezerve',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://checkrezerve.com',
  description: 'Restoran, berber, kuaför, spa ve kafe işletmeleri için online rezervasyon yönetim sistemi.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
  publisher: {
    '@type': 'Organization',
    name: 'CheckRezerve',
    url: 'https://checkrezerve.com',
    logo: 'https://checkrezerve.com/logo.png',
    contactPoint: { '@type': 'ContactPoint', email: 'info@checkrezerve.com', contactType: 'customer support' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
          <ServiceWorkerRegistrar />
          {children}
          {/* WhatsApp Destek Butonu */}
          <a
            href="https://wa.me/905424626295"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp ile iletişim"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          </a>
        </body>
    </html>
  )
}
