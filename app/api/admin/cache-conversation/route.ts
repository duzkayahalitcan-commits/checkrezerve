import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { getSupabaseAdmin } from '@/lib/supabase'
import { saveToCache } from '@/lib/audio-cache'

// POST /api/admin/cache-conversation
// Body: { conversation_id, text, voice_id? }
// Purpose: Re-generate audio via ElevenLabs and mark as cached

const DEFAULT_VOICE_ID = 'jbJMQWv1eS4YjQ6PCcn6' // Gülsu

export async function POST(req: NextRequest) {
  try {
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

    const vid = voice_id || DEFAULT_VOICE_ID
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

    // 2. Save to disk cache
    saveToCache(text, buffer)

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
      slug: text.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 80) + '.mp3',
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
