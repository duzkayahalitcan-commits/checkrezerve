import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

export async function GET(req: NextRequest) {
  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('restaurants')
    .select('kroki_zones')
    .eq('id', restaurantId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data?.kroki_zones ?? [])
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('cr_panel')?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurant_id, kroki_zones } = body
  if (!restaurant_id || !kroki_zones) {
    return NextResponse.json({ error: 'restaurant_id and kroki_zones required' }, { status: 400 })
  }

  if (restaurant_id !== session.restaurantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('restaurants')
    .update({ kroki_zones })
    .eq('id', restaurant_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
