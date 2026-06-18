import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/tables/[restaurantId]/floor-plan?date=YYYY-MM-DD&time=HH:MM
// Returns tables grouped by area, each with occupied status for the given slot
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params
  const date = req.nextUrl.searchParams.get('date') ?? ''
  const time = req.nextUrl.searchParams.get('time') ?? ''
  const db = getSupabaseAdmin()

  const [tablesRes, areasRes, occRes] = await Promise.all([
    db.from('tables').select('*').eq('restaurant_id', restaurantId).eq('is_active', true).order('label'),
    db.from('special_areas').select('*').eq('restaurant_id', restaurantId).order('name'),
    date
      ? db.from('reservations').select('table_id').not('table_id', 'is', null).neq('status', 'cancelled')
          .filter('reserved_date', 'eq', date)
      : Promise.resolve({ data: [] }),
  ])

  const tables = tablesRes.data ?? []
  const areas  = areasRes.data ?? []
  const occData = Array.isArray(occRes) ? [] : (occRes.data ?? [])

  // Build occupied set per time slot
  const occupied = new Set<string>()
  if (date && time && occData.length > 0) {
    const exact = occData.filter((r: Record<string, unknown>) => {
      const rt = (r.reserved_time ?? r.time ?? '') as string
      return rt === time
    })
    exact.forEach((r: Record<string, unknown>) => {
      if (r.table_id) occupied.add(r.table_id as string)
    })
  } else if (date && occData.length > 0) {
    occData.forEach((r: Record<string, unknown>) => {
      if (r.table_id) occupied.add(r.table_id as string)
    })
  }

  // Group by area
  const ungrouped: { id: string; label: string } | null = areas.length === 0 ? null : null
  const grouped: Array<{ area: typeof areas[number] | null; tables: typeof tables }> = []

  if (areas.length === 0) {
    grouped.push({ area: null, tables })
  } else {
    for (const area of areas) {
      const areaTables = tables.filter(t => t.area_id === area.id)
      if (areaTables.length > 0) grouped.push({ area, tables: areaTables })
    }
    const unassigned = tables.filter(t => !t.area_id)
    if (unassigned.length > 0) grouped.push({ area: null, tables: unassigned })
  }

  return NextResponse.json({
    groups: grouped.map(g => ({
      area: g.area ? { id: g.area.id, name: g.area.name, color: g.area.color ?? null } : null,
      tables: g.tables.map(t => ({
        id: t.id,
        label: t.label,
        capacity: t.capacity,
        x: Number(t.x),
        y: Number(t.y),
        width: Number(t.width),
        height: Number(t.height),
        shape: t.shape,
        rotation: Number(t.rotation ?? 0),
        is_occupied: occupied.has(t.id),
      })),
    })),
    date: date || null,
    time: time || null,
  })
}
