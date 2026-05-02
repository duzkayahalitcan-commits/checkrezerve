import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'

// Mirror the proxy.ts admin auth check
function isAdmin(token: string): boolean {
  const pw     = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SECRET ?? 'checkrezerve-fallback-secret'
  if (!pw) return true // dev mode: no password set
  const expected = createHmac('sha256', secret).update(pw).digest('base64')
  return token === expected
}

async function verifyRequest(): Promise<boolean> {
  const jar   = await cookies()
  const token = jar.get('cr_admin')?.value ?? ''
  return isAdmin(token)
}

// GET /api/admin/tables?restaurant_id=…
export async function GET(req: NextRequest) {
  if (!await verifyRequest()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) {
    return NextResponse.json({ error: 'restaurant_id gerekli' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('tables')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tables: data ?? [] })
}

// POST /api/admin/tables
// Body: { restaurant_id, tables: FloorTable[], floor_plan_enabled: boolean }
// Replaces all tables for the restaurant (delete + insert).
export async function POST(req: NextRequest) {
  if (!await verifyRequest()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { restaurant_id, tables, floor_plan_enabled } = body

  if (!restaurant_id) {
    return NextResponse.json({ error: 'restaurant_id gerekli' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Update floor_plan_enabled flag
  const { error: flagErr } = await supabase
    .from('restaurants')
    .update({ floor_plan_enabled: Boolean(floor_plan_enabled) })
    .eq('id', restaurant_id)

  if (flagErr) return NextResponse.json({ error: flagErr.message }, { status: 500 })

  // Soft-delete all existing tables, then insert the new set
  const { error: delErr } = await supabase
    .from('tables')
    .update({ is_active: false })
    .eq('restaurant_id', restaurant_id)

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  if (Array.isArray(tables) && tables.length > 0) {
    const rows = tables.map((t: {
      id?: string; label: string; capacity: number
      x: number; y: number; width: number; height: number; shape: string
    }) => ({
      id:            t.id && t.id.includes('-') ? t.id : undefined, // keep uuid, drop temp ids
      restaurant_id,
      label:         t.label,
      capacity:      Number(t.capacity) || 4,
      x:             Number(t.x)        || 0,
      y:             Number(t.y)        || 0,
      width:         Number(t.width)    || 80,
      height:        Number(t.height)   || 80,
      shape:         t.shape === 'circle' ? 'circle' : 'rect',
      is_active:     true,
    }))

    const { error: insErr } = await supabase.from('tables').upsert(rows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
