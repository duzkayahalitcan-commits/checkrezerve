import { NextRequest, NextResponse } from 'next/server'
import { cookies }                  from 'next/headers'
import { getSupabaseAdmin }         from '@/lib/supabase'
import { resolveApiSession }        from '@/lib/panel-auth'
import { initCheckoutForm, getPricingPlanRef } from '@/lib/iyzico'
import { rateLimit } from '@/lib/rate-limit'

// POST /api/subscriptions/checkout
// Body: { plan, billing_period, customer: { email, name, surname, phone, city, address } }
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { prefix: 'checkout', max: 5, windowMs: 60_000 })
  if (limited) return limited
  const jar = await cookies()
  const session = await resolveApiSession(req, jar)
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })

  const body = await req.json()
  const { plan, billing_period, customer } = body

  if (!plan || !billing_period || !customer?.email) {
    return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 })
  }

  const pricingPlanRef = getPricingPlanRef(plan, billing_period)
  if (!pricingPlanRef) {
    return NextResponse.json({ error: 'Plan referans kodu tanımlı değil.' }, { status: 500 })
  }

  // Mevcut aktif abonelik varsa engelle
  const db = getSupabaseAdmin()
  const { data: existing } = await db
    .from('subscriptions')
    .select('id')
    .eq('restaurant_id', session.restaurantId)
    .in('status', ['active', 'trialing', 'past_due'])
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Zaten aktif bir aboneliğiniz var.' }, { status: 409 })
  }

  const conversationId = `${session.restaurantId}-${Date.now()}`
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/callback`

  const result = await initCheckoutForm({
    pricingPlanReferenceCode:  pricingPlanRef,
    subscriptionInitialStatus: 'ACTIVE',
    customer: {
      gsmNumber:  customer.phone,
      email:      customer.email,
      name:       customer.name,
      surname:    customer.surname,
      billingAddress: {
        contactName: `${customer.name} ${customer.surname}`,
        city:        customer.city    ?? 'Istanbul',
        country:     customer.country ?? 'Turkey',
        address:     customer.address ?? '-',
      },
    },
    callbackUrl,
    conversationId,
  })

  if (result.status !== 'success') {
    return NextResponse.json(
      { error: result.errorMessage ?? 'İyzico bağlantı hatası.' },
      { status: 502 }
    )
  }

  // Pending abonelik kaydı oluştur — webhook ile aktifleşecek
  const { error: dbErr } = await db.from('subscriptions').insert({
    restaurant_id:   session.restaurantId,
    plan,
    billing_period,
    status:          'trialing',
    price_per_period: 0, // webhook'ta güncellenecek
    iyzico_pricing_plan_ref: pricingPlanRef,
  })

  if (dbErr) console.error('[subscriptions/checkout] db insert:', dbErr)

  // Checkout formunu geçici olarak logla — mobil uygulama bu URL'yi açar
  const { data: logEntry } = await db
    .from('iyzico_webhook_logs')
    .insert({
      event_type:       'CHECKOUT_FORM_INIT',
      payload:          { checkoutFormContent: result.checkoutFormContent, token: result.token },
      subscription_ref: null,
      processed:        false,
    })
    .select('id')
    .single()

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://checkrezerve.com'
  const checkoutUrl = logEntry?.id
    ? `${appUrl}/api/subscriptions/checkout-form?session=${logEntry.id}`
    : null

  return NextResponse.json({
    checkoutFormContent: result.checkoutFormContent,
    token:               result.token,
    checkoutUrl,
  })
}
