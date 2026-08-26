import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { saveToCache, textToSlug } from '@/lib/audio-cache'
import { resolveVoiceKey, getVoice, DEFAULT_VOICE_KEY } from '@/lib/voice-catalog'

// POST /api/admin/cache-conversation
// Body: { conversation_id, text, voice_id? }
// Purpose: Re-generate audio via ElevenLabs and mark as cached
// BUG 2 FİX: cache per-voice yazılır (voice_id KEY ya da ElevenLabs ID olabilir;
// resolveVoiceKey ile çözülür) — lisa/mert collision'ı giderilir.

// GÜVENLİK: Bu uç, ücretli ElevenLabs çağrısı yapar ve service_role ile
// conversations tablosunu günceller. Anonim erişim maliyet istismarı ve
// yetkisiz DB yazımı demektir — diğer /admin uçlarıyla aynı HMAC kapısını kullan.
async function checkAdmin() {
  const adminSecret   = process.env.ADMIN_SECRET ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  if (!adminSecret || !adminPassword) return false
  const jar = await cookies()
  const token = jar.get('cr_admin')?.value ?? ''
  if (!token) return false
  const expected = createHmac('sha256', adminSecret).update(adminPassword).digest('base64')
  return token === expected
}

export async function POST(req: NextRequest) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { conversation_id, text, voice_id } = body

    if (!conversation_id || !text) {
      return NextResponse.json({ error: 'conversation_id and text required' }, { status: 400 })
    }

    // 1. Call ElevenLabs TTS
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 500 })
    }

    // BUG 2 FİX: voice_id'yi ses KEY'ine çöz (KEY ya da ElevenLabs ID kabul)
    const voiceKey = resolveVoiceKey(voice_id ?? DEFAULT_VOICE_KEY)
    const vid = getVoice(voiceKey).elevenLabsId
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `ElevenLabs error: ${errText}` }, { status: 502 })
    }

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 2. Save to disk cache (BUG 2 FİX: per-voice)
    saveToCache(text, buffer, voiceKey)

    // 3. Update DB: mark response_source = 'cache'
    const supabase = getSupabaseAdmin()
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ response_source: 'cache' })
      .eq('id', conversation_id)

    if (updateError) {
      console.error('[cache-conversation] DB update error:', updateError.message)
    }

    return NextResponse.json({
      success: true,
      voice: voiceKey,
      slug: `${voiceKey}/${textToSlug(text)}.mp3`,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
