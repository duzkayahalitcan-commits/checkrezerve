'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4" aria-hidden>⚠️</div>
      <h1 className="text-2xl font-bold mb-3">Bir hata oluştu</h1>
      <p className="text-zinc-400 mb-8 max-w-sm">
        Beklenmedik bir sorun ile karşılaştık. Lütfen tekrar deneyin.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-sm font-semibold transition-colors"
        >
          Tekrar Dene
        </button>
        <a
          href="/tr/home"
          className="rounded-full border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-6 py-2.5 text-sm font-semibold transition-colors"
        >
          Ana Sayfa
        </a>
      </div>
    </div>
  )
}
