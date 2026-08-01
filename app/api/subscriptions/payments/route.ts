import { NextRequest, NextResponse } from 'next/server'
import { cookies }                  from 'next/headers'
import { getSupabaseAdmin }         from '@/lib/supabase'
import { resolveApiSession }        from '@/lib/panel-auth'

// GET /api/subscriptions/payments?limit=20&offset=0
export async function GET(req: NextRequest) {
  const jar = await cookies()
  const session = await resolveApiSession(req, jar)
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '20', 10), 100)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0',  10), 0)

  const { data, error, count } = await getSupabaseAdmin()
    .from('subscription_payments')
    .select('id, subscription_id, restaurant_id, amount, currency, status, iyzico_payment_id, iyzico_basket_id, iyzico_conversation_id, period_start, period_end, error_code, error_message, paid_at, created_at', { count: 'exact' })
    .eq('restaurant_id', session.restaurantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: 'Sorgu hatası.' }, { status: 500 })
  return NextResponse.json({ payments: data, total: count })
}
