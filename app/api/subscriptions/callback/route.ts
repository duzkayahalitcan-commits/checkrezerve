import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin }         from '@/lib/supabase'
import { retrieveCheckoutResult }   from '@/lib/iyzico'

// GET /api/subscriptions/callback?token=xxx&conversationId=xxx
// İyzico ödeme sonrası kullanıcıyı buraya yönlendirir.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token          = searchParams.get('token')          ?? ''
  const conversationId = searchParams.get('conversationId') ?? ''

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (!token) {
    return NextResponse.redirect(`${appUrl}/panel?subscription=error`)
  }

  const result = await retrieveCheckoutResult(token, conversationId)

  if (result.status !== 'success' || !result.subscriptionReferenceCode) {
    return NextResponse.redirect(`${appUrl}/panel?subscription=error`)
  }

  // conversationId formatı: {restaurantId}-{timestamp}
  const restaurantId = conversationId.split('-').slice(0, 5).join('-')

  const db = getSupabaseAdmin()

  // Trialing kaydı bul ve İyzico referanslarıyla güncelle
  await db
    .from('subscriptions')
    .update({
      status:                  'active',
      iyzico_subscription_ref: result.subscriptionReferenceCode,
      iyzico_customer_ref:     result.customerReferenceCode ?? null,
      current_period_start:    new Date().toISOString(),
    })
    .eq('restaurant_id', restaurantId)
    .eq('status', 'trialing')

  return NextResponse.redirect(`${appUrl}/panel?subscription=success`)
}
