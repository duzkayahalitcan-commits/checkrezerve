import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

const ALLOWED_TABLES = ['hizmetler', 'calisanlar', 'tables', 'special_areas'] as const
type AllowedTable = typeof ALLOWED_TABLES[number]

function isAllowedTable(t: unknown): t is AllowedTable {
  return typeof t === 'string' && (ALLOWED_TABLES as readonly string[]).includes(t)
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

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(body.table)
    .insert({ ...body.payload, restaurant_id: session.restaurantId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id, payload } = await req.json()
  if (!isAllowedTable(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(table)
    .update(payload)
    .eq('id', id)
    .eq('restaurant_id', session.restaurantId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id } = await req.json()
  if (!isAllowedTable(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { error } = await db
    .from(table)
    .delete()
    .eq('id', id)
    .eq('restaurant_id', session.restaurantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
