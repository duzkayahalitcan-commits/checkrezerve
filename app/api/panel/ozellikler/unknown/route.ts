import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

export async function GET(req: NextRequest) {
  const session = verifySession((await cookies()).get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurantId = req.nextUrl.searchParams.get('restaurant_id')
  if (!restaurantId) return NextResponse.json({ error: 'restaurant_id required' }, { status: 400 })
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('conversations')
    .select('id, user_message, created_at')
    .eq('restaurant_id', restaurantId)
    .eq('is_unknown', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data ?? [])
}
