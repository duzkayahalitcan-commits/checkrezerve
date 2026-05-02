import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/tables/[restaurantId]/availability?date=YYYY-MM-DD&time=HH:MM
// Returns array of table IDs that are occupied (non-cancelled reservations)
// at the given date+time slot.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params
  const date = req.nextUrl.searchParams.get('date') ?? ''
  const time = req.nextUrl.searchParams.get('time') ?? ''

  if (!date) {
    return NextResponse.json({ occupied: [] })
  }

  const supabase = getSupabaseAdmin()

  // Fetch all non-cancelled reservations for this restaurant on this date
  // that have a table_id. The DB has both `reserved_date` (original NOT NULL
  // column) and `date` (added in v2 migration), so we check both.
  const { data, error } = await supabase
    .from('reservations')
    .select('table_id, reserved_date, date, reserved_time, time')
    .eq('restaurant_id', restaurantId)
    .not('table_id', 'is', null)
    .neq('status', 'cancelled')

  if (error) {
    console.error('[availability]', error)
    return NextResponse.json({ occupied: [] })
  }

  const occupied = (data ?? [])
    .filter(r => {
      const matchDate = r.reserved_date === date || r.date === date
      if (!time) return matchDate
      const matchTime = !r.reserved_time && !r.time
        ? true // no time stored — treat as conflict (conservative)
        : r.reserved_time === time || r.time === time
      return matchDate && matchTime
    })
    .map(r => r.table_id as string)

  return NextResponse.json({ occupied: [...new Set(occupied)] })
}
