import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

// S2-T4: Redis destekli rate limiting.
// REDIS_URL tanımlıysa Redis kullanılır (Upstash/VPS Redis — `rediss://` TLS destekli).
// REDIS_URL yoksa in-memory fallback (mevcut davranış) — production'da bozulma olmaz.

interface RateLimitEntry {
  count: number
  resetAt: number
}

// ── Redis client (lazy singleton) ─────────────────────────────────
let redis: Redis | null = null
let redisError = false

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL
  if (!url || redisError) return null
  if (!redis) {
    try {
      redis = new Redis(url, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: false,
        enableOfflineQueue: false,
      })
      redis.on('error', () => { redisError = true })
    } catch {
      redis = null
    }
  }
  return redis
}

// ── In-memory fallback store ──────────────────────────────────────
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
 * Returns null if within limits. Redis varsa Redis, yoksa in-memory kullanır.
 */
export async function rateLimit(
  req: NextRequest,
  opts: { prefix: string; max: number; windowMs: number }
): Promise<NextResponse | null> {
  const key = getKey(req, opts.prefix)
  const client = getRedis()

  // ── Redis yolu (REDIS_URL tanımlıysa) ───────────────────────────
  if (client) {
    try {
      const redisKey = `rl:${key}`
      const count = await client.incr(redisKey)
      if (count === 1) await client.pexpire(redisKey, opts.windowMs)
      if (count > opts.max) {
        return NextResponse.json(
          { error: 'Çok fazla istek. Lütfen bekleyin.' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil(opts.windowMs / 1000)) } }
        )
      }
      return null
    } catch {
      // Redis hatası → in-memory fallback'e düş
    }
  }

  // ── In-memory fallback (mevcut davranış) ────────────────────────
  const now = Date.now()
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
