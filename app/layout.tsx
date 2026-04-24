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
        </body>
    </html>
  )
}
