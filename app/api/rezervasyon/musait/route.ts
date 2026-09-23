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

  const times = [...new Set((data ?? []).map(r => r.reserved_time).filter(Boolean))]
  return NextResponse.json(
    { times },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
