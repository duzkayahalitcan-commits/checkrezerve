import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

async function checkAdmin() {
  const adminPw = process.env.ADMIN_PASSWORD ?? ''
  const secret = process.env.ADMIN_SECRET ?? ''
  const expected = createHmac('sha256', secret).update(adminPw).digest('base64')
  const jar = await cookies()
  const raw = jar.get('cr_admin')?.value ?? ''
  return raw === expected
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, is_active, plan } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing restaurant id' }, { status: 400 })

  const db = getSupabaseAdmin()

  if (is_active !== undefined) {
    const { error } = await db
      .from('restaurants')
      .update({ is_active })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (plan) {
    const validPlans = ['starter', 'pro', 'enterprise']
    if (!validPlans.includes(plan.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    const { data: existing } = await db
      .from('subscriptions')
      .select('id')
      .eq('restaurant_id', id)
      .maybeSingle()

    let error
    if (existing) {
      ({ error } = await db
        .from('subscriptions')
        .update({ plan: plan.toLowerCase(), updated_at: new Date().toISOString() })
        .eq('id', existing.id))
    } else {
      ({ error } = await db
        .from('subscriptions')
        .insert({ restaurant_id: id, plan: plan.toLowerCase(), status: 'active', billing_period: 'monthly', price_per_period: 0, currency: 'TRY', updated_at: new Date().toISOString() }))
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
