import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://checkrezerve.com'
const LOCALES = ['tr', 'en', 'de', 'ar', 'da', 'es', 'ru'] as const

function localeUrl(path: string, locale: string): string {
  const normalized = path === '/' ? '' : path
  return `${BASE}/${locale}${normalized}`
}

type PageEntry = {
  path: string
  priority: number
  freq: MetadataRoute.Sitemap[0]['changeFrequency']
}

const STATIC_PAGES: PageEntry[] = [
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
  { path: '/pricing',           priority: 0.8, freq: 'weekly'  },
  { path: '/sss',               priority: 0.7, freq: 'monthly' },
  { path: '/cerez-politikasi',  priority: 0.3, freq: 'yearly'  },
  { path: '/kullanim-sartlari', priority: 0.3, freq: 'yearly'  },
  { path: '/kvkk-basvuru',      priority: 0.3, freq: 'yearly'  },
  { path: '/sifre-sifirla',     priority: 0.2, freq: 'yearly'  },
  { path: '/rezervasyon',       priority: 0.7, freq: 'weekly'  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages — add all locale variants with hreflang
  for (const page of STATIC_PAGES) {
    const alternates = LOCALES.map(l => localeUrl(page.path, l))

    for (const locale of LOCALES) {
      entries.push({
        url: localeUrl(page.path, locale),
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map(l => [l, localeUrl(page.path, l)])
          ),
        },
      })
    }
  }

  // Dynamic business pages — fetch from Supabase
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      const supabase = createClient(url, key)
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('slug, updated_at')
        .eq('is_active', true)

      if (restaurants) {
        for (const r of restaurants) {
          if (!r.slug) continue
          const businessPath = `/${r.slug}`
          for (const locale of LOCALES) {
            entries.push({
              url: localeUrl(businessPath, locale),
              lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
              changeFrequency: 'daily' as const,
              priority: 0.7,
              alternates: {
                languages: Object.fromEntries(
                  LOCALES.map(l => [l, localeUrl(businessPath, l)])
                ),
              },
            })
          }
        }
      }
    }
  } catch {
    // Silent fail — sitemap should not crash on DB error
  }

  return entries
}
