'use client'
// PF-07: Kök layout'ta hata olursa Next.js'in markasız varsayılan sayfası yerine bu gösterilir.
// Kök layout (ve globals.css) yüklenmediği için stiller satır içi.
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="tr">
      <body style={{ margin: 0, minHeight: '100vh', background: '#09090b', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
        <main>
          <p style={{ fontWeight: 700, letterSpacing: 1, color: '#E53935', margin: 0 }}>CheckRezerve</p>
          <h1 style={{ fontSize: 30, margin: '16px 0 12px' }}>Bir şeyler ters gitti</h1>
          <p style={{ color: '#a1a1aa', maxWidth: 420, margin: '0 auto 28px' }}>
            Beklenmedik bir sorun oluştu. Lütfen tekrar deneyin; sorun sürerse biraz sonra tekrar ziyaret edin.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={reset} style={{ background: '#E53935', color: '#fff', border: 0, borderRadius: 999, padding: '12px 28px', fontWeight: 600, cursor: 'pointer' }}>
              Tekrar dene
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- kök layout çöktüğünde tam sayfa yenileme bilinçli */}
            <a href="/" style={{ border: '1px solid #3f3f46', color: '#d4d4d8', borderRadius: 999, padding: '12px 28px', fontWeight: 600, textDecoration: 'none' }}>
              Ana sayfa
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
