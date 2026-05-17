import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import { checkGreeting, searchFaq } from '@/lib/faq-search'
import { findAudioFile, type AudioVoice } from '@/lib/audio-sentences'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'

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

const LANG_SYSTEM_PROMPTS: Record<string, (name: string, type: string) => string> = {
  ar: (name, type) => `أنت مساعد صوتي لمنشأة اسمها ${name} من نوع ${type}.

القاعدة: كل إجابة جملة واحدة فقط. لا مقدمات ولا شرح إضافي.

استخدم هذه الجمل حرفياً عند جمع المعلومات:
- الاسم: "هل يمكنني معرفة اسمك الأول والأخير؟"
- التاريخ: "في أي تاريخ تريد حجز موعد؟"
- الوقت: "ما هو توقيتك المفضل؟"
- الهاتف: "هل يمكنني الحصول على رقم هاتفك؟"
- عدد الأشخاص: "لكم شخص تريد الحجز؟"
- التأكيد: "تم إنشاء حجزك بنجاح."
- ممتلئ: "آسف، الوقت الذي اخترته محجوز. هل يمكننا تجربة وقت آخر؟"
- لم أفهم: "لم أتمكن من التحقق من المعلومات التي أدخلتها، هل يمكنك تكرارها؟"
- وداع: "شكراً لك، نتمنى لك يوماً سعيداً."
- إلغاء: "أفهم أنك تريد إلغاء حجزك."`,

  da: (name, type) => `Du er en stemmeassistent for virksomheden ${name} af typen ${type}.

REGEL: Hvert svar må kun bestå af én sætning. Ingen indledning eller ekstra forklaringer.

Brug disse sætninger ordret, når du indsamler oplysninger:
- Navn: "Må jeg spørge om dit fornavn og efternavn?"
- Dato: "Hvilken dato ønsker du at bestille en tid?"
- Tid: "Hvad er dit foretrukne tidspunkt?"
- Telefon: "Må jeg få dit telefonnummer?"
- Antal personer: "Hvor mange personer vil du reservere til?"
- Bekræftelse: "Din reservation er blevet oprettet."
- Optaget: "Undskyld, det valgte tidspunkt er optaget. Kan vi prøve et andet tidspunkt?"
- Forstod ikke: "Jeg kunne ikke verificere de oplysninger, du har angivet. Kan du sige det igen?"
- Farvel: "Tak, vi ønsker dig en god dag."
- Annullering: "Jeg forstår, at du ønsker at annullere din reservation."`,

  es: (name, type) => `Eres un asistente de voz para el negocio ${name} de tipo ${type}.

REGLA: Cada respuesta debe ser únicamente una frase. No añadas introducciones ni explicaciones adicionales.

Usa estas frases exactamente al recopilar información:
- Nombre: "¿Podría decirme su nombre y apellido?"
- Fecha: "¿En qué fecha desea hacer su cita?"
- Hora: "¿Cuál es su horario preferido?"
- Teléfono: "¿Podría darme su número de teléfono?"
- Número de personas: "¿Para cuántas personas desea hacer la reserva?"
- Confirmación: "Su reserva ha sido creada con éxito."
- Ocupado: "Lo siento, el horario seleccionado está ocupado. ¿Podemos probar con otro horario?"
- No entendí: "No he podido verificar la información que ha proporcionado, ¿podría repetirla?"
- Despedida: "Gracias, le deseamos un buen día."
- Cancelación: "Entiendo que desea cancelar su reserva."`,

  ru: (name, type) => `Вы голосовой ассистент заведения ${name} типа ${type}.

ПРАВИЛО: Каждый ответ — только одно предложение. Без вступлений и дополнительных объяснений.

Используйте эти фразы дословно при сборе информации:
- Имя: "Могу я узнать ваше имя и фамилию?"
- Дата: "На какую дату вы хотите записаться?"
- Время: "Какое время вам удобно?"
- Телефон: "Могу я узнать ваш номер телефона?"
- Количество гостей: "На сколько человек вы хотите забронировать?"
- Подтверждение: "Ваше бронирование успешно создано."
- Занято: "Извините, выбранное время занято. Можем ли мы попробовать другое время?"
- Не понял: "Не удалось проверить введённые данные, не могли бы вы повторить?"
- Прощание: "Спасибо, желаем вам хорошего дня."
- Отмена: "Понимаю, что вы хотите отменить бронирование."`,
}

