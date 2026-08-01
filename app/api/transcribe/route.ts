import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const WHISPER_URL = process.env.WHISPER_SERVER_URL ?? 'http://localhost:5001'

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { prefix: 'transcribe', max: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const formData = await request.formData()

    const audioFile = formData.get('audio')
    if (!audioFile) {
      return NextResponse.json({ error: 'Ses dosyası bulunamadı' }, { status: 400 })
    }

    const whisperForm = new FormData()
    whisperForm.append('audio_file', audioFile as Blob)

    const whisperRes = await fetch(
      `${WHISPER_URL}/asr?encode=true&task=transcribe&language=tr&output=json&initial_prompt=${encodeURIComponent('Restoran rezervasyon asistanı. Türkçe konuşma.')}`,
      { method: 'POST', body: whisperForm }
    )

    if (!whisperRes.ok) {
      const errText = await whisperRes.text()
      console.error('[transcribe] whisper error:', whisperRes.status, errText)
      return NextResponse.json({ error: 'Ses metne çevrilemedi' }, { status: 500 })
    }

    const data = await whisperRes.json()
    
    // Düşük güven skorlu sonuçları filtrele
    if (data.segments) {
      const avgNoSpeech = data.segments.reduce((a: number, s: { no_speech_prob: number }) => a + s.no_speech_prob, 0) / data.segments.length
      if (avgNoSpeech > 0.6) {
        return NextResponse.json({ text: '' })
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('[transcribe]', error)
    return NextResponse.json({ error: 'Ses işlenemedi' }, { status: 500 })
  }
}
