'use client'
import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  if (!supported) return null

  async function requestPermission() {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification('CheckRezerve', {
          body: 'Bildirimler aktif! Rezervasyon onaylarınızı anında alacaksınız.',
          icon: '/favicon-192x192.png',
        })
      })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        {permission === 'granted' ? (
          <Bell size={20} className="text-emerald-600 flex-shrink-0" />
        ) : (
          <BellOff size={20} className="text-zinc-400 flex-shrink-0" />
        )}
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            {permission === 'granted' ? 'Bildirimler Açık' : 'Bildirimler Kapalı'}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {permission === 'granted'
              ? 'Rezervasyon onaylarını anlık alıyorsunuz.'
              : 'Rezervasyon güncellemelerini anlık alın.'}
          </p>
        </div>
      </div>
      {permission !== 'granted' && permission !== 'denied' && (
        <button
          onClick={requestPermission}
          className="shrink-0 text-xs font-semibold px-4 py-2 rounded-xl bg-[#E53935] text-white hover:bg-red-700 transition-colors"
        >
          Bildirimleri Aç
        </button>
      )}
      {permission === 'denied' && (
        <span className="shrink-0 text-xs text-zinc-400">Tarayıcı ayarlarından açın</span>
      )}
      {permission === 'granted' && (
        <span className="shrink-0 text-xs font-semibold text-emerald-600">✓ Aktif</span>
      )}
    </div>
  )
}
