import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { resolveApiSession } from '@/lib/panel-auth'

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  const startDate = req.nextUrl.searchParams.get('start_date')
  const endDate = req.nextUrl.searchParams.get('end_date')
  const calisanId = req.nextUrl.searchParams.get('calisan_id')

  // S1-T4: auth zorunlu — panel oturumu veya mobil JWT
  const session = await resolveApiSession(req, await cookies())
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (restaurantId && session.restaurantId !== restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!restaurantId || !startDate || !endDate) {
    return NextResponse.json({ error: 'restaurant_id, start_date, end_date required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  let query = db
    .from('reservations')
    .select(`
      id, guest_name, guest_phone, reserved_date, reserved_time,
      party_size, status, notes, price_paid, duration_minutes,
      calisan_id, hizmet_id,
      calisanlar!left(name, ad),
      hizmetler!left(ad, renk)
    `)
    .eq('restaurant_id', restaurantId)
    .gte('reserved_date', startDate)
    .lte('reserved_date', endDate)

  if (calisanId) {
    query = query.eq('calisan_id', calisanId)
  }

  const { data, error } = await query.order('reserved_date').order('reserved_time')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}
