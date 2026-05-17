import { NextRequest, NextResponse } from 'next/server'
import { cookies }                  from 'next/headers'
import { getSupabaseAdmin }         from '@/lib/supabase'
import { verifySession }            from '@/lib/panel-auth'

// GET /api/subscriptions — aktif aboneliği döner
export async function GET(_req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*')
    .eq('restaurant_id', session.restaurantId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Sorgu hatası.' }, { status: 500 })
  return NextResponse.json({ subscription: data })
}
