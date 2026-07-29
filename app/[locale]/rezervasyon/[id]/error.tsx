'use client'

import { useEffect } from 'react'

export default function ReservationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[rezervasyon] client error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-zinc-900 mb-2">Bir şeyler ters gitti</h2>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">
        Rezervasyon sayfası yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-[#E53935] hover:bg-[#C62828] text-white px-6 py-2.5 text-sm font-bold transition-colors"
      >
        Tekrar Dene
      </button>
    </div>
  )
}
