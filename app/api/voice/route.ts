import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { checkGreeting, searchFaq } from '@/lib/faq-search'
import { findAudioFile, type AudioVoice } from '@/lib/audio-sentences'
import { rateLimit } from '@/lib/rate-limit'
import { detectGibberish, normalizeText } from '@/lib/assistant-brain'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_IDS: Record<string, string> = {
  yunus: '5nr6ATQepuidiLb6OT3B', mert: '01p4omegjS2n3rSDCM5u',
  lisa: 'q5GI4RAWrMYEY5xaGcma', gulsu: 'jbJMQWv1eS4YjQ6PCcn6',
}

async function callDeepSeek(systemPrompt: string, messages: {role: string, content: string}[]) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 256, temperature: 0.2, messages: [{ role: 'system', content: systemPrompt }, ...messages] }),
  })
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`)
  return (await res.json()).choices[0].message.content
}

async function textToSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  })
  if (!res.ok) throw new Error(`ElevenLabs: ${await res.text()}`)
  return res.arrayBuffer()
}

function buildSystemPrompt(name: string, type: string, lang: string): string {
  const prompts: Record<string, string> = {
    ar: `أنت مساعد صوتي لمنشأة ${name}. جملة واحدة فقط.`,
    da: `Du er stemmeassistent for ${name}. Kun ét svar.`,
    es: `Eres asistente de voz para ${name}. Solo una frase.`,
    ru: `Вы голосовой ассистент ${name}. Одно предложение.`,
    en: `You are voice assistant for ${name}. One sentence only.`,
    de: `Sie sind Sprachassistent für ${name}. Nur ein Satz.`,
  }
  // W-78: TR sesli asistan — adım adım bilgi topla, özet onaylanmadan asla "oluşturuldu" deme.
  return prompts[lang] ?? `Sen ${name} adlı ${type} işletmesinin sesli asistanısın. KISA tek cümleyle cevap ver, sesli okunur.
KURALLAR:
- Rezervasyon için sırayla bilgi topla (kişi→tarih→saat→isim→telefon), her turda TEK soru sor. Eksik bilgiyle asla "oluşturuldu" deme.
- İsim öğrenilince "{isim} Bey/Hanım" diye hitap et.
- Tüm bilgiler toplanınca ÖNCE özet ver ve onay iste: "Onaylıyor musunuz?" Onay (evet/olur/onaylıyorum) gelmeden ASLA "Rezervasyonunuz oluşturuldu" deme.
- Onay sonrası: "Rezervasyonunuz oluşturuldu. İyi günler."
- Anlamsız/saçma mesajda: "Sizi tam anlayamadım, tekrar eder misiniz?" de, tahmin yürütme.
- Veda: "İyi günler."`
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { prefix: 'voice', max: 15, windowMs: 60_000 })
  if (limited) return limited
  try {
    const { text, businessName = 'İşletme', businessType = 'genel', messages = [], voice = 'yunus', lang = 'tr' } = await request.json()
    if (!text?.trim()) return NextResponse.json({ error: 'Metin boş' }, { status: 400 })
    const isMultilang = ['ar','da','en','de','es','ru'].includes(lang)
    let answer: string | null = null
    // W-78: Saçma / anlamsız sesli mesaj koruması
    if (!isMultilang && detectGibberish(text)) {
      answer = 'Sizi tam anlayamadım, tekrar eder misiniz?'
    }
    if (!isMultilang && !answer) {
      answer = checkGreeting(text)
      if (!answer) answer = await searchFaq(text)
    }
    if (!answer) {
      try {
        const history = (messages as {role:string,content:string}[]).slice(-10).filter(m => m.role==='user'||m.role==='assistant')
        const last = history[history.length-1]
        if (!last || last.role!=='user' || last.content!==text) history.push({role:'user',content:text})
        answer = await callDeepSeek(buildSystemPrompt(businessName, businessType, lang), history)
      } catch(err) {
        console.warn('[voice] DeepSeek fallback:', err)
        answer = 'Şu an yanıt veremiyorum, lütfen daha sonra tekrar deneyin.'
      }
    }
    const safeAnswer = answer ?? 'Anlayamadım, tekrar söyler misiniz?'
    const audioVoice = (['yunus','mert','lisa','gulsu'].includes(voice) ? voice : 'yunus') as AudioVoice
    const audioFile = findAudioFile(safeAnswer, businessType, audioVoice, lang)
    if (audioFile) {
      const buf = fs.readFileSync(audioFile)
      return new NextResponse(buf, { headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(buf.byteLength), 'X-Answer-Text': encodeURIComponent(safeAnswer), 'X-Audio-Source': 'pregenerated' } })
    }
    const audioBuf = await textToSpeech(safeAnswer, VOICE_IDS[voice] || VOICE_IDS.yunus)
    return new NextResponse(new Uint8Array(audioBuf), { headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(audioBuf.byteLength), 'X-Answer-Text': encodeURIComponent(safeAnswer), 'X-Audio-Source': 'elevenlabs' } })
  } catch(error) {
    console.error('[voice]', error)
    return NextResponse.json({ error: 'Sesli yanıt oluşturulamadı' }, { status: 500 })
  }
}
