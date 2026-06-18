import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/panel-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

async function getSession() {
  const jar = await cookies()
  return verifySession(jar.get('cr_panel')?.value ?? '')
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const valid = ['pending', 'confirmed', 'cancelled', 'completed']
  if (!valid.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .eq('restaurant_id', session.restaurantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
