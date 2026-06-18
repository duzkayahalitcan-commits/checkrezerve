import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/rezervasyon/musait?business_id=<uuid>&date=YYYY-MM-DD
// Returns occupied time slots for a restaurant on a given date.
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get('business_id') ?? ''
  const date       = req.nextUrl.searchParams.get('date') ?? ''

  if (!businessId || !date) {
    return NextResponse.json({ times: [] })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('reservations')
    .select('reserved_time')
    .eq('restaurant_id', businessId)
    .or(`reserved_date.eq.${date},date.eq.${date}`)
    .neq('status', 'cancelled')

  if (error) {
    return NextResponse.json({ times: [] })
  }

  const times = [...new Set((data ?? []).map(r => r.reserved_time).filter(Boolean))]
  return NextResponse.json(
    { times },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
