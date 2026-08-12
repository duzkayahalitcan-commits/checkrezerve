import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { saveToCache, textToSlug } from '@/lib/audio-cache'
import { resolveAudioTokens, concatAudioBuffers } from '@/lib/audio-concat'
import { checkAssistantEnabled } from '@/lib/feature-flags'
import { resolveVoiceKey, getVoice, DEFAULT_VOICE_KEY } from '@/lib/voice-catalog'
import { rateLimit } from '@/lib/rate-limit'

// POST /api/ai-assistant/speak
// Body: { text, voice_id? }
// voice_id: ses KEY'i ('yunus' | 'mert' | 'lisa' | 'gulsu') veya ElevenLabs ID —
//           resolveVoiceKey ile ikisi de doğru sese çözülür.
// Returns audio/mpeg stream from:
//   1. Full-text disk cache — tüm tr/ alt kategorilerinde slug eşleşmesi arar
//      (tr/chatbot/{kategori}/{voice}/{slug}.mp3, tr/responses/{voice}/{slug}.mp3)
//   2. Audio token concatenation — zero-latency, no API call
//   3. ElevenLabs TTS — only for novel phrases

const TR_BASE = path.join(process.cwd(), 'public', 'audio', 'tr')

// Ses (KEY ya da ElevenLabs ID) → cache alt klasörü adı (4 ses de desteklenir)
function voiceCacheName(voiceId?: string): string {
  return resolveVoiceKey(voiceId ?? DEFAULT_VOICE_KEY)
}

// Ses (KEY ya da ElevenLabs ID) → ElevenLabs voice ID (voice-catalog tek kaynak)
function voiceElevenLabsId(voiceId?: string): string {
  const key = resolveVoiceKey(voiceId ?? DEFAULT_VOICE_KEY)
  return getVoice(key).elevenLabsId
}

/**
 * Tüm tr/ alt kategorilerinde tam slug eşleşmesi ara.
 * BUG 2 FİX: Yalnızca per-voice cache yollarını okur; flat
 * (ses-bağımsız) cache artık GEÇERSİZ sayılır (lisa/mert collision'ı böylece
 * giderilir — her ses kendi klasörüne yazılır/okunur).
 * Öncelik:
 *   1) tr/chatbot/{kategori}/{voice}/{slug}.mp3  (kalıp cümleler)
 *   2) tr/responses/{voice}/{slug}.mp3           (ses bazlı full-text cache)
 */
function findCachedAudio(slug: string, voiceName: string): string | null {
  const chatbotDir = path.join(TR_BASE, 'chatbot')
  // chatbot alt kategorileri (genel, rezervasyon, ozellikler, dogrulama, ...)
  let dirs: string[] = []
  try {
    dirs = fs.readdirSync(chatbotDir)
  } catch { /* chatbot yok */ }
  for (const d of dirs) {
    const p = path.join(chatbotDir, d, voiceName, `${slug}.mp3`)
    if (fs.existsSync(p)) return p
  }
  const respVoice = path.join(TR_BASE, 'responses', voiceName, `${slug}.mp3`)
  if (fs.existsSync(respVoice)) return respVoice
  return null
}

export async function POST(req: NextRequest) {
  // Güvenlik: Rate limit — ElevenLabs TTS maliyetli, anonim aşırı kullanımı engeller.
  const limited = await rateLimit(req, { prefix: 'speak', max: 30, windowMs: 60_000 })
  if (limited) return limited

  const t0 = Date.now()
  const body = await req.json()
  const { text, voice_id, restaurant_id } = body

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }

  // S1-T5 + BUG 3: ai_assistant_enabled master gate — restaurant_id verilmişse
  // zorunlu kontrol. enabled=false ise flag true olsa bile erişim reddedilir.
  if (restaurant_id) {
    const enabled = await checkAssistantEnabled(restaurant_id, 'ai_voice_search')
    if (!enabled) {
      return NextResponse.json({ error: 'Sesli asistan bu işletmede aktif değil' }, { status: 403 })
    }
  }

  // ── 1) Full-text disk cache ────────────────────────────────────
  const voiceName = voiceCacheName(voice_id)
  const slug = textToSlug(text)
  const hitPath = findCachedAudio(slug, voiceName)

  if (hitPath) {
    const buffer = fs.readFileSync(hitPath)
    console.log(`[speak] cache HIT voice=${voiceName} total=${Date.now() - t0}ms path=${path.relative(TR_BASE, hitPath)}`)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.byteLength.toString(),
        'X-Cache': 'HIT',
      },
    })
  }

  // ── 2) Token concatenation (no API call) ───────────────────────
  const { tokens, allExist } = resolveAudioTokens(text, voiceName)

  if (allExist && tokens.length > 0) {
    try {
      const paths = tokens.map(t => t.path)
      const buffer = concatAudioBuffers(paths)
      const audioData = new Uint8Array(buffer)

      // Seed the disk cache so future requests hit instantly (per-voice)
      saveToCache(text, buffer, voiceName)

      console.log(`[speak] concat total=${Date.now() - t0}ms tokens=${tokens.length}`)
      return new NextResponse(audioData, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.byteLength.toString(),
          'X-Cache': 'CONCAT',
        },
      })
    } catch (e) {
      // Concat failed — fall through to ElevenLabs
      console.error('Concat failed, falling back to ElevenLabs:', (e as Error).message)
    }
  }

  // ── 3) ElevenLabs TTS (full text) ──────────────────────────────
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 500 })
  }

  const vid = voiceElevenLabsId(voice_id)

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `ElevenLabs error: ${errText}` }, { status: 502 })
    }

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save to disk cache for future requests (per-voice)
    saveToCache(text, buffer, voiceName)

    console.log(`[speak] elevenlabs MISS total=${Date.now() - t0}ms`)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.byteLength.toString(),
        'X-Cache': 'MISS',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: `TTS failed: ${(e as Error).message}` }, { status: 502 })
  }
}
