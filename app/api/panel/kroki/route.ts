import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'
import { TABLE_TYPES } from '@/src/lib/kroki-config'

function typeInfo(typeId: string) {
  return TABLE_TYPES.find((t) => t.id === typeId) ?? { seats: 4, w: 80, h: 80 }
}

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('masa_tipleri')
    .select('*')
    .eq('isletme_id', restaurantId)
    .eq('aktif', true)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // KrokiEditor'ın beklediği Floor[] formatına geri çevir (tek kat varsayımıyla)
  const tables = (data ?? []).map((r: any) => ({
    id: r.id,
    typeId: r.masa_tipi_kodu ?? 'rect4',
    x: r.x,
    y: r.y,
    label: r.ad,
    rotation: r.rotation ?? 0,
  }))

  const floors = [{
    id: 'f1',
    label: 'Zemin Kat',
    theme: 'indoor',
    canvasW: 1200,
    canvasH: 800,
    tables,
  }]

  return NextResponse.json(floors)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('cr_panel')?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurant_id, floor_data } = body
  if (!restaurant_id) {
    return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const floors = Array.isArray(floor_data) ? floor_data : []

  // Tüm katlardaki tüm masaları düzleştir
  const allTables = floors.flatMap((f: any) =>
    Array.isArray(f.tables) ? f.tables : []
  )

  const incomingIds = allTables.map((t: any) => t.id).filter(Boolean)

  let deactivateQuery = db
    .from('masa_tipleri')
    .update({ aktif: false })
    .eq('isletme_id', restaurant_id)

  if (incomingIds.length > 0) {
    deactivateQuery = deactivateQuery.not('id', 'in', `(${incomingIds.join(',')})`)
  }
  const { error: deactivateError } = await deactivateQuery
  if (deactivateError) {
    console.error('[Kroki POST] deactivate error:', deactivateError.message)
  }

  if (allTables.length > 0) {
    const rows = allTables.map((t: any) => {
      const info = typeInfo(t.typeId)
      return {
        id: t.id,
        isletme_id: restaurant_id,
        ad: t.label ?? 'Masa',
        kapasite: info.seats ?? 4,
        masa_tipi_kodu: t.typeId ?? null,
        x: t.x ?? 0,
        y: t.y ?? 0,
        width: info.w ?? 80,
        height: info.h ?? 80,
        sekil: (t.typeId ?? '').startsWith('round') ? 'yuvarlak' : 'kare',
        rotation: t.rotation ?? 0,
        aktif: true,
      }
    })

    const { error: upsertError } = await db
      .from('masa_tipleri')
      .upsert(rows, { onConflict: 'id' })

    if (upsertError) {
      console.error('[Kroki POST] upsert error:', upsertError.message)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
