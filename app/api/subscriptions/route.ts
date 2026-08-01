import { NextRequest, NextResponse } from 'next/server'
import { cookies }                  from 'next/headers'
import { getSupabaseAdmin }         from '@/lib/supabase'
import { resolveApiSession }        from '@/lib/panel-auth'

// GET /api/subscriptions — aktif aboneliği döner
export async function GET(req: NextRequest) {
  const jar = await cookies()
  const session = await resolveApiSession(req, jar)
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('id, restaurant_id, plan, status, billing_period, price_per_period, currency, iyzico_customer_ref, iyzico_subscription_ref, iyzico_product_ref, iyzico_pricing_plan_ref, trial_start, trial_end, current_period_start, current_period_end, cancelled_at, cancel_reason, created_at, updated_at')
    .eq('restaurant_id', session.restaurantId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Sorgu hatası.' }, { status: 500 })
  return NextResponse.json({ subscription: data })
}
