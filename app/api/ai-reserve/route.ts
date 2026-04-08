import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { getAnthropicClient } from '@/lib/anthropic'
import { getSupabase } from '@/lib/supabase'
import { sendReservationConfirmation } from '@/lib/notification-service'

// ── Giriş şeması ─────────────────────────────────────────────────────────────
const RequestSchema = z.object({
  message:       z.string().min(1).max(2000),
  restaurant_id: z.string().uuid().optional(),
  branch_id:     z.string().uuid().optional(),
})

// ── Claude çıktı şeması ───────────────────────────────────────────────────────
const ExtractionSchema = z.object({
  is_reservation_request: z.boolean(),
  customer_name:    z.string().nullable(),
  phone:            z.string().nullable(),
  date:             z.string().nullable(),   // YYYY-MM-DD
  time:             z.string().nullable(),   // HH:MM
  party_size:       z.number().nullable(),
  special_requests: z.string().nullable(),
  confidence:       z.number(),
  raw_date_text:    z.string().nullable(),
})

const SYSTEM_PROMPT = `Sen bir restoran rezervasyon asistanısın.
Bugünün tarihi: ${new Date().toISOString().split('T')[0]}

Müşteri mesajlarından rezervasyon bilgilerini çıkar:
- "Yarın", "cuma", "öbür gün" gibi göreceli tarihleri YYYY-MM-DD'ye çevir
- Telefon numarasını uluslararası formata normalize et (ör: +905321234567)
- Sadece mesajda açıkça belirtilen bilgileri doldur, tahmin etme
- is_reservation_request: yalnızca net rezervasyon talebi için true`

// ── POST /api/ai-reserve ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Girişi doğrula
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Geçersiz istek', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { message, restaurant_id, branch_id } = parsed.data

    // 2. Claude API ile bilgileri çıkar
    const client = getAnthropicClient()
    const aiResponse = await client.messages.parse({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
      output_config: {
        format: zodOutputFormat(ExtractionSchema),
      },
    })

    const extracted = aiResponse.parsed_output
    if (!extracted) {
      return NextResponse.json({ error: 'Mesaj analiz edilemedi' }, { status: 422 })
    }

    if (!extracted.is_reservation_request) {
      return NextResponse.json({
        success: false,
        is_reservation_request: false,
        message: 'Bu mesaj bir rezervasyon talebi içermiyor.',
        extracted,
      })
    }

    // 3. Supabase'e kaydet
    const supabase = getSupabase()
    const { data: reservation, error: dbError } = await supabase
      .from('reservations')
      .insert({
        customer_name:    extracted.customer_name,
        phone:            extracted.phone,
        date:             extracted.date,
        reserved_time:    extracted.time,
        party_size:       extracted.party_size ?? 1,
        special_requests: extracted.special_requests,
        restaurant_id:    restaurant_id ?? null,
        branch_id:        branch_id ?? null,
        status:           'confirmed',
        source:           'ai',
        original_message: message,
        ai_confidence:    extracted.confidence,
      })
      .select()
      .single()

    if (dbError) {
      // Mükerrer kayıt kontrolü (PostgreSQL unique violation: 23505)
      if (dbError.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'Bu telefon numarasıyla bu gün için zaten bir rezervasyon mevcut.',
            extracted,
          },
          { status: 409 }
        )
      }
      console.error('[ai-reserve] DB error:', dbError)
      return NextResponse.json({ error: 'Rezervasyon kaydedilemedi' }, { status: 500 })
    }

    // 4. SMS bildirimi gönder (opsiyonel, hata fırlatmaz)
    if (extracted.phone && extracted.customer_name) {
      await sendReservationConfirmation({
        to:           extracted.phone,
        customerName: extracted.customer_name,
        date:         extracted.date ?? '',
        time:         extracted.time ?? '',
        partySize:    extracted.party_size ?? 1,
      }).catch((err) => console.warn('[ai-reserve] SMS gönderilemedi:', err))
    }

    return NextResponse.json({
      success: true,
      reservation,
      extracted,
      usage: {
        input_tokens:  aiResponse.usage.input_tokens,
        output_tokens: aiResponse.usage.output_tokens,
      },
    })
  } catch (err) {
    console.error('[ai-reserve]', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