function buildSystemPrompt(businessName: string, businessType: string, lang: string): string {
  const builder = LANG_SYSTEM_PROMPTS[lang]
  if (builder) return builder(businessName, businessType)

  return `Sen ${businessName} adlı ${businessType} işletmesinin sesli asistanısın.

KURAL: Her yanıt YALNIZCA tek bir cümle olmalı. Giriş, karşılama veya ek açıklama EKLEME.

Bilgi toplarken bu cümleleri TAM OLARAK kullan, hiçbir şey ekleme:
- İsim: "Adınızı ve soyadınızı öğrenebilir miyim?"
- Tarih: "Hangi tarihte randevu almak istersiniz?"
- Saat: "Saat tercihiniz nedir?"
- Telefon: "Telefon numaranızı alabilir miyim?"
- Kişi sayısı: "Kaç kişilik rezervasyon yapmak istersiniz?"
- Onay: "Rezervasyonunuz başarıyla oluşturuldu."
- Dolu: "Üzgünüm, seçtiğiniz saat dolu. Başka bir saat deneyebilir miyiz?"
- Anlamadım: "Girdiğiniz bilgileri doğrulayamadım, tekrar söyler misiniz?"
- Veda: "Teşekkür ederiz, iyi günler dileriz."
- İptal: "Rezervasyonunuzu iptal etmek istediğinizi anlıyorum."`
}

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      businessName = 'İşletme',
      businessType = 'genel',
      messages = [],
      voice = 'yunus',
      lang = 'tr',
    } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Metin boş olamaz' }, { status: 400 })
    }

    const isMultilang = ['ar', 'da', 'es', 'ru'].includes(lang)

    // Kademe 0-1: Selamlama + FAQ — sadece Türkçe için
    let answer: string | null = null
    if (!isMultilang) {
      answer = checkGreeting(text)
      if (!answer) answer = await searchFaq(text)
    }

    // Kademe 2: Claude — dile özgü sistem promptuyla
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
          system: buildSystemPrompt(businessName, businessType, lang),
          messages: history,
        })
        answer = aiRes.content[0].type === 'text'
          ? aiRes.content[0].text
          : (isMultilang ? text : 'Anlayamadım, tekrar söyler misiniz?')
      } catch (claudeErr) {
        console.warn('[voice] Claude fallback başarısız:', claudeErr)
        answer = isMultilang ? text : 'Şu an bu soruyu yanıtlayamıyorum, lütfen daha sonra tekrar deneyin.'
      }
    }

    // Pre-generated audio varsa doğrudan sun, yoksa ElevenLabs'a düş
    const safeAnswer = answer ?? (isMultilang ? text : 'Anlayamadım, tekrar söyler misiniz?')
    const audioVoice = (['yunus', 'mert', 'lisa', 'gulsu'].includes(voice) ? voice : 'yunus') as AudioVoice
    const audioFile = findAudioFile(safeAnswer, businessType, audioVoice, lang)

    if (audioFile) {
      console.log(`[voice] pre-generated: ${audioFile}`)
      const audioBuffer = fs.readFileSync(audioFile)
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(audioBuffer.byteLength),
          'X-Answer-Text': encodeURIComponent(safeAnswer),
          'X-Audio-Source': 'pregenerated',
        },
      })
    }

    console.log('[voice] ElevenLabs TTS kullanılıyor')
    const audioBuffer = await textToSpeech(safeAnswer)

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'X-Answer-Text': encodeURIComponent(safeAnswer),
        'X-Audio-Source': 'elevenlabs',
      },
    })
  } catch (error) {
    console.error('[voice]', error)
    return NextResponse.json({ error: 'Sesli yanıt oluşturulamadı' }, { status: 500 })
  }
}
