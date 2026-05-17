import { NextRequest, NextResponse } from 'next/server'
import { cookies }                  from 'next/headers'
import { getSupabaseAdmin }         from '@/lib/supabase'
import { verifySession }            from '@/lib/panel-auth'
import { cancelSubscription }       from '@/lib/iyzico'

// POST /api/subscriptions/cancel
// Body: { reason? }
export async function POST(req: NextRequest) {
  const jar = await cookies()
  const session = verifySession(jar.get('cr_panel')?.value ?? '')
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const { reason } = await req.json().catch(() => ({ reason: undefined }))

  const db = getSupabaseAdmin()

  const { data: sub, error: fetchErr } = await db
    .from('subscriptions')
    .select('id, iyzico_subscription_ref')
    .eq('restaurant_id', session.restaurantId)
    .in('status', ['active', 'trialing', 'past_due'])
    .maybeSingle()

  if (fetchErr || !sub) {
    return NextResponse.json({ error: 'Aktif abonelik bulunamadı.' }, { status: 404 })
  }

  // İyzico'da iptal
  if (sub.iyzico_subscription_ref) {
    const result = await cancelSubscription(sub.iyzico_subscription_ref)
    if (result.status !== 'success') {
      return NextResponse.json(
        { error: result.errorMessage ?? 'İyzico iptal hatası.' },
        { status: 502 }
      )
    }
  }

  // DB güncelle
  const { error: updateErr } = await db
    .from('subscriptions')
    .update({
      status:       'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason ?? null,
    })
    .eq('id', sub.id)

  if (updateErr) return NextResponse.json({ error: 'Güncelleme hatası.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
