import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Sayfa Bulunamadı | CheckRezerve',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <img
        src="/images/404-keys.png"
        alt=""
        loading="eager"
        className="max-w-[400px] w-full mb-8 select-none pointer-events-none"
      />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Sayfa Bulunamadı</h1>
      <p className="text-zinc-400 mb-8 max-w-md">
        Aradığın sayfa taşınmış veya hiç var olmamış olabilir.
      </p>
      <a
        href="/"
        className="rounded-full bg-[#E53935] hover:bg-red-700 text-white px-8 py-3 text-sm font-semibold transition-colors"
      >
        Ana Sayfaya Dön
      </a>
    </div>
  )
}
