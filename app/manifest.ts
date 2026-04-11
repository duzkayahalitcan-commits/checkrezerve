import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:        'checkrezerve — Restoran Rezervasyon',
    short_name:  'checkrezerve',
    description: 'Restoranınız için akıllı rezervasyon yönetimi. WhatsApp & SMS bildirimli.',
    start_url:   '/',
    scope:       '/',
    id:          'com.checkrezerve.app',

    display:             'standalone',
    display_override:    ['standalone', 'minimal-ui'],
    orientation:         'portrait',
    background_color:    '#18181b',
    theme_color:         '#f59e0b',   // amber — Safari status bar rengi
    dir:                 'ltr',
    lang:                'tr',
    categories:          ['food', 'business', 'productivity'],

    icons: [
      { src: '/favicon.ico',    sizes: 'any',       type: 'image/x-icon'  },
      { src: '/icon-192.png',   sizes: '192x192',   type: 'image/png', purpose: 'maskable'        },
      { src: '/icon-512.png',   sizes: '512x512',   type: 'image/png', purpose: 'any'             },
      { src: '/apple-icon.png', sizes: '180x180',   type: 'image/png', purpose: 'any'             },
    ],

    // Safari / iOS için "Add to Home Screen" kısa yolları
    shortcuts: [
      {
        name:        'Admin Paneli',
        short_name:  'Admin',
        url:         '/admin',
        description: 'Tüm rezervasyonları yönet',
        icons:       [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name:        'Restoran Paneli',
        short_name:  'Panel',
        url:         '/panel/login',
        description: 'Restoran yönetici girişi',
        icons:       [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],

    // App Store / Play Store için deep link desteği
    related_applications: [
      {
        platform: 'webapp',
        url:      'https://checkrezerve.com/manifest.webmanifest',
      },
    ],
    prefer_related_applications: false,

    screenshots: [
      {
        src:          '/screenshots/dashboard.png',
        sizes:        '1280x720',
        type:         'image/png',
        form_factor:  'wide',
        label:        'Admin Paneli',
      },
      {
        src:   '/screenshots/reservation-form.png',
        sizes: '390x844',
        type:  'image/png',
        label: 'Rezervasyon Formu',
      },
    ],
  }
}
