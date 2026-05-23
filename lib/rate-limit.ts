import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (single instance per worker — sufficient for Edge/Node single-process)
const store = new Map<string, RateLimitEntry>()

function getKey(req: NextRequest, prefix: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  return `${prefix}:${ip}`
}

/**
 * Returns a 429 response if the caller exceeds `max` requests per `windowMs`.
 * Returns null if the request is within limits.
 */
export function rateLimit(
  req: NextRequest,
  opts: { prefix: string; max: number; windowMs: number }
): NextResponse | null {
  const now   = Date.now()
  const key   = getKey(req, opts.prefix)
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs })
    return null
  }

  if (entry.count >= opts.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  entry.count++
  return null
}
