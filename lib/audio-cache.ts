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

/** Absolute filesystem path to the cached MP3 for this text. */
export function getCachePath(text: string): string {
  return path.join(CACHE_DIR, `${textToSlug(text)}.mp3`)
}

/** Public URL path for the cached MP3 (served by Next.js static /public). */
export function getCacheUrl(text: string): string {
  return `/audio/tr/responses/${textToSlug(text)}.mp3`
}

/** Check whether a cached audio file exists for this text. */
export function checkCache(text: string): boolean {
  return fs.existsSync(getCachePath(text))
}

/** Save an MP3 buffer to the cache. Creates the directory if needed. */
export function saveToCache(text: string, buffer: Buffer): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  fs.writeFileSync(getCachePath(text), buffer)
}
