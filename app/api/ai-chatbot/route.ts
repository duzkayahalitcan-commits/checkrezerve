import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkGreeting, searchFaq } from '@/lib/faq-search'
import { rateLimit } from '@/lib/rate-limit'

async function callClaude(systemPrompt: string, messages: {role: string, content: string}[]) {
  const apiMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    .slice(-10)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: apiMessages,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    console.error('[ai-chatbot] Claude error:', res.status, errText)
    throw new Error(`Claude error: ${res.status}`)
  }
  const json = await res.json()
  // Anthropic returns: { content: [{ type: 'text', text: '...' }] }
  const textBlock = json.content?.find((b: { type: string }) => b.type === 'text')
  return textBlock?.text ?? 'Yanıt oluşturulamadı.'
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { prefix: 'ai-chatbot', max: 30, windowMs: 60_000 })
  if (limited) return limited

  try {
    const { restaurant_id, messages } = await request.json()

    if (!restaurant_id || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'restaurant_id and messages required' }, { status: 400 })
    }

    // ── 1. Feature flag kontrolü ──────────────────────────────────────────
    const db = getSupabaseAdmin()
    const { data: flagRow } = await db
      .from('feature_flags')
      .select('enabled')
      .eq('restaurant_id', restaurant_id)
      .eq('feature', 'ai_chatbot')
      .maybeSingle()

    if (!flagRow?.enabled) {
      return NextResponse.json({ error: 'AI Chatbot bu işletme için aktif değil.' }, { status: 403 })
    }

    // ── 2. İşletme bilgilerini çek ───────────────────────────────────────
    const { data: biz } = await db
      .from('restaurants')
      .select('name, business_type')
      .eq('id', restaurant_id)
      .single()

    const businessName = biz?.name ?? 'İşletme'
    const businessType = biz?.business_type ?? 'genel'

    // ── 3. FAQ / greeting check ──────────────────────────────────────────
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    if (lastUserMsg) {
      const greeting = checkGreeting(lastUserMsg.content)
      if (greeting) return NextResponse.json({ message: greeting })
      const faqAnswer = await searchFaq(lastUserMsg.content)
      if (faqAnswer) return NextResponse.json({ message: faqAnswer })
    }

    // ── 4. Sistem prompt'u oluştur ───────────────────────────────────────
    const systemPrompt = `Sen ${businessName} adlı ${businessType} işletmesinin yapay zeka asistanısın. Türkçe, kısa ve samimi cevaplar ver. Her mesaja tek bir kısa cevap ver, uzun paragraflar yazma.

İşletme: ${businessName}
Tür: ${businessType}

KESİN KURAL: Sen sadece bilgi verir ve yönlendirirsin. Asla "rezervasyonunuz onaylandı", "kaydettim", "oluşturuldu" deme. Rezervasyonu sayfadaki form yapar. Kullanıcıyı forma yönlendir: "Sayfadaki formu doldurarak rezervasyon yapabilirsiniz."

SADECE bu işletme hakkında bilgi ver, başka işletmeler hakkında konuşma.`

    // ── 5. Claude'a sor ──────────────────────────────────────────────────
    try {
      const message = await callClaude(systemPrompt, messages)
      return NextResponse.json({ message })
    } catch (aiError) {
      console.error('[ai-chatbot]', aiError)
      return NextResponse.json({ message: 'Şu an yanıt veremiyorum, lütfen biraz sonra tekrar deneyin.' })
    }
  } catch (error) {
    console.error('[ai-chatbot]', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
