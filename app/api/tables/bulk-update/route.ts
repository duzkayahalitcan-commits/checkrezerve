import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/tables/bulk-update
// Bulk update positions, labels, capacities for multiple tables at once
// Body: { tables: [{ id, x?, y?, rotation?, width?, height?, label?, capacity?, shape?, is_active? }] }
export async function POST(req: NextRequest) {
  const session = verifySession((await cookies()).get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tables: updates } = await req.json()
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'No tables to update' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  // Verify all tables belong to this restaurant
  const ids = updates.map(u => u.id).filter(Boolean)
  const { data: existing } = await db
    .from('masa_tipleri')
    .select('id, isletme_id')
    .in('id', ids)

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const restaurantIds = new Set(existing.map(t => t.isletme_id))
  if (restaurantIds.size !== 1 || !restaurantIds.has(session.restaurantId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update each table
  const errors: string[] = []
  for (const u of updates) {
    if (!u.id) continue
    const payload: Record<string, unknown> = {}
    if (u.x !== undefined) payload.x = u.x
    if (u.y !== undefined) payload.y = u.y
    if (u.rotation !== undefined) payload.rotation = u.rotation
    if (u.width !== undefined) payload.width = u.width
    if (u.height !== undefined) payload.height = u.height
    if (u.label !== undefined) payload.ad = u.label          // masa_tipleri: label → ad
    if (u.capacity !== undefined) payload.kapasite = u.capacity // masa_tipleri: capacity → kapasite
    if (u.shape !== undefined) payload.sekil = u.shape === 'circle' ? 'yuvarlak' : 'kare'
    if (u.is_active !== undefined) payload.aktif = u.is_active

    if (Object.keys(payload).length === 0) continue

    const { error } = await db.from('masa_tipleri').update(payload).eq('id', u.id)
    if (error) errors.push(`${u.id}: ${error.message}`)
  }

  return NextResponse.json({
    ok: errors.length === 0,
    updated: updates.length - errors.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
