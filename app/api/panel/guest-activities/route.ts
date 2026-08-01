import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifySession } from '@/lib/panel-auth'
import { logGuestActivity, type GuestActivityType } from '@/lib/guest-activities'

async function getSession() {
  const jar = await cookies()
  const token = jar.get('cr_panel')?.value
  return token ? verifySession(token) : null
}

const VALID_TYPES: GuestActivityType[] = ['reservation', 'cancellation', 'note', 'tag_change', 'payment']

// POST /api/panel/guest-activities
// Body: { guest_id, activity_type, description?, metadata? }
// Panel (cookie auth) tarafından misafir etkinliklerini service-role ile loglar.
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { guest_id, activity_type, description, metadata } = body

  if (!guest_id || !activity_type || !VALID_TYPES.includes(activity_type)) {
    return NextResponse.json({ error: 'guest_id ve geçerli activity_type gerekli' }, { status: 400 })
  }

  // Misafir, oturumdaki işletmeye ait olmalı
  const { data: guest } = await getSupabaseAdmin()
    .from('guests')
    .select('id')
    .eq('id', guest_id)
    .eq('restaurant_id', session.restaurantId)
    .maybeSingle()

  if (!guest) return NextResponse.json({ error: 'Misafir bulunamadı' }, { status: 404 })

  await logGuestActivity({
    guest_id,
    activity_type,
    description: description ?? null,
    metadata: metadata ?? null,
  })

  return NextResponse.json({ success: true })
}
