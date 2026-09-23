'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

// Rezervasyon sayfası base URL — admin path'den bağımsız
function getBaseUrl(): string {
  // 1. Açıkça tanımlanmış uygulama URL'si (önerilen)
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  // 2. Tarayıcıdan origin al (her zaman admin path'i içermez)
  if (typeof window !== 'undefined') return window.location.origin
  // 3. Canlı domain fallback (eski Railway URL'si kaldırıldı — QR kodlar ölü adrese gitmesin)
  return 'https://checkrezerve.com'
}

export function QRCodeButton({ slug, name, label = 'QR', className }: { slug: string; name: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const canvasRef       = useRef<HTMLCanvasElement>(null)

  // Her zaman halka açık rezervasyon sayfası: <base>/<slug>
  const reservationUrl  = `${getBaseUrl()}/${slug}`

  useEffect(() => {
    if (!open || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, reservationUrl, {
      width:  256,
      margin: 2,
      color:  { dark: '#18181b', light: '#ffffff' },
    })
  }, [open, reservationUrl])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link    = document.createElement('a')
    link.download = `qr-${slug}.png`
    link.href     = canvas.toDataURL('image/png')
    link.click()
  }

  // CH-03: Masaya/vitrine basılabilir kart — tarayıcının yazdır penceresi ("PDF olarak kaydet")
  function printCard() {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = canvas.toDataURL('image/png')
    const w = window.open('', '_blank', 'width=600,height=800')
    if (!w) return
    const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
    w.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(name)} – QR</title>
      <style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;padding:40px}
      .kart{border:2px solid #18181b;border-radius:24px;padding:32px;text-align:center;width:320px}
      h1{font-size:22px;margin:0 0 6px}p{margin:6px 0;color:#52525b;font-size:13px}img{width:240px;height:240px;margin:16px auto}
      .url{font-family:monospace;font-size:11px;word-break:break-all}@media print{body{padding:0}}</style></head>
      <body><div class="kart"><h1>${esc(name)}</h1><p>Rezervasyon için okutun</p><img src="${img}" alt="QR kod">
      <p class="url">${esc(reservationUrl)}</p><p>CheckRezerve</p></div>
      <script>window.onload=()=>{window.print()}</script></body></html>`)
    w.document.close()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="QR Kod Oluştur"
        className={className ?? 'flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-stone-400 hover:border-amber-500/30 hover:text-amber-400 transition-colors'}
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-stone-900 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başlık */}
            <div className="text-center">
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-stone-500 mt-0.5">Rezervasyon Sayfası</p>
            </div>

            {/* QR Kod */}
            <div className="rounded-xl overflow-hidden bg-white p-3">
              <canvas ref={canvasRef} />
            </div>

            {/* URL */}
            <p className="text-xs text-stone-500 text-center break-all font-mono">
              {reservationUrl}
            </p>

            {/* Alt ibare */}
            <p className="text-xs text-amber-400/80 text-center font-medium">
              Müşterileriniz için masaya koymaya hazır
            </p>

            {/* Butonlar */}
            <div className="flex gap-2 w-full">
              <button
                onClick={download}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-400 transition-colors"
              >
                PNG İndir
              </button>
              <button
                onClick={printCard}
                className="flex-1 rounded-xl bg-stone-700 py-2.5 text-sm font-bold text-white hover:bg-stone-600 transition-colors"
              >
                Yazdır / PDF
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-stone-400 hover:text-white transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
