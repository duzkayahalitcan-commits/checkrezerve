import fs from 'fs'
import path from 'path'

const AUDIO_BASE = path.join(process.cwd(), 'public', 'audio', 'tr')
const DEFAULT_VOICE = 'gulsu'

// Turkish ASCII-folding for filenames
function foldTurkish(s: string): string {
  return s
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
}

/** Resolve a number into one or more token filenames (without extension). */
function numberToTokens(n: number, voice: string): string[] {
  // Direct file exists (sayilar has 1..50 at least)
  const direct = path.join(AUDIO_BASE, 'sayilar', voice, `${n}.mp3`)
  if (n >= 0 && n <= 99 && fs.existsSync(direct)) return [String(n)]

  // Decompose: 10s + 1s
  // sayilar only has 1..50, 10/20/30/40/50 on tens
  // For 51-99, split into e.g. "50" + "1"
  const onlar = Math.floor(n / 10) * 10
  const birler = n % 10
  const tokens: string[] = []
  if (onlar > 0) tokens.push(String(onlar))
  if (birler > 0) tokens.push(String(birler))
  return tokens
}

export interface AudioToken {
  path: string
  exists: boolean
  text: string
}

export interface ResolveResult {
  tokens: AudioToken[]
  allExist: boolean
}

/**
 * Break a Turkish text into the smallest audio-file tokens available.
 *
 * @returns resolved tokens with full filesystem paths and an allExist flag.
 */
export function resolveAudioTokens(text: string, voice = DEFAULT_VOICE): ResolveResult {
  // Normalise: lowercase, fold Turkish chars, collapse whitespace, remove punctuation
  const cleaned = foldTurkish(text.toLowerCase())
    .replace(/[.,!?;:""''()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = cleaned.split(/\s+/)
  const tokens: AudioToken[] = []

  for (const word of words) {
    if (!word) continue

    let found = false

    // 1) Saat format: "14:30" or "14.30" → saat_14_30.mp3
    const saatMatch = word.match(/^(\d{1,2})[:.](\d{2})$/)
    if (saatMatch) {
      const p = path.join(AUDIO_BASE, 'saatler', voice, `saat_${saatMatch[1]}_${saatMatch[2]}.mp3`)
      const exists = fs.existsSync(p)
      tokens.push({ path: p, exists, text: word })
      if (!exists) found = true // will trigger ElevenLabs fallback
      continue
    }

    // 2) Pure number
    const num = parseInt(word, 10)
    if (!isNaN(num) && word === String(num)) {
      if (num >= 0 && num <= 999) {
        const numTokens = numberToTokens(num, voice)
        for (const nt of numTokens) {
          const p = path.join(AUDIO_BASE, 'sayilar', voice, `${nt}.mp3`)
          const exists = fs.existsSync(p)
          tokens.push({ path: p, exists, text: word })
          if (!exists) found = true
        }
        if (numTokens.length > 0) continue
      }
    }

    // 3) Gunler (days)
    const gunler: Record<string, string> = {
      'pazartesi': 'pazartesi', 'sali': 'sali', 'carsamba': 'carsamba',
      'persembe': 'persembe', 'cuma': 'cuma', 'cumartesi': 'cumartesi', 'pazar': 'pazar',
      'bugun': 'bugun', 'yarin': 'yarin',
    }
    if (gunler[word]) {
      // Try "bu carsamba" pattern? No — those are `bu_carsamba.mp3` in gunler dir
      const p = path.join(AUDIO_BASE, 'gunler', voice, `${gunler[word]}.mp3`)
      const exists = fs.existsSync(p)
      tokens.push({ path: p, exists, text: word })
      if (exists) continue
      // fall through to chatbot/genel
    }

    // 3b) "bu pazartesi", "gelecek sali" patterns
    // Those are only relevant if the previous token was bu/gelecek etc.
    // We handle bu/gelecek as separate words that may have their own chatbot files.

    // 4) Aylar (months)
    const aylar: Record<string, string> = {
      'ocak': 'ocak', 'subat': 'subat', 'mart': 'mart', 'nisan': 'nisan',
      'mayis': 'mayis', 'haziran': 'haziran', 'temmuz': 'temmuz', 'agustos': 'agustos',
      'eylul': 'eylul', 'ekim': 'ekim', 'kasim': 'kasim', 'aralik': 'aralik',
    }
    if (aylar[word]) {
      const p = path.join(AUDIO_BASE, 'aylar', voice, `${aylar[word]}.mp3`)
      const exists = fs.existsSync(p)
      tokens.push({ path: p, exists, text: word })
      if (exists) continue
    }

    // 5) Chatbot genel (general phrases)
    const chatPath = path.join(AUDIO_BASE, 'chatbot', 'genel', voice, `${word}.mp3`)
    const chatExists = fs.existsSync(chatPath)
    if (chatExists) {
      tokens.push({ path: chatPath, exists: true, text: word })
      continue
    }

    // 6) Fallback — token not found in any directory
    tokens.push({ path: '', exists: false, text: word })
  }

  return { tokens, allExist: tokens.every(t => t.exists) }
}

/**
 * Concatenate multiple MP3 buffers into one continuous buffer.
 * Works for CBR MP3 files; each file is kept as-is and concatenated.
 */
export function concatAudioBuffers(paths: string[]): Buffer {
  const buffers = paths.map(p => fs.readFileSync(p))
  return Buffer.concat(buffers) as unknown as Buffer
}
