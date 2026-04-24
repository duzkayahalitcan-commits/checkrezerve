import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/panel', '/api', '/auth', '/profil'],
      },
    ],
    sitemap: 'https://checkrezerve.com/sitemap.xml',
  }
}
