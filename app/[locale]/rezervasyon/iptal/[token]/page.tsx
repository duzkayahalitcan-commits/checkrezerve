import { notFound, redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import CancelForm from './CancelForm'

type Props = { params: Promise<{ locale: string; token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  return {
    title: 'Rezervasyon İptal',
    robots: { index: false, follow: false },
  }
}

export default async function CancelPage({ params }: Props) {
  const { locale, token } = await params
  setRequestLocale(locale)

  if (!token || token.length < 10) notFound()

  const db = getSupabaseAdmin()
  const { data: reservation } = await db
    .from('reservations')
    .select('id, guest_name, reserved_date, reserved_time, status, cancellation_token, restaurants(name)')
    .eq('cancellation_token', token)
    .single()

  if (!reservation) notFound()

  // Zaten iptal edilmişse
  if (reservation.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Bu rezervasyon zaten iptal edilmiş</h1>
          <p className="text-sm text-zinc-500 mb-6">
            {(reservation.restaurants as unknown as { name: string }[])?.[0]?.name ?? 'İşletme'} — {reservation.reserved_date} {reservation.reserved_time?.slice(0, 5)}
          </p>
          <Link href="/" className="inline-block bg-[#E53935] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  // Tamamlanmış rezervasyon iptal edilemez
  if (reservation.status === 'completed') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Bu rezervasyon tamamlanmış</h1>
          <p className="text-sm text-zinc-500 mb-6">Geçmiş rezervasyonlar iptal edilemez.</p>
          <Link href="/" className="inline-block bg-[#E53935] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">😢</div>
        <h1 className="text-xl font-bold text-zinc-900 mb-2">Rezervasyonu iptal etmek istiyor musunuz?</h1>
        <p className="text-sm text-zinc-500 mb-1">
          <strong>{(reservation.restaurants as unknown as { name: string }[])?.[0]?.name ?? 'İşletme'}</strong>
        </p>
        <p className="text-sm text-zinc-400 mb-6">
          {reservation.reserved_date} • {reservation.reserved_time?.slice(0, 5)} • {reservation.guest_name}
        </p>
        <CancelForm reservationId={reservation.id} token={token} />
      </div>
    </div>
  )
}
