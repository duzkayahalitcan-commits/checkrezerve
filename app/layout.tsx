import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://checkrezerve.com'),
  title: {
    default: 'checkrezerve — Restoran Rezervasyon Sistemi',
    template: '%s | checkrezerve',
  },
  description:
    'Restoranınız için akıllı rezervasyon yönetimi. Tek link ile rezervasyon alın, mükerrer kayıtları engelleyin, müşterilerinizi yönetin.',
  keywords: ['restoran rezervasyon', 'online rezervasyon', 'masa rezervasyonu', 'checkrezerve'],
  authors: [{ name: 'checkrezerve' }],
  creator: 'checkrezerve',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://checkrezerve.com',
    siteName: 'checkrezerve',
    title: 'checkrezerve — Restoran Rezervasyon Sistemi',
    description: 'Restoranınız için akıllı rezervasyon yönetimi.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'checkrezerve',
    description: 'Restoranınız için akıllı rezervasyon yönetimi.',
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
  themeColor: '#18181b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
          <ServiceWorkerRegistrar />
          {children}
        </body>
    </html>
  )
}
