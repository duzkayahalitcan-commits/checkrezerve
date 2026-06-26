import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/panel',
          '/api',
          '/auth',
          '/profil',
          '/favorilerim',
          '/rezervasyonlarim',
          '/rezervasyon/iptal',
          '/isletme/*',  // doğrulanmamış işletmeler için (isteğe bağlı strict)
        ],
      },
      // Googlebot for verified business pages only
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/isletme/',  // allow business detail pages
          '/rezervasyon/',
        ],
        disallow: [
          '/admin',
          '/panel',
          '/api',
          '/auth',
          '/profil',
          '/favorilerim',
          '/rezervasyonlarim',
          '/rezervasyon/iptal',
        ],
      },
    ],
    sitemap: 'https://checkrezerve.com/sitemap.xml',
  }
}
