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
      // ioredis kendisi yeniden bağlanır; önceden tek bir hata Redis'i süreç boyunca devre dışı bırakıyordu
      redis.on('ready', () => { redisError = false })
    } catch {
      redis = null
    }
  }
  return redis
}

// OB-03: health endpoint için Redis durumu. Bir kez hata alınınca `redisError` kalıcı
// olarak true olur ve rate-limit sessizce in-memory'ye düşer — bu fonksiyon onu görünür kılar.
export async function redisHealth(): Promise<'disabled' | 'ok' | 'error'> {
  if (!process.env.REDIS_URL) return 'disabled'
  const client = getRedis()
  if (!client) return 'error'
  try {
    const pong = await Promise.race([
      client.ping(),
      new Promise<string>((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500)),
    ])
    return pong === 'PONG' ? 'ok' : 'error'
  } catch {
    return 'error'
  }
}

// ── In-memory fallback store ──────────────────────────────────────
const store = new Map<string, RateLimitEntry>()

// SC-03: nginx X-Real-IP'yi $remote_addr ile yazıyor (istemci değiştiremez). X-Forwarded-For'un ilk
// değeri istemcinin gönderdiği başlıktan gelebildiği için limit atlatılabiliyordu → yalnız yedek.
function clientIp(get: (name: string) => string | null | undefined): string {
  return get('x-real-ip')?.trim() || get('x-forwarded-for')?.split(',').pop()?.trim() || 'unknown'
}

function getKey(req: NextRequest, prefix: string): string {
  return `${prefix}:${clientIp(n => req.headers.get(n))}`
}

/** Sayaç: limit aşıldıysa kaç saniye sonra tekrar denenebileceğini, aşılmadıysa null döner. */
async function hit(key: string, max: number, windowMs: number): Promise<number | null> {
  const client = getRedis()
  if (client) {
    try {
      const redisKey = `rl:${key}`
      const count = await client.incr(redisKey)
      if (count === 1) await client.pexpire(redisKey, windowMs)
      return count > max ? Math.ceil(windowMs / 1000) : null
    } catch {
      // Redis hatası → in-memory
    }
  }
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }
  if (entry.count >= max) return Math.ceil((entry.resetAt - now) / 1000)
  entry.count++
  return null
}

/**
 * Returns a 429 response if the caller exceeds `max` requests per `windowMs`.
 * Returns null if within limits. Redis varsa Redis, yoksa in-memory kullanır.
 */
export async function rateLimit(
  req: NextRequest,
  opts: { prefix: string; max: number; windowMs: number }
): Promise<NextResponse | null> {
  const retryAfter = await hit(getKey(req, opts.prefix), opts.max, opts.windowMs)
  if (retryAfter === null) return null
  return NextResponse.json(
    { error: 'Çok fazla deneme. Lütfen biraz bekleyip tekrar deneyin.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}

/**
 * SC-03: Server action'lar için (NextRequest yok). Limit aşıldıysa Türkçe hata metni, değilse null.
 * Anahtar: istemci IP + (varsa) ek anahtar (ör. kullanıcı adı — hesap bazlı brute force'a karşı).
 */
export async function rateLimitAction(
  opts: { prefix: string; max: number; windowMs: number; extraKey?: string }
): Promise<string | null> {
  const { headers } = await import('next/headers')
  const h = await headers()
  const ip = clientIp(n => h.get(n))
  const keys = [`${opts.prefix}:${ip}`]
  if (opts.extraKey) keys.push(`${opts.prefix}:k:${opts.extraKey.toLowerCase()}`)
  for (const k of keys) {
    const retryAfter = await hit(k, opts.max, opts.windowMs)
    if (retryAfter !== null) return `Çok fazla deneme. Lütfen ${Math.ceil(retryAfter / 60)} dakika sonra tekrar deneyin.`
  }
  return null
}
