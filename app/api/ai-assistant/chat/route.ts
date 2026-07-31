import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { WorkingHours } from '@/types'
import { checkCache } from '@/lib/audio-cache'
import { logConversation, type Channel, type ResponseSource } from '@/lib/conversation-logger'

// ─── In-memory cache (1 saat) ─────────────────────────────────────
const cache = new Map<string, { data: BusinessData; ts: number }>()
const CACHE_TTL = 3600_000

interface BusinessData {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  working_hours: WorkingHours | null
  assistant_name: string | null
}

async function getBusiness(slug: string): Promise<BusinessData | null> {
  const cached = cache.get(slug)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('restaurants')
    .select('id, name, slug, phone, address, working_hours, ai_assistant_name')
    .eq('slug', slug)
    .single()

  if (!data) return null

  const biz: BusinessData = {
    id: (data as Record<string, unknown>).id as string,
    name: (data as Record<string, unknown>).name as string,
    slug: (data as Record<string, unknown>).slug as string,
    phone: (data as Record<string, unknown>).phone as string | null,
    address: (data as Record<string, unknown>).address as string | null,
    working_hours: (data as Record<string, unknown>).working_hours as WorkingHours | null,
    assistant_name: (data as Record<string, unknown>).ai_assistant_name as string | null,
  }

  cache.set(slug, { data: biz, ts: Date.now() })
  return biz
}

function saatYanit(wh: WorkingHours | null): string | null {
  if (!wh) return null
  const gunler: Record<string, string> = {
    monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba',
    thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar',
  }
  const acikGunler: string[] = []
  for (const [day, h] of Object.entries(wh)) {
    const wd = h as { open?: boolean; start?: string; end?: string }
    if (wd.open) {
      acikGunler.push(`${gunler[day] ?? day} ${wd.start ?? '?'}-${wd.end ?? '?'}`)
    }
  }
  if (acikGunler.length === 0) return 'Şu anda kapalıyız.'
  return `Çalışma saatlerimiz:\n${acikGunler.map(g => `  • ${g}`).join('\n')}`
}

// POST /api/ai-assistant/chat
// Body: { text, restaurant_slug, session_id?, turn_number?, channel? }

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { text, restaurant_slug, session_id, turn_number, channel } = body
  if (!text || !restaurant_slug) {
    return NextResponse.json({ error: 'text and restaurant_slug required' }, { status: 400 })
  }

  const biz = await getBusiness(restaurant_slug)
  if (!biz) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })

  const lower = text.toLowerCase()
  const asistanAdi = biz.assistant_name ?? 'Asistan'

  // Helper: log + respond in one call
  const bid = biz.id
  async function respond(reply: string, source: ResponseSource) {
    logConversation({
      restaurant_id: bid,
      session_id,
      turn_number,
      channel: channel ?? 'web_chat',
      user_message: text,
      assistant_response: reply,
      response_source: source,
    })
    return NextResponse.json({ response: reply, cached: checkCache(reply) })
  }

  // ─── Keyword-based replies (DB'den, token harcamaz) ──────────
  if (/saat|kaçta|açık mı|kapalı|çalışma|mesai|ne zaman/i.test(lower)) {
    const yanit = saatYanit(biz.working_hours)
    return respond(yanit ?? 'Çalışma saatlerimiz hakkında bilgi alamadım.', 'cache')
  }

  if (/telefon|numara|ara|ulaş/i.test(lower)) {
    return respond(`Bize ${biz.phone ?? 'telefon numaramızdan'} ulaşabilirsiniz.`, 'cache')
  }

  if (/adres|nerede|konum|yol/i.test(lower)) {
    return respond(`Adresimiz: ${biz.address ?? 'Adres bilgisi bulunamadı'}`, 'cache')
  }

  if (/rezervasyon|masa|randevu|kayıt|yer ayırt/i.test(lower)) {
    return respond(`https://checkrezerve.com/tr/${biz.slug} adresinden online rezervasyon yapabilirsiniz.`, 'cache')
  }

  if (/merhaba|selam|günaydın/i.test(lower)) {
    return respond(`Merhaba! Ben ${asistanAdi}. ${biz.name}'a hoş geldiniz. Size nasıl yardımcı olabilirim?`, 'cache')
  }

  // ─── DeepSeek API ─────────────────────────────────────────────
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  if (!deepseekKey) {
    return respond(`Üzgünüm, şu anda size yanıt veremiyorum. Lütfen ${biz.phone ?? 'telefonla'} ulaşın.`, 'cache')
  }

  const systemPrompt = `Sen ${biz.name} işletmesinin sesli asistanısın, adın ${asistanAdi}.
Müşterilerin sorularını kısa ve net yanıtla (en fazla 2 cümle).

İşletme:
- Ad: ${biz.name}
- Telefon: ${biz.phone ?? 'Yok'}
- Adres: ${biz.address ?? 'Yok'}
- Web: https://checkrezerve.com/tr/${biz.slug}

Sadece bu işletme hakkında konuş. Rezervasyon için web sitesine yönlendir.`

  try {
    const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!aiRes.ok) {
      throw new Error(`DeepSeek API error: ${aiRes.status}`)
    }

    const aiData = await aiRes.json()
    const reply = (aiData.choices?.[0]?.message?.content as string) ?? 'Yanıt alınamadı.'
    return respond(reply, 'ai')
  } catch {
    return respond(`Üzgünüm, şu anda size yanıt veremiyorum. Lütfen ${biz.phone ?? 'telefonla'} ulaşın.`, 'cache')
  }
}
