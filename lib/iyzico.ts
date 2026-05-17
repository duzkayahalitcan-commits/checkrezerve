import { createHmac, randomBytes } from 'crypto'

const BASE_URL = process.env.IYZICO_BASE_URL    ?? 'https://sandbox.iyzipay.com'
const API_KEY  = process.env.IYZICO_API_KEY     ?? ''
const SECRET   = process.env.IYZICO_SECRET_KEY  ?? ''

function authHeader(randomKey: string, body: string): string {
  const sig = createHmac('sha256', SECRET).update(randomKey + body).digest('base64')
  return `IYZWSv2 apiKey:${API_KEY}&randomKey:${randomKey}&signature:${sig}`
}

async function req<T>(method: string, path: string, body?: object): Promise<T> {
  const rnd     = randomBytes(8).toString('hex')
  const bodyStr = body ? JSON.stringify(body) : ''
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': authHeader(rnd, bodyStr),
      'x-iyzi-rnd':    rnd,
    },
    ...(bodyStr ? { body: bodyStr } : {}),
  })
  return res.json() as Promise<T>
}

// ── Subscription checkout form başlat ────────────────────────────
export function initCheckoutForm(data: {
  pricingPlanReferenceCode: string
  subscriptionInitialStatus: 'ACTIVE' | 'PENDING'
  customer: {
    customerReferenceCode?: string
    gsmNumber:  string
    email:      string
    name:       string
    surname:    string
    billingAddress: {
      contactName: string
      city:        string
      country:     string
      address:     string
    }
  }
  callbackUrl:    string
  conversationId: string
}) {
  return req<{
    status:               string
    errorCode?:           string
    errorMessage?:        string
    checkoutFormContent:  string
    token:                string
    tokenExpireTime:      number
  }>('POST', '/v2/subscription/checkoutform/initialize', data)
}

// ── Checkout sonucunu sorgula ─────────────────────────────────────
export function retrieveCheckoutResult(token: string, conversationId: string) {
  return req<{
    status:                   string
    errorCode?:               string
    subscriptionReferenceCode?: string
    customerReferenceCode?:   string
    subscriptionStatus?:      string
    pricingPlanReferenceCode?: string
  }>('POST', '/v2/subscription/checkoutform/result', { token, conversationId })
}

// ── Abonelik iptal ────────────────────────────────────────────────
export function cancelSubscription(subscriptionRef: string) {
  return req<{ status: string; errorCode?: string; errorMessage?: string }>(
    'DELETE', `/v2/subscription/subscriptions/${subscriptionRef}`
  )
}

// ── Webhook imzası doğrula ────────────────────────────────────────
// İyzico imza: HMAC-SHA256(secret, eventType + conversationId + referenceCode)
export function verifyWebhookSignature(
  eventType:      string,
  conversationId: string,
  referenceCode:  string,
  received:       string,
): boolean {
  const expected = createHmac('sha256', SECRET)
    .update(`${eventType}${conversationId}${referenceCode}`)
    .digest('base64')
  return expected === received
}

// ── Plan referans kodu yardımcısı ─────────────────────────────────
export function getPricingPlanRef(
  plan: 'starter' | 'pro' | 'enterprise',
  period: 'monthly' | 'yearly',
): string {
  const key = `IYZICO_PLAN_${plan.toUpperCase()}_${period.toUpperCase()}_REF`
  return process.env[key] ?? ''
}
