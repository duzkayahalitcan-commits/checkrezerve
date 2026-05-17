import { NextRequest, NextResponse } from 'next/server'
import { getPanelSession }           from '@/app/panel/login/actions'
import { getSupabaseAdmin }          from '@/lib/supabase'
import type { WorkingHours }         from '@/types'

export async function PATCH(req: NextRequest) {
  const session = await getPanelSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    working_hours?:     WorkingHours
    closed_dates?:      string[]
    prepayment_amount?: number
    dress_code?:        string | null
    special_notes?:     string | null
    restaurant_id?:     string
  }

  const restaurantId = body.restaurant_id ?? session.restaurantId
  if (restaurantId !== session.restaurantId && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const update: Record<string, unknown> = {}
  if (body.working_hours     !== undefined) update.working_hours     = body.working_hours
  if (body.closed_dates      !== undefined) update.closed_dates      = body.closed_dates
  if (body.prepayment_amount !== undefined) update.prepayment_amount = body.prepayment_amount
  if (body.dress_code        !== undefined) update.dress_code        = body.dress_code || null
  if (body.special_notes     !== undefined) update.special_notes     = body.special_notes || null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db
    .from('restaurants')
    .update(update)
    .eq('id', restaurantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
