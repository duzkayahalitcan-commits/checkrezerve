import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import { checkGreeting, searchFaq } from '@/lib/faq-search'
import { findAudioFile, type AudioVoice } from '@/lib/audio-sentences'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'EXAVITQu4vr4xnSDxMaL'

async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
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
    const {
      text,
      businessName = 'İşletme',
      businessType = 'genel',
      messages = [],
      voice = 'yunus',
    } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Metin boş olamaz' }, { status: 400 })
    }

    // Kademe 0: Selamlama
    let answer = checkGreeting(text)

    // Kademe 1-2: FAQ arama
    if (!answer) answer = await searchFaq(text)

    // Kademe 3: Claude — konuşma geçmişiyle
    if (!answer) {
      try {
        const history = (messages as { role: string; content: string }[])
          .slice(-10)
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

        const lastInHistory = history[history.length - 1]
        const needsAppend = !lastInHistory || lastInHistory.role !== 'user' || lastInHistory.content !== text
        if (needsAppend) history.push({ role: 'user', content: text })

        const aiRes = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          system: `Sen ${businessName} adlı ${businessType} işletmesinin sesli asistanısın. Türkçe, kısa (1-2 cümle) ve net cevaplar ver. Randevu veya rezervasyon için gerekli bilgileri (isim, tarih, saat) adım adım sor.`,
          messages: history,
        })
        answer = aiRes.content[0].type === 'text'
          ? aiRes.content[0].text
          : 'Anlayamadım, tekrar söyler misiniz?'
      } catch (claudeErr) {
        console.warn('[voice] Claude fallback başarısız:', claudeErr)
        answer = 'Şu an bu soruyu yanıtlayamıyorum, lütfen daha sonra tekrar deneyin.'
      }
    }

    // Pre-generated audio varsa doğrudan sun, yoksa ElevenLabs'a düş
    const audioVoice = (['yunus', 'mert', 'lisa', 'gulsu'].includes(voice) ? voice : 'yunus') as AudioVoice
    const audioFile = findAudioFile(answer, businessType, audioVoice)

    if (audioFile) {
      console.log(`[voice] pre-generated: ${audioFile}`)
      const audioBuffer = fs.readFileSync(audioFile)
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(audioBuffer.byteLength),
          'X-Answer-Text': encodeURIComponent(answer),
          'X-Audio-Source': 'pregenerated',
        },
      })
    }

    console.log('[voice] ElevenLabs TTS kullanılıyor')
    const audioBuffer = await textToSpeech(answer)

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'X-Answer-Text': encodeURIComponent(answer),
        'X-Audio-Source': 'elevenlabs',
      },
    })
  } catch (error) {
    console.error('[voice]', error)
    return NextResponse.json({ error: 'Sesli yanıt oluşturulamadı' }, { status: 500 })
  }
}
