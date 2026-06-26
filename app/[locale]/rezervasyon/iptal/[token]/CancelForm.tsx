'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CancelForm({ reservationId, token }: { reservationId: string; token: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    setError(null)

    const { error: err } = await supabase
      .from('reservations')
      .update({ status: 'cancelled', cancellation_token: null })
      .eq('id', reservationId)
      .eq('cancellation_token', token)

    if (err) {
      setError('İptal sırasında bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
          ⚠️ {error}
        </div>
      )}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all"
      >
        {loading ? 'İptal ediliyor...' : 'Evet, İptal Et'}
      </button>
      <a
        href="/"
        className="block w-full text-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        Hayır, Ana Sayfaya Dön
      </a>
    </div>
  )
}
