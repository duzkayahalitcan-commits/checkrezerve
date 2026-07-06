import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('cr_panel')?.value
  const session = token ? verifySession(token) : null
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { restaurant_id, kroki_mode } = body
  if (!restaurant_id || !kroki_mode || !['tables', 'zones'].includes(kroki_mode)) {
    return NextResponse.json({ error: 'restaurant_id and kroki_mode (tables|zones) required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('restaurants')
    .update({ kroki_mode })
    .eq('id', restaurant_id)

  if (error) {
    console.error('[KrokiMode POST]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
