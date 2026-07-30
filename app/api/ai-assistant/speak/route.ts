import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { checkCache, getCachePath, saveToCache } from '@/lib/audio-cache'
import { resolveAudioTokens, concatAudioBuffers } from '@/lib/audio-concat'

// POST /api/ai-assistant/speak
// Body: { text, voice_id? }
// Returns audio/mpeg stream from:
//   1. Disk cache (full text) — instant replay
//   2. Audio token concatenation — zero-latency, no API call
//   3. ElevenLabs TTS — only for novel phrases

const DEFAULT_VOICE_ID = 'jbJMQWv1eS4YjQ6PCcn6' // Gülsu

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { text, voice_id } = body

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }

  // ── 1) Full-text disk cache ────────────────────────────────────
  if (checkCache(text)) {
    const buffer = fs.readFileSync(getCachePath(text))
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.byteLength.toString(),
        'X-Cache': 'HIT',
      },
    })
  }

  // ── 2) Token concatenation (no API call) ───────────────────────
  const { tokens, allExist } = resolveAudioTokens(text, 'gulsu')

  if (allExist && tokens.length > 0) {
    try {
      const paths = tokens.map(t => t.path)
      const buffer = concatAudioBuffers(paths)
      const audioData = new Uint8Array(buffer)

      // Seed the disk cache so future requests hit instantly
      saveToCache(text, buffer)

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

  const vid = voice_id || DEFAULT_VOICE_ID

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

    // Save to disk cache for future requests
    saveToCache(text, buffer)

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
