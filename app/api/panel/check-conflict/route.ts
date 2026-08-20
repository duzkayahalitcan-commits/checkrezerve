import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurant_id, staff_id, date, start_time, duration_minutes, exclude_id } = body

  if (!restaurant_id || !staff_id || !date || !start_time) {
    return NextResponse.json({ error: 'restaurant_id, staff_id, date, start_time required' }, { status: 400 })
  }

  const dur = duration_minutes ?? 60
  const startMinutes = timeToMinutes(start_time)
  const endMinutes = startMinutes + dur

  const db = getSupabaseAdmin()

  let query = db
    .from('reservations')
    .select(`
      id, guest_name, reserved_time, duration_minutes, status,
      hizmetler!left(ad)
    `)
    .eq('restaurant_id', restaurant_id)
    .eq('calisan_id', staff_id)
    .eq('reserved_date', date)
    .neq('status', 'cancelled')

  if (exclude_id) {
    query = query.neq('id', exclude_id)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const conflicts = (data ?? []).filter((r: Record<string, unknown>) => {
    const rStart = timeToMinutes((r.reserved_time as string) ?? '00:00')
    const rDur = (r.duration_minutes as number) ?? 60
    const rEnd = rStart + rDur
    return (startMinutes < rEnd && endMinutes > rStart)
  })

  return NextResponse.json({
    conflict: conflicts.length > 0,
    existing: conflicts.map((c: Record<string, unknown>) => ({
      id: c.id,
      guest_name: c.guest_name,
      reserved_time: c.reserved_time,
      hizmet_adi: (c.hizmetler as Record<string, unknown> | Record<string, unknown>[] | null) ? 
        ((Array.isArray(c.hizmetler) ? c.hizmetler[0] : c.hizmetler) as Record<string, unknown>)?.ad as string : null,
    })),
  })
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
