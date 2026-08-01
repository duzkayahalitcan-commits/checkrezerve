import { NextRequest, NextResponse } from 'next/server'

// POST /api/ai-assistant/transcribe
// Body: FormData with audio blob field "audio_file"
// Sends audio to local Whisper server, returns transcribed text

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const formData = await req.formData()
  const audioFile = formData.get('audio_file') as Blob | null

  if (!audioFile) {
    return NextResponse.json({ error: 'audio file required' }, { status: 400 })
  }

  const whisperUrl = process.env.WHISPER_SERVER_URL ?? 'http://checkrezerve-whisper:9000'

  try {
    const whisperForm = new FormData()
    whisperForm.append('audio_file', audioFile, 'recording.webm')

    const res = await fetch(`${whisperUrl}/asr?encode=true&task=transcribe&language=tr&output=json`, {
      method: 'POST',
      body: whisperForm,
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `Whisper error: ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    console.log(`[transcribe] whisper total=${Date.now() - t0}ms size=${audioFile.size}`)
    return NextResponse.json({ text: (data.text ?? data) as string })
  } catch (e) {
    return NextResponse.json({ error: `Connection failed: ${(e as Error).message}` }, { status: 502 })
  }
}
