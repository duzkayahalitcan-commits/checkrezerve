import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { searchFaq } from '@/lib/faq-search'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  if (!apiKey || !voiceId) throw new Error('ElevenLabs yapılandırılmamış')

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs hatası: ${err}`)
  }

  return res.arrayBuffer()
}

export async function POST(request: NextRequest) {
  try {
    const { text, businessName = 'İşletme', businessType = 'genel' } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Metin boş olamaz' }, { status: 400 })
    }

    // 1. FAQ semantic search
    let answer = await searchFaq(text)

    // 2. Claude fallback
    if (!answer) {
      const aiRes = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: `Sen ${businessName} adlı ${businessType} işletmesinin sesli asistanısın. Türkçe, kısa (1-2 cümle) ve net cevaplar ver.`,
        messages: [{ role: 'user', content: text }],
      })
      answer = aiRes.content[0].type === 'text'
        ? aiRes.content[0].text
        : 'Anlayamadım, tekrar söyler misiniz?'
    }

    // 3. TTS
    const audioBuffer = await textToSpeech(answer)

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'X-Answer-Text': encodeURIComponent(answer),
      },
    })
  } catch (error) {
    console.error('[voice]', error)
    return NextResponse.json({ error: 'Sesli yanıt oluşturulamadı' }, { status: 500 })
  }
}
