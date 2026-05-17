import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin }         from '@/lib/supabase'

// GET /api/subscriptions/checkout-form?session=<log_id>
// Serves the Iyzico checkout HTML page for mobile browsers.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session')
  if (!sessionId) {
    return new NextResponse('Geçersiz oturum.', { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('iyzico_webhook_logs')
    .select('payload')
    .eq('id', sessionId)
    .eq('event_type', 'CHECKOUT_FORM_INIT')
    .maybeSingle()

  if (error || !data) {
    return new NextResponse('Oturum bulunamadı veya süresi doldu.', { status: 404 })
  }

  const formContent = (data.payload as Record<string, unknown>).checkoutFormContent as string ?? ''

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CheckRezerve — Ödeme</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 16px; }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; color: #E53935; font-weight: 700; }
    #iyzipay-checkout-form { background: #fff; border-radius: 12px; overflow: hidden; }
  </style>
</head>
<body>
  <div class="header">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#E53935"/>
      <text x="14" y="19" text-anchor="middle" fill="white" font-size="14" font-weight="bold">C</text>
    </svg>
    <h1>CheckRezerve</h1>
  </div>
  <div id="iyzipay-checkout-form">${formContent}</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
