import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Sayfa Bulunamadı | CheckRezerve',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-8xl font-black text-zinc-800 select-none mb-2" aria-hidden>404</div>
      <h1 className="text-2xl font-bold mb-3">Sayfa bulunamadı</h1>
      <p className="text-zinc-400 mb-8 max-w-sm">
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
      </p>
      <div className="flex gap-3">
        <Link
          href="/tr/home"
          className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-sm font-semibold transition-colors"
        >
          Ana Sayfa
        </Link>
        <Link
          href="/tr/rezervasyon"
          className="rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-6 py-2.5 text-sm font-semibold transition-colors"
        >
          Rezervasyon Yap
        </Link>
      </div>
    </div>
  )
}
