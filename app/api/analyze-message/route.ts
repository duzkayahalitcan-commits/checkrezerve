import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

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
    .describe('Telefon numarası E.164 formatında, bulunamazsa null'),
  notes: z
    .string()
    .nullable()
    .describe('Ekstra notlar (alerji, özel istek, sürpriz vb.), bulunamazsa null'),
  confidence: z
    .number()
    .describe('Çıkarımın güven skoru 0 ile 1 arasında'),
  raw_date_text: z
    .string()
    .nullable()
    .describe('Mesajda geçen ham tarih ifadesi (ör. "yarın", "cuma akşamı")'),
  missing_fields: z
    .array(z.string())
    .describe('Eksik zorunlu alanlar: name, phone, date, time, party_size'),
  reply: z
    .string()
    .describe('Müşteriye gönderilecek yanıt mesajı, max 160 karakter'),
})

// ── Sistem promptu ───────────────────────────────────────────────────────────
// Tarih her istekte taze hesaplanır (module-scope'da sabitlenmez) — böylece
// server gece yarısını geçse bile 'Bugünün tarihi' bayat kalmaz.
function getSystemPrompt(): string {
  const today = new Date().toISOString().split('T')[0]
  return `Sen "checkrezerve" ekosisteminin rezervasyon asistanısın. Bugünün tarihi: ${today}

KİŞİLİK: Sofistike, profesyonel ve çözüm odaklı. Bir "yardımcı" değil, süreci yöneten bir "uzman" gibi davran. Kısa, öz ama anlam derinliği yüksek cümleler kur.

ÇIKARIM KURALLARI:
- Türkçe veya İngilizce mesajları işle
- "Yarın", "öbür gün", "cuma" gibi göreceli tarihleri kesin YYYY-MM-DD'ye çevir
- TARİH KURALI: "yarın" = Bugün+1, "öbür gün" = Bugün+2, "bugün" = Bugün. Haftanın günü (cuma vb.) bu haftaki ilgili gün olarak hesapla.
- Telefon numarasını E.164 formatına normalize et (+905321234567)
- Saat/kişi yoksa null bırak; tahmin etme
- is_reservation_request: net rezervasyon talebi için true, bilgi sorgusu için false
- confidence: name + date + party_size doluysa 0.9+, eksikler varsa daha düşük
- missing_fields: eksik zorunlu alanları listele
- Sadece mesajda geçen bilgileri çıkar; ekleme yapma

YANIT (reply) KURALLARI:
- Tüm alanlar doluysa: zarif, kısa bir onay mesajı
- Eksik alan varsa: tek seferde, nezaketle sor ("Sizi en iyi şekilde ağırlayabilmemiz için [ALAN] bilgisini de paylaşabilir misiniz?")
- Özel istek varsa (evlilik teklifi, sürpriz vb.): notes alanına kaydet, reply'da "Özel talebinizi ekibimize ilettim" de
- Asla "Hayır" deme; alternatif çözüm öner
- Max 160 karakter`
}

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, { prefix: 'analyze-message', max: 20, windowMs: 60_000 })
    if (limited) return limited
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

    // DeepSeek API ile bilgileri çıkar (JSON mode)
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured')

    const deepSeekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        max_tokens: 1024,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${getSystemPrompt()}\n\nYanıtını yalnızca aşağıdaki JSON şemasına uygun olarak döndür:\n${JSON.stringify(ExtractionSchema.shape)}` },
          { role: 'user', content: message.trim() },
        ],
      }),
    })

    if (!deepSeekRes.ok) throw new Error(`DeepSeek error: ${deepSeekRes.status}`)
    const deepSeekJson = await deepSeekRes.json()

    const parsedJson = JSON.parse(deepSeekJson.choices?.[0]?.message?.content ?? '{}')
    const extracted = ExtractionSchema.parse(parsedJson)

    if (!extracted) {
      return NextResponse.json(
        { error: 'Mesaj analiz edilemedi' },
        { status: 422 }
      )
    }

    return NextResponse.json({
      success: true,
      data: extracted,
      reply: extracted.reply,
      usage: {
        input_tokens: deepSeekJson.usage?.prompt_tokens ?? 0,
        output_tokens: deepSeekJson.usage?.completion_tokens ?? 0,
      },
    })
  } catch (err) {
    console.error('[analyze-message]', err)
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}
