import type { MetadataRoute } from 'next'

const BASE = 'https://checkrezerve.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[0]['changeFrequency'] }> = [
    { path: '/',                  priority: 1.0, freq: 'weekly'  },
    { path: '/basvuru',           priority: 0.9, freq: 'monthly' },
    { path: '/kayit',             priority: 0.9, freq: 'monthly' },
    { path: '/ozellikler',        priority: 0.8, freq: 'monthly' },
    { path: '/kullanim-alanlari', priority: 0.8, freq: 'monthly' },
    { path: '/hakkimizda',        priority: 0.7, freq: 'monthly' },
    { path: '/iletisim',          priority: 0.7, freq: 'monthly' },
    { path: '/blog',              priority: 0.6, freq: 'weekly'  },
    { path: '/giris',             priority: 0.5, freq: 'yearly'  },
    { path: '/gizlilik',          priority: 0.3, freq: 'yearly'  },
    { path: '/kullanim-kosullari',priority: 0.3, freq: 'yearly'  },
    { path: '/kvkk',              priority: 0.3, freq: 'yearly'  },
  ]

  return pages.map(({ path, priority, freq }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }))
}
