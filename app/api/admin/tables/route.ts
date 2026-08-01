import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'

async function verifyRequest(): Promise<boolean> {
  const adminSecret   = process.env.ADMIN_SECRET ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!adminSecret || !adminPassword) return false
  const jar = await cookies()
  const token = jar.get('cr_admin')?.value ?? ''
  if (!token) return false
  const expected = createHmac('sha256', adminSecret).update(adminPassword).digest('base64')
  return token === expected
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

  // panel kroki ile aynı kaynaktan oku: masa_tipleri
  const { data, error } = await getSupabaseAdmin()
    .from('masa_tipleri')
    .select('id, isletme_id, ad, kapasite, aktif, x, y, width, height, sekil')
    .eq('isletme_id', restaurantId)
    .eq('aktif', true)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // masa_tipleri → EditorTable formatına map'le
  const tables = (data ?? []).map((t: Record<string, unknown>) => ({
    id:       t.id as string,
    label:    (t.ad ?? t.label ?? 'Masa') as string,
    capacity: (t.kapasite ?? t.capacity ?? 4) as number,
    x:        (t.x ?? 0) as number,
    y:        (t.y ?? 0) as number,
    width:    (t.width ?? 80) as number,
    height:   (t.height ?? 80) as number,
    shape:    ((t.sekil === 'yuvarlak' || t.shape === 'circle') ? 'circle' : 'rect') as string,
  }))

  return NextResponse.json({ tables })
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

  // Soft-delete all existing tables in masa_tipleri, then insert the new set
  const { error: delErr } = await supabase
    .from('masa_tipleri')
    .update({ aktif: false })
    .eq('isletme_id', restaurant_id)

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  if (Array.isArray(tables) && tables.length > 0) {
    const rows = tables.map((t: {
      id?: string; label: string; capacity: number
      x: number; y: number; width: number; height: number; shape: string
    }) => ({
      id:            t.id && t.id.includes('-') ? t.id : undefined, // keep uuid, drop temp ids
      isletme_id:    restaurant_id,           // masa_tipleri formatı
      ad:            t.label,                 // 'label' → 'ad'
      kapasite:      Number(t.capacity) || 4, // 'capacity' → 'kapasite'
      x:             Number(t.x)        || 0,
      y:             Number(t.y)        || 0,
      width:         Number(t.width)    || 80,
      height:        Number(t.height)   || 80,
      sekil:         t.shape === 'circle' ? 'yuvarlak' : 'kare', // 'shape' → 'sekil'
      aktif:         true,
    }))

    const { error: insErr } = await supabase.from('masa_tipleri').upsert(rows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
