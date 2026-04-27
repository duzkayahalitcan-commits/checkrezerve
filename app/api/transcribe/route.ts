import { NextRequest, NextResponse } from 'next/server'

const WHISPER_URL = process.env.WHISPER_SERVER_URL ?? 'http://localhost:5001'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const whisperRes = await fetch(`${WHISPER_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    })

    if (!whisperRes.ok) {
      const err = await whisperRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: (err as { error?: string }).error ?? 'Ses metne çevrilemedi' },
        { status: 500 }
      )
    }

    const data = await whisperRes.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[transcribe]', error)
    return NextResponse.json({ error: 'Ses işlenemedi' }, { status: 500 })
  }
}
