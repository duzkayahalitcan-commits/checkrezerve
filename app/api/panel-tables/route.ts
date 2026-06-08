import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const jar = await cookies()
  const raw = jar.get('cr_panel')?.value ?? ''

  const session = verifySession(raw)
  if (!session) {
    console.log('[panel-tables POST] Unauthorized — cookie raw:', raw ? raw.slice(0, 30) + '...' : 'YOK')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(body.table)
    .insert({ ...body.payload, restaurant_id: session.restaurantId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

async function getSessionOr401() {
  const jar = await cookies()
  const raw = jar.get('cr_panel')?.value ?? ''
  return verifySession(raw)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOr401()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id, payload } = await req.json()
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
  const session = await getSessionOr401()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id } = await req.json()
  const db = getSupabaseAdmin()
  const { error } = await db
    .from(table)
    .delete()
    .eq('id', id)
    .eq('restaurant_id', session.restaurantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
