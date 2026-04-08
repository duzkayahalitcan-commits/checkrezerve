import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
