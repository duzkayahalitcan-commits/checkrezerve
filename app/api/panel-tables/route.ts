import { type NextRequest, NextResponse } from 'next/server'
import { getPanelSession } from '@/app/panel/login/actions'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getPanelSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

export async function PATCH(req: NextRequest) {
  const session = await getPanelSession()
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
  const session = await getPanelSession()
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
