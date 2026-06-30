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
    .select('kroki_data')
    .eq('id', restaurantId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data?.kroki_data ?? [])
}

export async function POST(req: NextRequest) {
  // Auth: panel session or admin secret
  const cookieStore = await cookies()
  const token = cookieStore.get('cr_panel')?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurant_id, kroki_data } = body
  if (!restaurant_id || !kroki_data) {
    return NextResponse.json({ error: 'restaurant_id and kroki_data required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('restaurants')
    .update({
      kroki_data,
      kroki_enabled: true,
    })
    .eq('id', restaurant_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
