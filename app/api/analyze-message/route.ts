import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { getAnthropicClient } from '@/lib/anthropic'

// ── Çıktı şeması ────────────────────────────────────────────────────────────
const ExtractionSchema = z.object({
  is_reservation_request: z
    .boolean()
    .describe('Mesaj bir rezervasyon talebi mi?'),
  name: z
    .string()
    .nullable()
    .describe('Müşterinin tam adı, bulunamazsa null'),
  date: z
    .string()
    .nullable()
    .describe('Rezervasyon tarihi YYYY-MM-DD formatında, bulunamazsa null'),
  time: z
    .string()
    .nullable()
    .describe('Rezervasyon saati HH:MM formatında, bulunamazsa null'),
  party_size: z
    .number()
    .nullable()
    .describe('Kaç kişilik rezervasyon, bulunamazsa null'),
  phone: z
    .string()
    .nullable()
    .describe('Telefon numarası, bulunamazsa null'),
  notes: z
    .string()
    .nullable()
    .describe('Ekstra notlar (alerji, özel istek vb.), bulunamazsa null'),
  confidence: z
    .number()
    .describe('Çıkarımın güven skoru 0 ile 1 arasında'),
  raw_date_text: z
    .string()
    .nullable()
    .describe('Mesajda geçen ham tarih ifadesi (ör. "yarın", "cuma akşamı")'),
})

// ── Sistem promptu ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sen bir restoran rezervasyon asistanısın.
Görevin: Türkçe veya İngilizce müşteri mesajlarından rezervasyon bilgilerini eksiksiz çıkarmak.

Kurallar:
- Bugünün tarihi: ${new Date().toISOString().split('T')[0]}
- "Yarın", "öbür gün", "cuma" gibi göreceli tarihleri mutlak YYYY-MM-DD'ye çevir
- Saat yoksa null bırak; tahmin etme
- Kişi sayısı yoksa null bırak; varsayma
- is_reservation_request: yalnızca net rezervasyon talepleri için true (bilgi sorguları false)
- confidence: tüm zorunlu alanlar (name, date, party_size) doluysa 0.9+, eksikler varsa daha düşük
- Sadece mesajda geçen bilgileri çıkar; ekleme yapma`

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message: string = body?.message

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'message alanı boş olamaz' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'message en fazla 2000 karakter olabilir' },
        { status: 400 }
      )
    }

    const client = getAnthropicClient()

    const response = await client.messages.parse({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: message.trim(),
        },
      ],
      output_config: {
        format: zodOutputFormat(ExtractionSchema),
      },
    })

    const extracted = response.parsed_output

    if (!extracted) {
      return NextResponse.json(
        { error: 'Mesaj analiz edilemedi' },
        { status: 422 }
      )
    }

    return NextResponse.json({
      success: true,
      data: extracted,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[analyze-message]', err)
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu', _debug: msg },
      { status: 500 }
    )
  }
}
