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

  // Masaları çek
  const { data: tables, error } = await db
    .from('masa_tipleri')
    .select('*')
    .eq('isletme_id', restaurantId)
    .eq('aktif', true)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Alanları çek (floor label için)
  const { data: areas } = await db
    .from('special_areas')
    .select('id, name')
    .eq('restaurant_id', restaurantId)

  const areaMap = new Map((areas ?? []).map((a: any) => [a.id, a.name]))

  // area_id'ye göre grupla
  const floorMap = new Map<string, any[]>()
  const noAreaTables: any[] = []

  for (const t of (tables ?? [])) {
    if (t.area_id) {
      if (!floorMap.has(t.area_id)) floorMap.set(t.area_id, [])
      floorMap.get(t.area_id)!.push(t)
    } else {
      noAreaTables.push(t)
    }
  }

  const floors: any[] = []

  // Her alan için bir floor
  floorMap.forEach((areaTables, areaId) => {
    floors.push({
      id: areaId,
      label: areaMap.get(areaId) ?? 'Alan',
      theme: 'indoor',
      canvasW: 1200,
      canvasH: 800,
      tables: areaTables.map((t: any) => ({
        id: t.id,
        typeId: t.masa_tipi_kodu ?? 'rect4',
        x: t.x,
        y: t.y,
        label: t.ad,
        rotation: t.rotation ?? 0,
      })),
    })
  })

  // Alan atanmamış masalar için varsayılan floor
  if (noAreaTables.length > 0) {
    floors.push({
      id: 'f-default',
      label: 'Genel',
      theme: 'indoor',
      canvasW: 1200,
      canvasH: 800,
      tables: noAreaTables.map((t: any) => ({
        id: t.id,
        typeId: t.masa_tipi_kodu ?? 'rect4',
        x: t.x,
        y: t.y,
        label: t.ad,
        rotation: t.rotation ?? 0,
      })),
    })
  }

  // Hiç masa yoksa boş tek floor döndür
  if (floors.length === 0) {
    floors.push({
      id: 'f1',
      label: 'Zemin Kat',
      theme: 'indoor',
      canvasW: 1200,
      canvasH: 800,
      tables: [],
    })
  }

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

  const allTables = floors.flatMap((f: any) =>
    (Array.isArray(f.tables) ? f.tables : []).map((t: any) => ({
      ...t,
      area_id: f.id === 'f-default' || f.id === 'f1' ? null : f.id,
    }))
  )

  const incomingIds = allTables.map((t: any) => t.id).filter(Boolean)

  let deactivateQuery = db
    .from('masa_tipleri')
    .update({ aktif: false })
    .eq('isletme_id', restaurant_id)

  if (incomingIds.length > 0) {
    deactivateQuery = deactivateQuery.not('id', 'in', `(${incomingIds.join(',')})`)
  }
  await deactivateQuery

  if (allTables.length > 0) {
    const rows = allTables.map((t: any) => {
      const info = typeInfo(t.typeId)
      return {
        id: t.id,
        isletme_id: restaurant_id,
        ad: t.label ?? 'Masa',
        kapasite: info.seats ?? 4,
        masa_tipi_kodu: t.typeId ?? null,
        area_id: t.area_id ?? null,
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
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
