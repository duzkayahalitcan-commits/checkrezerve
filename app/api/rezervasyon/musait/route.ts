import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/rezervasyon/musait?business_id=<uuid>&date=YYYY-MM-DD&staff_id=<uuid>&service_id=<uuid>
// Returns occupied time slots for a restaurant on a given date.
// When staff_id is provided, only returns times occupied by that specific staff.
// Otherwise returns ALL occupied times (restaurant-level).
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get('business_id') ?? ''
  const date       = req.nextUrl.searchParams.get('date') ?? ''
  const staffId    = req.nextUrl.searchParams.get('staff_id') ?? ''
  const serviceId  = req.nextUrl.searchParams.get('service_id') ?? ''

  if (!businessId || !date) {
    return NextResponse.json({ times: [] })
  }

  let query = getSupabaseAdmin()
    .from('reservations')
    .select('reserved_time')
    .eq('restaurant_id', businessId)
    .or(`reserved_date.eq.${date},date.eq.${date}`)
    .neq('status', 'cancelled')

  // Staff filtresi: sadece seçili personelin dolu slot'larını göster
  if (staffId && staffId.length > 0) {
    query = query.eq('calisan_id', staffId)
  }

  // K4 (gece G2): Hizmet filtresi kaldırıldı. Doluluk hizmete değil çalışana/işletmeye bağlı;
  // ayrıca service_id hep boş olduğundan filtre 0 satır döndürüp tüm saatleri boş gösteriyordu.
  // service_id parametresi geriye uyum için kabul edilir ama kullanılmaz.
  void serviceId

  const { data, error } = await query

  if (error) {
    console.error('[musait]', error)
    return NextResponse.json({ times: [] })
  }

  // 10a: DB "15:30:00" döndürüyor, form "15:30" ile karşılaştırıyor → hiç eşleşmiyordu (dolu saat görünmüyordu)
  const counts = new Map<string, number>()
  for (const r of data ?? []) {
    const t = String(r.reserved_time ?? '').slice(0, 5)
    if (t) counts.set(t, (counts.get(t) ?? 0) + 1)
  }

  let times: string[]
  if (staffId) {
    times = [...counts.keys()]
  } else {
    // Çalışan seçilmemiş: tek rezervasyon saati herkese kapatmasın.
    // Çalışanı olan işletmede saat, rezervasyon sayısı aktif çalışan sayısına ulaşınca dolu;
    // çalışanı olmayan (restoran) işletmede kapasite masa/bölge kontrolleriyle yönetilir → burada kapatılmaz.
    const { count: staffCount } = await getSupabaseAdmin()
      .from('calisanlar')
      .select('id', { count: 'exact', head: true })
      .eq('restaurant_id', businessId)
      .eq('aktif', true)
    const n = staffCount ?? 0
    times = n > 0 ? [...counts.entries()].filter(([, c]) => c >= n).map(([t]) => t) : []
  }

  return NextResponse.json(
    { times },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
