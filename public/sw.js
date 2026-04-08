const CACHE = 'checkrezerve-v1'
const OFFLINE_URL = '/offline'

// Kurulum: offline sayfasını önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([OFFLINE_URL, '/manifest.webmanifest'])
    )
  )
  self.skipWaiting()
})

// Aktivasyon: eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: navigate isteklerinde offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    )
  }
})

// Push bildirimleri
self.addEventListener('push', (event) => {
  let data = { title: 'Yeni Rezervasyon!', body: '', url: '/admin' }
  try { data = { ...data, ...event.data?.json() } } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  '/icon-192.png',
      badge: '/icon-192.png',
      tag:   'reservation',
      renotify: true,
      data:  { url: data.url },
    })
  )
})

// Bildirime tıklanınca admin panelini aç
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/admin'
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) => c.url.includes(url))
        return existing ? existing.focus() : clients.openWindow(url)
      })
  )
})
