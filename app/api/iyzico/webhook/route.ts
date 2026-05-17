import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin }         from '@/lib/supabase'
import { verifyWebhookSignature }   from '@/lib/iyzico'

// POST /api/iyzico/webhook
// İyzico'nun gönderdiği abonelik olaylarını işler.
export async function POST(req: NextRequest) {
  const payload = await req.json()

  const {
    iyziEventType,
    iyziPaymentConversationId,
    iyziReferenceCode,        // subscription reference code
    iyziHmacSignature,
  } = payload

  // İmza doğrulama
  const valid = verifyWebhookSignature(
    iyziEventType,
    iyziPaymentConversationId ?? '',
    iyziReferenceCode         ?? '',
    iyziHmacSignature         ?? '',
  )

  const db = getSupabaseAdmin()

  // Her webhook'u logla (imza geçersiz de dahil)
  const { data: logEntry } = await db
    .from('iyzico_webhook_logs')
    .insert({
      event_type:       iyziEventType,
      payload,
      subscription_ref: iyziReferenceCode ?? null,
      processed:        false,
    })
    .select('id')
    .single()

  if (!valid) {
    console.warn('[iyzico/webhook] geçersiz imza', { iyziEventType })
    return NextResponse.json({ error: 'Geçersiz imza.' }, { status: 401 })
  }

  try {
    await processEvent(db, iyziEventType, iyziReferenceCode, payload)

    // Log'u işlendi olarak işaretle
    if (logEntry?.id) {
      await db
        .from('iyzico_webhook_logs')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', logEntry.id)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[iyzico/webhook] işleme hatası:', msg)
    if (logEntry?.id) {
      await db
        .from('iyzico_webhook_logs')
        .update({ process_error: msg })
        .eq('id', logEntry.id)
    }
    return NextResponse.json({ error: 'İşleme hatası.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function processEvent(
  db: ReturnType<typeof getSupabaseAdmin>,
  eventType: string,
  subscriptionRef: string,
  payload: Record<string, unknown>,
) {
  switch (eventType) {
    case 'SUBSCRIPTION_CREATED': {
      await db
        .from('subscriptions')
        .update({ status: 'active', iyzico_subscription_ref: subscriptionRef })
        .eq('iyzico_subscription_ref', subscriptionRef)
      break
    }

    case 'SUBSCRIPTION_RENEWED': {
      const periodEnd = payload.nextPaymentDate
        ? new Date(payload.nextPaymentDate as string).toISOString()
        : null

      await db
        .from('subscriptions')
        .update({
          status:               'active',
          current_period_start: new Date().toISOString(),
          ...(periodEnd ? { current_period_end: periodEnd } : {}),
        })
        .eq('iyzico_subscription_ref', subscriptionRef)
      break
    }

    case 'SUBSCRIPTION_PAYMENT_SUCCESS': {
      const { data: sub } = await db
        .from('subscriptions')
        .select('id, restaurant_id')
        .eq('iyzico_subscription_ref', subscriptionRef)
        .maybeSingle()

      if (sub) {
        await db.from('subscription_payments').insert({
          subscription_id:        sub.id,
          restaurant_id:          sub.restaurant_id,
          amount:                 payload.price          ?? 0,
          currency:               payload.currency       ?? 'TRY',
          status:                 'success',
          iyzico_payment_id:      payload.paymentId      ?? null,
          iyzico_conversation_id: payload.conversationId ?? null,
          period_start:           payload.periodStartDate ?? null,
          period_end:             payload.periodEndDate   ?? null,
          paid_at:                new Date().toISOString(),
        })

        await db
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', sub.id)
      }
      break
    }

    case 'SUBSCRIPTION_PAYMENT_FAILURE': {
      const { data: sub } = await db
        .from('subscriptions')
        .select('id, restaurant_id')
        .eq('iyzico_subscription_ref', subscriptionRef)
        .maybeSingle()

      if (sub) {
        await db.from('subscription_payments').insert({
          subscription_id:   sub.id,
          restaurant_id:     sub.restaurant_id,
          amount:            payload.price  ?? 0,
          currency:          payload.currency ?? 'TRY',
          status:            'failure',
          error_code:        payload.errorCode    ?? null,
          error_message:     payload.errorMessage ?? null,
        })

        await db
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('id', sub.id)
      }
      break
    }

    case 'SUBSCRIPTION_CANCELLED': {
      await db
        .from('subscriptions')
        .update({
          status:       'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: 'iyzico_event',
        })
        .eq('iyzico_subscription_ref', subscriptionRef)
      break
    }

    case 'SUBSCRIPTION_EXPIRED': {
      await db
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('iyzico_subscription_ref', subscriptionRef)
      break
    }

    default:
      console.info('[iyzico/webhook] bilinmeyen event:', eventType)
  }
}
