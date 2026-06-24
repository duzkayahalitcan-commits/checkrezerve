import { getSupabase } from '@/lib/supabase'
import { Link }        from '@/i18n/navigation'
import ConfettiClient  from './ConfettiClient'

type Props = {
  params:       Promise<{ locale: string; id: string }>
  searchParams: Promise<{ ref?: string }>
}

type ReservationRow = {
  id:            string
  guest_name:    string
  reserved_date: string
  reserved_time: string
  party_size:    number
  status:        string
  restaurants:   { name: string } | null
}

export default async function OnayPage({ searchParams }: Props) {
  const { ref } = await searchParams

  let reservation: ReservationRow | null = null
  if (ref) {
    const { data } = await getSupabase()
      .from('reservations')
      .select('id, guest_name, reserved_date, reserved_time, party_size, status, restaurants(name)')
      .eq('id', ref)
      .single()
    reservation = data as unknown as ReservationRow
  }

  if (!reservation) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-zinc-500 mb-4">Rezervasyon bulunamadı.</p>
          <Link href="/rezervasyon" className="text-[#E53935] font-semibold hover:underline">
            İşletmelere Dön
          </Link>
        </div>
      </main>
    )
  }

  const dateObj = new Date(reservation.reserved_date + 'T12:00:00')
  const formattedDate = dateObj.toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const fields = [
    { label: 'İşletme',   value: reservation.restaurants?.name ?? '—' },
    { label: 'Tarih',     value: formattedDate },
    { label: 'Saat',      value: reservation.reserved_time?.slice(0, 5) ?? '—' },
    { label: 'Kişi',      value: `${reservation.party_size} kişi` },
    { label: 'Referans',  value: reservation.id.slice(0, 8).toUpperCase() },
  ]

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <ConfettiClient />
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-1">Rezervasyon Tamamlandı!</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Onay kısa süre içinde bilgilendirileceksiniz.
        </p>

        <div className="bg-zinc-50 rounded-2xl p-5 text-left space-y-3 mb-6">
          {fields.map(f => (
            <div key={f.label} className="flex justify-between gap-4">
              <span className="text-xs text-zinc-400 pt-0.5">{f.label}</span>
              <span className="text-sm font-semibold text-zinc-800 text-right">{f.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/rezervasyonlarim"
            className="w-full py-3 rounded-xl bg-[#E53935] text-white font-semibold text-sm hover:bg-red-700 transition-colors"
          >
            Rezervasyonlarım
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-700 font-semibold text-sm hover:bg-zinc-200 transition-colors"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </main>
  )
}
