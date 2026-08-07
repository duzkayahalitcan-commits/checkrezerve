import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), 'public', 'audio', 'tr', 'responses')

/**
 * Convert text to a filesystem-safe slug.
 */
export function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80)
}

/**
 * Absolute filesystem path to the cached MP3 for this text.
 * BUG 2 FİX: voice verilirse per-voice klasöre yazar
 * (responses/{voice}/{slug}.mp3) — tüm sesler için ayrı cache.
 * voice verilmezse eski flat path (responses/{slug}.mp3) korunur.
 */
export function getCachePath(text: string, voice?: string): string {
  const slug = textToSlug(text)
  return voice
    ? path.join(CACHE_DIR, voice, `${slug}.mp3`)
    : path.join(CACHE_DIR, `${slug}.mp3`)
}

/** Public URL path for the cached MP3 (served by Next.js static /public). */
export function getCacheUrl(text: string, voice?: string): string {
  const slug = textToSlug(text)
  return voice
    ? `/audio/tr/responses/${voice}/${slug}.mp3`
    : `/audio/tr/responses/${slug}.mp3`
}

/** Check whether a cached audio file exists for this text (voice-aware). */
export function checkCache(text: string, voice?: string): boolean {
  return fs.existsSync(getCachePath(text, voice))
}

/**
 * Save an MP3 buffer to the cache. Creates the directory if needed.
 * BUG 2 FİX: voice verilirse per-voice klasöre yazar (tüm sesler için ayrı cache),
 * böylece lisa/mert birbirinin sesini çalmaz (cache collision yok).
 */
export function saveToCache(text: string, buffer: Buffer, voice?: string): void {
  const dir = voice ? path.join(CACHE_DIR, voice) : CACHE_DIR
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(getCachePath(text, voice), buffer)
}
