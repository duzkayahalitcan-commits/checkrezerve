import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { canManageStaff, canManageServices, canManageTables } from '@/lib/roles'

const ALLOWED_TABLES = ['hizmetler', 'calisanlar', 'tables', 'special_areas', 'calisan_saatler', 'calisan_hizmetler'] as const
type AllowedTable = typeof ALLOWED_TABLES[number]

// restaurant_id kolonu olan tablolar — API session'dan enjekte eder
const WITH_RESTAURANT_ID = new Set<AllowedTable>(['hizmetler', 'calisanlar', 'tables', 'special_areas'])

// S2-T2: Tablo tipine göre gereken minimum yetki
//  - calisanlar   → canManageStaff  (super_admin + business_owner)
//  - hizmetler    → canManageServices (super_admin + business_owner + business_manager)
//  - tables/special_areas → canManageTables (super_admin + business_owner)
const TABLE_REQUIREMENT: Record<AllowedTable, (role: string) => boolean> = {
  calisanlar:        canManageStaff,
  hizmetler:         canManageServices,
  tables:            canManageTables,
  special_areas:     canManageTables,
  calisan_saatler:   canManageStaff,
  calisan_hizmetler: canManageStaff,
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
  calisanlar:        ['ad', 'soyad', 'uzmanlik', 'telefon', 'email', 'pozisyon', 'foto_url', 'aktif', 'restaurant_id'],
  hizmetler:         ['ad', 'sure_dakika', 'fiyat', 'kategori', 'renk', 'aktif', 'restaurant_id'],
  tables:            ['ad', 'kapasite', 'x', 'y', 'width', 'height', 'sekil', 'area_id', 'restaurant_id'],
  special_areas:     ['name', 'color', 'capacity', 'restaurant_id'],
  calisan_saatler:   ['calisan_id', 'gun', 'acik', 'baslangic', 'bitis'],
  calisan_hizmetler: ['calisan_id', 'hizmet_id'],
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
  // restaurant_id yalnızca o kolonu olan tablolara enjekte edilir
  const base = WITH_RESTAURANT_ID.has(body.table)
    ? { ...body.payload, restaurant_id: session.restaurantId }
    : body.payload
  const cleanPayload = filterPayload(body.table, base)

  // calisan_saatler / calisan_hizmetler restaurant_id taşımaz — calisan_id'nin
  // oturumun işletmesine ait olduğunu doğrula (cross-tenant yazma engeli)
  if (body.table === 'calisan_saatler' || body.table === 'calisan_hizmetler') {
    const calisanId = cleanPayload.calisan_id
    if (typeof calisanId !== 'string' || !calisanId) {
      return NextResponse.json({ error: 'calisan_id zorunlu' }, { status: 400 })
    }
    const { data: own } = await db
      .from('calisanlar')
      .select('id')
      .eq('restaurant_id', session.restaurantId)
      .in('id', [calisanId])
    if (!own?.length) return NextResponse.json({ error: 'Bu çalışan bu işletmeye ait değil' }, { status: 403 })
  }

  // calisan_saatler: (calisan_id, gun) üzerine upsert — tekrar kaydetme PK ihlali yapmasın
  if (body.table === 'calisan_saatler') {
    const { data, error } = await db
      .from(body.table)
      .upsert(cleanPayload, { onConflict: 'calisan_id,gun' })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

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
  let query = db.from(table).delete()
  if (table === 'calisan_hizmetler') {
    // id = `${calisan_id}_${hizmet_id}` — UUID'ler '_' içermez, kompozit anahtarla sil
    const [calisanId, hizmetId] = String(id).split('_')
    const { data: staffIds } = await db.from('calisanlar').select('id').eq('restaurant_id', session.restaurantId)
    // Staff yoksa scope guard'ı düşmemesi için erken çıkış (postgrest-js boş .in() atlar)
    if (!staffIds?.length) return NextResponse.json({ ok: true })
    query = query.eq('calisan_id', calisanId).eq('hizmet_id', hizmetId).in('calisan_id', staffIds.map(r => r.id))
  } else if (table === 'calisan_saatler') {
    const { data: staffIds } = await db.from('calisanlar').select('id').eq('restaurant_id', session.restaurantId)
    if (!staffIds?.length) return NextResponse.json({ ok: true })
    query = query.eq('id', id).in('calisan_id', staffIds.map(r => r.id))
  } else {
    query = query.eq('id', id).eq('restaurant_id', session.restaurantId)
  }
  const { error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// StaffManager hizmet listesi / çalışan-hizmet eşleşmesi için salt okunur sorgu
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const table = searchParams.get('table')
  if (!isAllowedTable(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  const denied = requireTablePermission(session, table)
  if (denied) return denied

  const db = getSupabaseAdmin()
  let query = db.from(table).select('*')
  if (WITH_RESTAURANT_ID.has(table)) {
    query = query.eq('restaurant_id', session.restaurantId)
  } else if (table === 'calisan_hizmetler' || table === 'calisan_saatler') {
    // restaurant_id kolonu yok — calisanlar üzerinden işletme kapsamı
    const { data: staffIds } = await db.from('calisanlar').select('id').eq('restaurant_id', session.restaurantId)
    query = query.in('calisan_id', staffIds?.map(r => r.id) ?? [])
  }
  const calisanId = searchParams.get('calisan_id')
  if (calisanId) query = query.eq('calisan_id', calisanId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
