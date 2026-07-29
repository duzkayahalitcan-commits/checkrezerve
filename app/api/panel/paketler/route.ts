import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

async function getSession() {
  const jar = await cookies()
  const token = jar.get('cr_panel')?.value
  return token ? verifySession(token) : null
}

// GET  /api/panel/paketler?restaurant_id=xxx
// POST /api/panel/paketler { restaurant_id, ad, seans_sayisi, gecerlilik_gun, fiyat?, hizmet_id? }
// PATCH /api/panel/paketler { id, ad?, seans_sayisi?, ... }
// DELETE /api/panel/paketler { id } — soft delete (aktif=false)

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('paketler')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurant_id, ad, seans_sayisi, gecerlilik_gun, fiyat, hizmet_id } = body
  if (!restaurant_id || !ad || !seans_sayisi || !gecerlilik_gun) {
    return NextResponse.json({ error: 'restaurant_id, ad, seans_sayisi, gecerlilik_gun required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('paketler')
    .insert({ restaurant_id, ad, seans_sayisi, gecerlilik_gun, fiyat: fiyat ?? null, hizmet_id: hizmet_id ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const allowed = ['ad', 'seans_sayisi', 'gecerlilik_gun', 'fiyat', 'hizmet_id', 'aktif']
  const setData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of allowed) {
    if (updates[k] !== undefined) setData[k] = updates[k]
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db.from('paketler').update(setData).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { error } = await db.from('paketler').update({ aktif: false, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
