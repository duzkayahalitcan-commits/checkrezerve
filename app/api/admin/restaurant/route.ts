import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

async function checkAdmin() {
  const adminSecret   = process.env.ADMIN_SECRET ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!adminSecret || !adminPassword) return false
  const jar = await cookies()
  const token = jar.get('cr_admin')?.value ?? ''
  if (!token) return false
  const expected = createHmac('sha256', adminSecret).update(adminPassword).digest('base64')
  return token === expected
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, is_active, plan, ai_assistant_enabled, ai_assistant_name, ai_assistant_voice } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing restaurant id' }, { status: 400 })

  const db = getSupabaseAdmin()

  if (is_active !== undefined) {
    const { error } = await db
      .from('restaurants')
      .update({ is_active })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (ai_assistant_enabled !== undefined || ai_assistant_name !== undefined || ai_assistant_voice !== undefined) {
    const updateData: Record<string, unknown> = {}
    if (ai_assistant_enabled !== undefined) updateData.ai_assistant_enabled = ai_assistant_enabled
    if (ai_assistant_name !== undefined) updateData.ai_assistant_name = ai_assistant_name
    if (ai_assistant_voice !== undefined) updateData.ai_assistant_voice = ai_assistant_voice
    const { error } = await db.from('restaurants').update(updateData).eq('id', id)
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
