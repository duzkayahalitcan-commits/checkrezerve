import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { canManageStaff, canManageServices, canManageTables } from '@/lib/roles'

const ALLOWED_TABLES = ['hizmetler', 'calisanlar', 'tables', 'special_areas'] as const
type AllowedTable = typeof ALLOWED_TABLES[number]

// S2-T2: Tablo tipine göre gereken minimum yetki
//  - calisanlar   → canManageStaff  (super_admin + business_owner)
//  - hizmetler    → canManageServices (super_admin + business_owner + business_manager)
//  - tables/special_areas → canManageTables (super_admin + business_owner)
const TABLE_REQUIREMENT: Record<AllowedTable, (role: string) => boolean> = {
  calisanlar:    canManageStaff,
  hizmetler:     canManageServices,
  tables:        canManageTables,
  special_areas: canManageTables,
}

// RBAC kontrolü — yetki yoksa 403 döndürür
function requireTablePermission(session: { role?: string }, table: AllowedTable): NextResponse | null {
  const check = TABLE_REQUIREMENT[table]
  if (!session?.role || !check(session.role)) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 })
  }
  return null
}

// Her tablo icin izin verilen kolonlar — bilinmeyen kolonlar PostgREST tarafindan reddedilir
const TABLE_COLUMNS: Record<AllowedTable, string[]> = {
  calisanlar:    ['ad', 'uzmanlik', 'foto_url', 'aktif', 'restaurant_id'],
  hizmetler:     ['ad', 'sure_dakika', 'fiyat', 'kategori', 'renk', 'aktif', 'restaurant_id'],
  tables:        ['ad', 'kapasite', 'x', 'y', 'width', 'height', 'sekil', 'area_id', 'restaurant_id'],
  special_areas: ['name', 'color', 'capacity', 'restaurant_id'],
}

function isAllowedTable(t: unknown): t is AllowedTable {
  return typeof t === 'string' && (ALLOWED_TABLES as readonly string[]).includes(t)
}

function filterPayload(table: AllowedTable, payload: Record<string, unknown>): Record<string, unknown> {
  const allowed = TABLE_COLUMNS[table] ?? []
  const filtered: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in payload) filtered[k] = payload[k]
  }
  return filtered
}

async function getSession() {
  const jar = await cookies()
  return verifySession(jar.get('cr_panel')?.value ?? '')
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!isAllowedTable(body.table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  const denied = requireTablePermission(session, body.table)
  if (denied) return denied

  const db = getSupabaseAdmin()
  const cleanPayload = filterPayload(body.table, { ...body.payload, restaurant_id: session.restaurantId })
  const { data, error } = await db
    .from(body.table)
    .insert(cleanPayload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id, payload } = await req.json()
  if (!isAllowedTable(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  const denied = requireTablePermission(session, table)
  if (denied) return denied

  const db = getSupabaseAdmin()
  const cleanPayload = filterPayload(table, payload)
  const { data, error } = await db
    .from(table)
    .update(cleanPayload)
    .eq('id', id)
    .eq('restaurant_id', session.restaurantId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id } = await req.json()
  if (!isAllowedTable(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  const denied = requireTablePermission(session, table)
  if (denied) return denied

  const db = getSupabaseAdmin()
  const { error } = await db
    .from(table)
    .delete()
    .eq('id', id)
    .eq('restaurant_id', session.restaurantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
