import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// POST /api/ai-assistant/initiate
// Body: { restaurant_id, assistant_name, voice }
// Returns: system prompt and assistant info for n8n/web frontend
// TODO: n8n ElevenLabs + Whisper entegrasyonu buraya eklenecek

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { prefix: 'ai-initiate', max: 30, windowMs: 60_000 })
  if (limited) return limited
  const body = await req.json()
  const { restaurant_id, assistant_name, voice, slug } = body

  if (!restaurant_id && !slug) {
    return NextResponse.json({ error: 'restaurant_id or slug required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  let query = db.from('restaurants').select('id, name, slug, phone, address, ai_assistant_name, ai_assistant_voice')

  if (restaurant_id) {
    query = query.eq('id', restaurant_id)
  } else {
    query = query.eq('slug', slug)
  }

  const { data: restaurant } = await query.single()
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  }

  const asistanAdi = assistant_name || (restaurant as Record<string, unknown>).ai_assistant_name || 'Asistan'
  const ses = voice || (restaurant as Record<string, unknown>).ai_assistant_voice || 'yunus'

  const systemPrompt = `Sen ${(restaurant as Record<string, unknown>).name} işletmesinin sesli asistanısın.
Adın ${asistanAdi}. Müşterilerin sorularını Türkçe olarak yanıtla.

İşletme bilgileri:
- İşletme: ${(restaurant as Record<string, unknown>).name}
- Adres: ${(restaurant as Record<string, unknown>).address || 'Belirtilmemiş'}
- Telefon: ${(restaurant as Record<string, unknown>).phone || 'Belirtilmemiş'}
- Rezervasyon: https://checkrezerve.com/tr/${(restaurant as Record<string, unknown>).slug}

Sadece bu işletme hakkında konuş. Müşteri rezervasyon yapmak isterse yönlendir.`

  return NextResponse.json({
    success: true,
    message: 'Asistan hazırlanıyor',
    assistant_name: asistanAdi,
    voice: ses,
    system_prompt: systemPrompt,
    restaurant: {
      id: (restaurant as Record<string, unknown>).id,
      name: (restaurant as Record<string, unknown>).name,
      slug: (restaurant as Record<string, unknown>).slug,
    },
  })
}
